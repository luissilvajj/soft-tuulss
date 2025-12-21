import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Use Service Role to bypass RLS/Relationship issues
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    const supabaseUrl = process.env.SUPABASE_URL

    if (!serviceKey || !supabaseUrl) {
        throw createError({ statusCode: 500, statusMessage: 'Server Config Missing' })
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // Fetch all memberships with org details
    const { data, error } = await adminClient
        .from('organization_members')
        .select(`
            role,
            organization: organizations (
                id,
                name,
                logo_url,
                subscription_status
            )
        `)
        .eq('user_id', user.id)

    if (error) {
        console.error('Organizations List Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `DB Error: ${error.message} (${error.details || 'no details'})`
        })
    }

    // Flatten structure
    return data.map((m: any) => ({
        id: m.organization.id,
        name: m.organization.name,
        logo_url: m.organization.logo_url,
        subscription_status: m.organization.subscription_status,
        role: m.role
    }))
})
