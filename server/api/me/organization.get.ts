import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    try {
        const user = await serverSupabaseUser(event)

        if (!user) {
            return { error: 'Unauthorized: No user session' }
        }

        const client = await serverSupabaseClient(event)
        const userId = user.id

        // --- STRATEGY 1: SERVICE KEY (GOD MODE) ---
        // We try this FIRST because we know RLS/RPC migrations might be missing.
        const config = useRuntimeConfig()
        const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
        const url = process.env.SUPABASE_URL

        if (serviceKey && url) {
            // console.log('OrgFetch: Attempting Service Key Strategy')
            const supabaseAdmin = createClient(url, serviceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            const { data: adminData, error: adminError } = await supabaseAdmin
                .from('organization_members')
                .select(`
                    role,
                    organization: organizations(*)
                `)
                .eq('user_id', userId)
                .limit(1)
                .maybeSingle()

            if (adminData && adminData.organization) {
                // console.log('OrgFetch: Success via Service Key')
                return {
                    ...adminData.organization,
                    role: adminData.role
                }
            }
            if (adminError) {
                console.error('OrgFetch: Service Key Error:', adminError)
            }
        } else {
            console.warn('OrgFetch: Missing Service Key env vars', { hasKey: !!serviceKey, hasUrl: !!url })
        }


        // --- STRATEGY 2: RPC (Legacy / Fallback) ---
        // Only if Service Key failed or returned nothing
        const { data: rpcData } = await client.rpc('get_my_main_organization')
        if (rpcData) return rpcData


        // --- STRATEGY 3: Standard RLS Select (Fallback) ---
        const { data: rlsData } = await client
            .from('organization_members')
            .select(`role, organization: organizations(*)`)
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle()

        if (rlsData && rlsData.organization) {
            return {
                ...rlsData.organization,
                role: rlsData.role
            }
        }

        return null // Explicit null if nothing found (trigger Onboarding)

    } catch (e: any) {
        console.error('Server Exception fetchOrg:', e)
        return {
            error: 'Server Exception: ' + e.message,
            stack: e.stack
        }
    }
})
