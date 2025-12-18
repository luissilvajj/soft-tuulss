
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const client = await serverSupabaseClient(event)

    // 0. Get Org & Determine Client Strategy
    let orgId = null
    let db = client // Default to user client

    // Strategy A: RPC (Preferred)
    const { data: rpcData } = await client.rpc('get_my_main_organization')
    if (rpcData && rpcData.organization_id) {
        orgId = rpcData.organization_id
    }

    // Strategy B: Admin Client Fallback
    if (!orgId) {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
        if (serviceKey && process.env.SUPABASE_URL) {
            const adminClient = createClient(process.env.SUPABASE_URL, serviceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            })
            const { data: adminOrg } = await adminClient
                .from('organization_members')
                .select('organization_id')
                .eq('user_id', user.id)
                .maybeSingle()

            if (adminOrg) {
                orgId = adminOrg.organization_id
                db = adminClient
            }
        }
    }

    if (!orgId) throw createError({ statusCode: 403, statusMessage: 'Organization Access Denied' })

    // 1. Define Time Range (Last 30 Days vs Previous 30 Days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // 2. Aggregate Sales Stats
    const { data: transactions } = await db
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
    const { data: topItems } = await db
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
    const { data: lowStock } = await db
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
