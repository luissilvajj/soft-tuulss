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

    // 3. Monthly Recurring Revenue (MRR) - placeholder for now
    // In a real system, you'd calculate based on subscription_plan and pricing
    // For now, let's assume Pro = $29/month
    const { count: proOrgs, error: proError } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active')
        .eq('subscription_plan', 'pro')

    if (proError) throw createError({ statusCode: 500, statusMessage: proError.message })

    const mrr = (proOrgs || 0) * 29 // $29 per pro org

    return {
        totalOrgs: totalOrgs || 0,
        activeUsers: uniqueUserIds.size,
        mrr: mrr
    }
})
