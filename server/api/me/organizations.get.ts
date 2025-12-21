import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // 1. Authenticate User
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 2. Use Service Role Client (ADMIN) - Manual Instantiation
    // We manually create the client to ensure we are using the correct keys from RuntimeConfig
    // This avoids "magic" module issues.

    // Try to get keys from multiple sources
    const config = useRuntimeConfig()
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY
    const supabaseUrl = config.public?.supabase?.url || process.env.SUPABASE_URL

    if (!serviceKey || !supabaseUrl) {
        console.error('[OrgAPI] KEY MISSING. URL:', !!supabaseUrl, 'Key:', !!serviceKey)
        // If we don't have the key, we CANNOT proceed with admin fetch.
        // Returning empty array to prevent 500 crash in frontend, but logging the critical error.
        return []
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        console.log('[OrgAPI] Admin Fetch (Manual Client) for user:', user.id)

        // Fetch data using Admin Privileges
        const { data: members, error } = await adminClient
            .from('organization_members')
            .select(`
                role,
                organizations (
                    id,
                    name,
                    subscription_status,
                    logo_url
                )
            `)
            .eq('user_id', user.id)

        if (error) {
            console.error('[OrgAPI] Admin Fetch Error:', error)
            throw new Error(error.message)
        }

        // Map and Format
        const result = (members || []).map((m: any) => {
            if (!m.organizations) return null
            return {
                id: m.organizations.id,
                name: m.organizations.name,
                subscription_status: m.organizations.subscription_status || 'active',
                logo_url: m.organizations.logo_url || null,
                role: m.role
            }
        }).filter(Boolean)

        console.log('[OrgAPI] Admin Success. Count:', result.length)
        return result

    } catch (e: any) {
        console.error('[OrgAPI] CRITICAL ERROR:', e)
        // Return empty array to verify app loads, or throw if you prefer
        // But throwing 500 has been blocking the user, so let's log and return empty if catastrophic.
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch organizations (Admin Mode)',
            data: e.message
        })
    }
})
