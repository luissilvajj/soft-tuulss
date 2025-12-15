import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    try {
        const user = await serverSupabaseUser(event)
        if (!user) {
            return { error: 'Unauthorized: No user session' }
        }

        // DEBUG: Strict User ID Check
        if (!user.id) {
            return {
                error: 'User ID Undefined',
                debugUser: user // Dump the whole user object to see what's inside
            }
        }

        const config = useRuntimeConfig()
        const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY
        const url = process.env.SUPABASE_URL

        // DEBUG: Return config status if missing
        if (!serviceKey || !url) {
            return {
                error: 'Configuration Missing',
                debug: {
                    hasServiceKey: !!serviceKey,
                    hasUrl: !!url,
                    serviceKeySource: config.supabaseServiceKey ? 'runtimeConfig' : (process.env.SUPABASE_SERVICE_KEY ? 'env' : 'none')
                }
            }
        }

        const supabaseAdmin = createClient(url, serviceKey)

        const { data, error } = await supabaseAdmin
            .from('organization_members')
            .select(`
                role,
                organization:organizations (
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
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()

        if (error) {
            return { error: 'DB Error: ' + error.message, details: error }
        }

        if (!data || !data.organization) {
            return { error: 'No Organization Found', userId: user.id }
        }

        return {
            ...data.organization,
            role: data.role
        }

    } catch (e: any) {
        return {
            error: 'Server Exception: ' + e.message,
            stack: e.stack
        }
    }
})
