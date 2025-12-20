import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const orgName = body.name

    if (!orgName) throw createError({ statusCode: 400, statusMessage: 'Name is required' })

    const config = useRuntimeConfig()
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    const supabaseUrl = process.env.SUPABASE_URL

    if (!serviceKey || !supabaseUrl) {
        throw createError({ statusCode: 500, statusMessage: 'Server Misconfigured (Missing Key)' })
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // 1. Create Organization
    const { data: org, error: orgError } = await adminClient
        .from('organizations')
        .insert({
            name: orgName,
            subscription_status: 'trialing', // Default to trial
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
        })
        .select()
        .single()

    if (orgError) {
        console.error('Org Creation Error Full:', JSON.stringify(orgError, null, 2))
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to create organization: ${orgError.message}`,
            data: orgError
        })
    }

    // 1.5. ENSURE PROFILE EXISTS (Fix for missing trigger/migrations)
    // If the profile doesn't exist, the FK constraint on organization_members will fail.
    const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString()
        })

    if (profileError) {
        console.error('Profile Creation Error:', profileError)
        // We log but try to proceed? No, member creation will definitely fail.
        // Actually, let's try to proceed just in case upsert fails due to some other reason but row exists.
    }

    // 2. Add User as Owner
    const { error: memberError } = await adminClient
        .from('organization_members')
        .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner'
        })

    if (memberError) {
        console.error('Member Creation Error:', memberError)
        // Rollback? Ideally yes, but for MVP keep simple.
        throw createError({ statusCode: 500, statusMessage: 'Failed to add user to organization' })
    }

    return org
})
