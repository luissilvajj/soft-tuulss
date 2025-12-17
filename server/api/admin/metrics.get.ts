import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY
    if (!serviceKey) throw createError({ statusCode: 500, statusMessage: 'Missing Service Key' })

    const supabase = createClient(process.env.SUPABASE_URL!, serviceKey)

    // 1. Total Organizations
    const { count: totalOrgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })

    if (orgsError) throw createError({ statusCode: 500, statusMessage: orgsError.message })

    // 2. Active Users (users with active or trialing subscription)
    const { data: activeOrgs, error: activeError } = await supabase
        .from('organizations')
        .select('id, members:organization_members(user_id)')
        .in('subscription_status', ['active', 'trialing'])

    if (activeError) throw createError({ statusCode: 500, statusMessage: activeError.message })

    // Count unique user IDs from active organizations
    const uniqueUserIds = new Set()
    activeOrgs?.forEach(org => {
        org.members?.forEach((m: any) => uniqueUserIds.add(m.user_id))
    })

    // 3. Monthly Recurring Revenue (MRR)
    // Fetch counts for each plan type
    const { count: startOrgs } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('subscription_plan', 'start')
    const { count: growthOrgs } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('subscription_plan', 'growth')
    const { count: scaleOrgs } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('subscription_plan', 'scale')

    // Legacy support
    const { count: proOrgs } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('subscription_plan', 'pro')

    const mrr =
        ((startOrgs || 0) * 20) +
        ((growthOrgs || 0) * 30) +
        ((scaleOrgs || 0) * 60) +
        ((proOrgs || 0) * 29)

    return {
        totalOrgs: totalOrgs || 0,
        activeUsers: uniqueUserIds.size,
        mrr: mrr
    }
})
