import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const config = useRuntimeConfig()
    // Retrieve Service Key from runtime config OR process.env directly (Vercel fallback)
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    // Debug logging (will show in Vercel logs)
    if (!serviceKey) {
        console.error('DEBUG: Service Key missing in organization.get.ts')
        throw createError({ statusCode: 500, message: 'Missing Service Key' })
    }

    // Use Service Key to bypass RLS - Exact pattern from working admin API
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, serviceKey)

    // Fetch Member + Org
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
        throw createError({ statusCode: 500, message: error.message })
    }

    if (!data || !data.organization) {
        return null // No org found
    }

    return {
        ...data.organization,
        role: data.role
    }
})
