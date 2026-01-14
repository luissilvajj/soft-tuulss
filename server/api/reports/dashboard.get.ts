import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)

    // Optional: Refresh MV if requested (e.g. on manual reload)
    if (query.refresh === 'true') {
        await client.rpc('refresh_dashboard_stats')
    }

    const orgId = query.organization_id as string
    if (!orgId) throw createError({ statusCode: 400, message: 'Organization ID required' })

    // 1. Fetch History (Last 10 days)
    const { data: history, error: historyError } = await client
        .from('mv_daily_sales_stats')
        .select('*')
        .eq('organization_id', orgId) // Secure Filter
        .limit(10)
        .order('day', { ascending: false })

    // 2. Fetch TODAY's Real-time stats
    const today = new Date().toISOString().split('T')[0]
    const { data: todayStats, error: todayError } = await client
        .from('view_sales_normalized')
        .select('amount_usd')
        .eq('organization_id', orgId) // Secure Filter
        .eq('date', today)
        .eq('status', 'paid')

    if (historyError) throw createError({ statusCode: 500, message: historyError.message })

    // Calculate Today's Totals
    const todayTotal = todayStats?.reduce((sum, row) => sum + (row.amount_usd || 0), 0) || 0
    const todayCount = todayStats?.length || 0

    // Prepare Chart Data (Reverse to show chronological)
    const chartData = (history || []).reverse().map(row => ({
        date: row.day,
        amount: row.total_usd
    }))

    // Calculate Average Ticket (Based on history available or just today?)
    // Let's use history avg
    const totalRevenueHistory = history?.reduce((acc, r) => acc + r.total_usd, 0) || 0
    const totalCountHistory = history?.reduce((acc, r) => acc + r.total_count, 0) || 0
    const avgTicket = totalCountHistory > 0 ? (totalRevenueHistory / totalCountHistory) : 0

    return {
        kpis: {
            todaySales: todayTotal,
            todayCount: todayCount,
            avgTicket: avgTicket,
            lastUpdate: new Date().toISOString()
        },
        chart: {
            series: [{
                name: "Ventas (USD)",
                data: chartData.map(d => d.amount)
            }],
            categories: chartData.map(d => d.date)
        }
    }
})
