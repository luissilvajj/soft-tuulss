import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    console.log('[OrgAPI] Request received')

    // 0. Safe Authentication
    let user = null
    try {
        user = await serverSupabaseUser(event)
    } catch (e) {
        console.error('[OrgAPI] Auth Error:', e)
        throw createError({ statusCode: 401, statusMessage: 'Authentication Failed' })
    }

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 1. Setup Configuration
    const config = useRuntimeConfig()
    // Check both standard Nuxt env mapping and raw process.env
    const serviceKey = (config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY || '').trim()
    const supabaseUrl = (config.public?.supabase?.url || process.env.SUPABASE_URL || '').trim()

    console.log('[OrgAPI] Config Check | URL:', !!supabaseUrl, '| ServiceKey:', !!serviceKey ? 'Lat: ' + serviceKey.length : 'MISSING')

    // 2. Strategy A: Admin Client (Preferred if Key Exists)
    if (serviceKey && supabaseUrl && !serviceKey.startsWith('sb_secret')) {
        try {
            console.log('[OrgAPI] Strategy A: Admin Client')
            const adminClient = createClient(supabaseUrl, serviceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            const { data: members, error } = await adminClient
                .from('organization_members')
                .select('role, organizations (id, name, subscription_status, logo_url)')
                .eq('user_id', user.id)

            if (error) throw error

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

            console.log('[OrgAPI] Strategy A Success. Items:', result.length)
            return result

        } catch (e: any) {
            console.error('[OrgAPI] Strategy A Failed:', e.message)
            // Fall through to Strategy B
        }
    } else {
        console.warn('[OrgAPI] Strategy A Skipped. Invalid or Missing Key.')
    }

    // 3. Strategy B: User Client (Manual Join Fallback)
    try {
        console.log('[OrgAPI] Strategy B: User Client Manual')
        const client = await serverSupabaseClient(event)

        // Step 1: IDs
        const { data: members, error: memErr } = await client
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id)

        if (memErr) throw memErr

        const myMembers = members || []
        if (myMembers.length === 0) return []

        const orgIds = myMembers.map((m: any) => m.organization_id)

        // Step 2: Details of those IDs
        const { data: orgs, error: orgErr } = await client
            .from('organizations')
            .select('id, name, subscription_status, logo_url')
            .in('id', orgIds)

        // If extended columns fail, try minimal
        let finalOrgs = orgs
        if (orgErr) {
            console.warn('[OrgAPI] Strategy B Extended Fetch failed, trying minimal:', orgErr.message)
            const { data: minOrgs } = await client
                .from('organizations')
                .select('id, name')
                .in('id', orgIds)
            finalOrgs = minOrgs
        }

        // Merge
        const result = myMembers.map((m: any) => {
            const o = (finalOrgs || []).find((x: any) => x.id === m.organization_id)
            if (!o) return null
            return {
                id: o.id,
                name: o.name,
                subscription_status: o.subscription_status || 'active',
                logo_url: o.logo_url || null,
                role: m.role
            }
        }).filter(Boolean)

        console.log('[OrgAPI] Strategy B Success. Items:', result.length)
        return result

    } catch (e: any) {
        console.error('[OrgAPI] Strategy B Failed (CRITICAL):', e.message)
        // 4. Return Empty instead of 500
        return []
    }
})
