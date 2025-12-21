import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // Use standard user client (RLS)
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    try {
        console.log('[OrgAPI] Calling RPC V2 for:', user.id)
        const { data, error } = await client.rpc('get_web_user_organizations_v2', { target_uid: user.id })

        if (error) {
            console.error('[OrgAPI] RPC Error:', error)
            throw createError({
                statusCode: 500,
                statusMessage: `RPC Error: ${error.message}`,
                data: error
            })
        }

        console.log('[OrgAPI] RPC Success. Count:', Array.isArray(data) ? data.length : 0)

        // RPC returns the exact JSON structure we want
        return data || []

    } catch (e: any) {
        console.error('[OrgAPI] EXCEPTION:', e)
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || 'Internal Server Error',
            data: e.message
        })
    }
})
