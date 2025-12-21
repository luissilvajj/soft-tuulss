import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // Use standard user client (RLS)
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 1. Try RPC V3 (Nuclear Option - Fresh Function)
    try {
        console.log('[OrgAPI] Calling RPC V3 (Nuclear)...')
        const { data, error } = await client.rpc('get_web_user_organizations_v3', { target_uid: user.id })

        if (!error) {
            console.log('[OrgAPI] RPC V3 Success. Count:', Array.isArray(data) ? data.length : 0)
            return data || []
        }

        console.warn('[OrgAPI] RPC V3 failed, engaging NUCLEAR FALLBACK (Manual Join):', error.message)
    } catch (e) {
        console.warn('[OrgAPI] RPC V3 exception:', e)
    }

    // 2. Fallback: Manual Join (JavaScript side)
    // Avoids DB-side joins (organizations!inner) to bypass complicated RLS recursion
    try {
        console.log('[OrgAPI] Step 1: Fetching Memberships...')
        const { data: members, error: memberError } = await client
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id)

        if (memberError) throw new Error(`Member fetch failed: ${memberError.message}`)

        const myMembers = members || []
        if (myMembers.length === 0) return []

        const orgIds = myMembers.map((m: any) => m.organization_id)
        console.log('[OrgAPI] Step 2: Fetching Organizations for IDs:', orgIds)

        const { data: orgs, error: orgError } = await client
            .from('organizations')
            .select('id, name, subscription_status, logo_url')
            .in('id', orgIds)

        // If getting orgs fails, it might be due to missing columns again.
        // Try ULTRA-SAFE fallback (id, name only) if the above fails
        let myOrgs = orgs
        if (orgError) {
            console.warn('[OrgAPI] Full Org fetch failed, trying restricted fetch:', orgError.message)
            const { data: safeOrgs, error: safeError } = await client
                .from('organizations')
                .select('id, name')
                .in('id', orgIds)

            if (safeError) throw new Error(`Org fetch COMPLETELY failed: ${safeError.message}`)
            myOrgs = safeOrgs
        }

        // Step 3: Merge Data
        const result = myMembers.map((m: any) => {
            const org = (myOrgs || []).find((o: any) => o.id === m.organization_id)
            if (!org) return null // Should not happen given FKs, but safe

            return {
                id: org.id,
                name: org.name,
                subscription_status: org.subscription_status || 'active',
                logo_url: org.logo_url || null,
                role: m.role
            }
        }).filter(Boolean)

        console.log('[OrgAPI] Manual Join Success. Count:', result.length)
        return result

    } catch (e: any) {
        console.error('[OrgAPI] NUCLEAR FALLBACK EXCEPTION:', e)
        // Return empty array to keep app alive instead of 500
        return []
    }
})
