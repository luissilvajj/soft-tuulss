
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const client = await serverSupabaseClient(event)

    // 0. Get Organization ID (Securely via RPC)
    const { data: rpcData, error: rpcError } = await client.rpc('get_my_main_organization')

    if (rpcError || !rpcData || !rpcData.organization_id) {
        console.error('Monthly Report Error: Org Not Found via RPC', rpcError)
        throw createError({ statusCode: 403, statusMessage: 'Organization Access Denied' })
    }
    const orgId = rpcData.organization_id

    // 1. Define Time Range (Last 30 Days vs Previous 30 Days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // 2. Aggregate Sales Stats
    // We fetch raw transactions and aggregate in memory for flexibility (or use RPC if heavy)
    // For MVP, JS aggregation is fine for small/medium businesses
    const { data: transactions } = await client
        .from('transactions')
        .select('amount, type, date, created_at, client_id')
        .eq('organization_id', orgId)
        .gte('date', sixtyDaysAgo.toISOString())
        .order('date', { ascending: true })

    // Separate periods
    const currentPeriodTrx = transactions?.filter(t => new Date(t.date) >= thirtyDaysAgo) || []
    const previousPeriodTrx = transactions?.filter(t => new Date(t.date) < thirtyDaysAgo) || []

    const calculateTotal = (trxs: any[]) => trxs
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const currentSales = calculateTotal(currentPeriodTrx)
    const previousSales = calculateTotal(previousPeriodTrx)

    const growth = previousSales > 0
        ? ((currentSales - previousSales) / previousSales) * 100
        : (currentSales > 0 ? 100 : 0)

    // 3. Top Performers (requires joining transaction_items -> products)
    // fetching top 5 items for context
    const { data: topItems } = await client
        .from('transaction_items')
        .select(`
            quantity,
            price_at_transaction,
            product:products(name, stock)
        `)
        .eq('organization_id', orgId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .limit(100) // Sample last 100 items for trend

    const productPerformance: Record<string, number> = {}
    topItems?.forEach((item: any) => {
        const name = item.product?.name || 'Unknown'
        productPerformance[name] = (productPerformance[name] || 0) + Number(item.quantity)
    })

    // 4. Inventory Health
    const { data: lowStock } = await client
        .from('products')
        .select('name, stock')
        .eq('organization_id', orgId)
        .lt('stock', 10)
        .limit(10)

    // 5. Construct Context Object
    return {
        period: {
            start: thirtyDaysAgo.toISOString(),
            end: now.toISOString()
        },
        financials: {
            revenue: currentSales,
            previous_revenue: previousSales,
            growth_percentage: growth.toFixed(1)
        },
        inventory: {
            low_stock_alert: lowStock,
            top_selling_sample: productPerformance
        },
        summary_note: "Data aggregated for AI analysis"
    }
})
