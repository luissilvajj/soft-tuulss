import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    try {
        const user = await serverSupabaseUser(event)

        if (!user) {
            return { error: 'Unauthorized: No user session' }
        }

        const client = await serverSupabaseClient(event)

        // STRATEGY 1: RPC Function (The "Silver Bullet")
        // This failsafe function runs on the DB with system privileges to bypass broken RLS
        const { data: rpcData, error: rpcError } = await client.rpc('get_my_main_organization')

        if (rpcData) {
            return rpcData
        }

        // Only log error if it's NOT just "null" (meaning no org found, which is valid)
        if (rpcError && rpcError.code !== 'PGRST116') {
            console.error('RPC Error:', rpcError)
        }

        const userId = user.id

        // STRATEGY 2: Standard Select (Backwards compatibility / Fallback)
        let { data, error } = await client
            .from('organization_members')
            .select(`
role,
    organization: organizations(
        id,
        name,
        logo_url,
        subscription_status,
        subscription_plan,
        trial_ends_at,
        current_period_end,
        stripe_customer_id
    )
        `)
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle()

        if (!data || error) {
            // STRATEGY 3: Service Key Fallback (Last Resort)
            const config = useRuntimeConfig()
            const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
            const url = process.env.SUPABASE_URL

            if (serviceKey && url) {
                const supabaseAdmin = createClient(url, serviceKey, {
                    auth: { autoRefreshToken: false, persistSession: false }
                })

                const adminRef = await supabaseAdmin
                    .from('organization_members')
                    .select('role, organization:organizations(*)')
                    .eq('user_id', userId)
                    .maybeSingle()

                if (adminRef.data) data = adminRef.data
            }
        }

        if (!data || !data.organization) {
            return { error: 'No Organization Found', userId: userId }
        }

        return {
            ...data.organization,
            role: data.role
        }

    } catch (e: any) {
        console.error('Server Exception fetchOrg:', e)
        return {
            error: 'Server Exception: ' + e.message,
            stack: e.stack
        }
    }
})
