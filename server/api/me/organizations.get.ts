import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    try {
        const user = await serverSupabaseUser(event)
        if (!user) throw createError({ statusCode: 401 })

        const config = useRuntimeConfig()
        const serviceKey = (config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY || '').trim()
        const supabaseUrl = (config.public?.supabase?.url || process.env.SUPABASE_URL || '').trim()

        const fullCols = 'id, name, logo_url, subscription_status, created_at, address, fiscal_doc, phone, receipt_footer'
        const minCols = 'id, name, logo_url, subscription_status, created_at'

        const client = await serverSupabaseClient(event)
        
        // Strategy: Try full, fallback to minimal
        const fetchOrgs = async (supabase: any, cols: string) => {
             return await supabase
                .from('organization_members')
                .select(`role, organizations (${cols})`)
                .eq('user_id', user.id)
        }

        let members = []
        let { data, error } = await fetchOrgs(client, fullCols)
        
        if (error) {
            // Fallback
            const { data: minData } = await fetchOrgs(client, minCols)
            members = minData || []
        } else {
            members = data || []
        }

        return members.map((m: any) => ({
            ...m.organizations,
            role: m.role
        })).filter(o => !!o.id)

    } catch (e) {
        return []
    }
})
