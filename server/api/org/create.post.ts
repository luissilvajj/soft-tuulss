import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    try {
        const user = await serverSupabaseUser(event)
        if (!user) return { success: false, message: 'Unauthorized' }

        const body = await readBody(event)
        const orgName = body.name

        if (!orgName) return { success: false, message: 'Name is required' }

        const config = useRuntimeConfig()
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
        const supabaseUrl = process.env.SUPABASE_URL

        if (!serviceKey || !supabaseUrl) {
            return { success: false, message: 'Server Misconfigured (Missing Key)' }
        }

        const adminClient = createClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // 1.5. ENSURE PROFILE EXISTS
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Profile Creation Warning:', profileError)
        }

        // 1. Create Organization
        const { data: org, error: orgError } = await adminClient
            .from('organizations')
            .insert({
                name: orgName,
                subscription_status: 'active',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single()

        if (orgError) {
            console.error('Org Creation DB Error:', orgError)
            return { success: false, message: orgError.message, details: orgError, step: 'create_org' }
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
            console.error('Member Creation DB Error:', memberError)
            return { success: false, message: memberError.message, details: memberError, step: 'create_member' }
        }

        return { success: true, org }

    } catch (e: any) {
        console.error('CRITICAL ORG CREATION FAILURE:', e)
        return {
            success: false,
            message: e.message || 'Unknown Server Error',
            details: e.details || e,
            step: 'unknown'
        }
    }
})
