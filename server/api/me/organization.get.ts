import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    try {
        const user = await serverSupabaseUser(event)
        if (!user) return { error: 'Unauthorized' }

        const client = await serverSupabaseClient(event)
        const userId = user.id

        const config = useRuntimeConfig()
        const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
        const url = process.env.SUPABASE_URL

        const fullColumns = 'id, name, logo_url, subscription_status, created_at, address, fiscal_doc, phone, receipt_footer'
        const minimalColumns = 'id, name, logo_url, subscription_status, created_at'

        // helper to fetch
        const fetchOrg = async (supabase: any, cols: string) => {
            return await supabase
                .from('organization_members')
                .select(`role, organization: organizations(${cols})`)
                .eq('user_id', userId)
                .limit(1)
                .maybeSingle()
        }

        // STRATEGY 1: ADMIN CLIENT
        if (serviceKey && url) {
            const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
            
            // Try Full
            const { data, error } = await fetchOrg(admin, fullColumns)
            if (!error && data?.organization) {
                return { ...data.organization, role: data.role }
            }
            
            // Fallback to minimal
            const { data: minData } = await fetchOrg(admin, minimalColumns)
            if (minData?.organization) {
                return { ...minData.organization, role: minData.role }
            }
        }

        // STRATEGY 2: USER CLIENT
        const { data: rlsData, error: rlsError } = await fetchOrg(client, fullColumns)
        if (!rlsError && rlsData?.organization) {
            return { ...rlsData.organization, role: rlsData.role }
        }

        // Final Fallback: Minimal RLS
        const { data: finalData } = await fetchOrg(client, minimalColumns)
        if (finalData?.organization) {
            return { ...finalData.organization, role: finalData.role }
        }

        return null

    } catch (e: any) {
        console.error('Resilient Org Fetch Error:', e)
        return null
    }
})
