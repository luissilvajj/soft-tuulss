import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // Use standard user client (RLS)
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 1. Try RPC V2 (Preferred for performance)
    try {
        console.log('[OrgAPI] Calling RPC V2 for:', user.id)
        const { data, error } = await client.rpc('get_web_user_organizations_v2', { target_uid: user.id })

        if (!error) {
            console.log('[OrgAPI] RPC Success. Count:', Array.isArray(data) ? data.length : 0)
            return data || []
        }

        console.warn('[OrgAPI] RPC V2 failed, attempting fallback query:', error.message)
    } catch (e) {
        console.warn('[OrgAPI] RPC V2 exception, attempting fallback:', e)
    }

    // 2. Fallback: Standard Query (Ultra-Safe)
    // We only select 'id' and 'name' to prevent crashes if columns like 'subscription_status' are missing
    try {
        console.log('[OrgAPI] Executing Fallback Query (Safe Mode)...')
        const { data: members, error: memberError } = await client
            .from('organization_members')
            .select(`
                role,
                organizations!inner (
                    id,
                    name
                )
            `)
            .eq('user_id', user.id)

        if (memberError) {
            console.error('[OrgAPI] Fallback also failed:', memberError)
            throw new Error(memberError.message)
        }

        const fallbackData = (members || []).map((m: any) => ({
            id: m.organizations.id,
            name: m.organizations.name,
            // Provide defaults for missing columns to satisfy the type interface
            subscription_status: 'active',
            logo_url: null,
            role: m.role
        }))

        console.log('[OrgAPI] Fallback Success. Count:', fallbackData.length)
        return fallbackData

    } catch (e: any) {
        console.error('[OrgAPI] FINAL EXCEPTION:', e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Unable to fetch organizations. Both RPC and Fallback failed.',
            data: e.message
        })
    }
})
