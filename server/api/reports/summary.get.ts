
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const client = await serverSupabaseClient(event)
    const query = getQuery(event)

    // Params
    const startDate = query.startDate as string
    const endDate = query.endDate as string
    const type = query.type as string || 'sales'

    if (!startDate || !endDate) {
        throw createError({ statusCode: 400, statusMessage: 'Start and End dates are required' })
    }

    // 0. Get Org & Determine Client Strategy
    let orgId = null
    let db = client // Default to user client

    // Strategy A: RPC (Preferred)
    const { data: rpcData } = await client.rpc('get_my_main_organization')
    if (rpcData && rpcData.organization_id) {
        orgId = rpcData.organization_id
    }

    // Strategy B: Admin Client Fallback (If RPC fails/missing)
    if (!orgId) {
        console.warn('Reports: RPC failed, attempting Admin fallback...')
        const config = useRuntimeConfig()
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
                db = adminClient // UPGRADE to admin client for data fetching
                console.log('Reports: Outputting via Admin Client')
            }
        }
    }

    if (!orgId) {
        throw createError({ statusCode: 403, statusMessage: 'Organization Access Denied (No Org Found)' })
    }

    const start = new Date(startDate).toISOString()
    const end = new Date(endDate).toISOString()

    // REPORT: SALES
    if (type === 'sales') {
        const { data: transactions } = await db
            .from('transactions')
            .select('*')
            .eq('organization_id', orgId)
            .gte('date', start)
            .lte('date', end)
            .order('date', { ascending: true })

        const sales = transactions?.filter(t => t.type === 'sale') || []
        const expenses = transactions?.filter(t => t.type === 'expense') || []

        const totalSales = sales.reduce((sum, t) => sum + Number(t.amount), 0)
        const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
        const net = totalSales - totalExpenses

        // Daily breakdown
        const daily: Record<string, number> = {}
        sales.forEach(t => {
            const day = t.date.split('T')[0]
            daily[day] = (daily[day] || 0) + Number(t.amount)
        })

        const chartData = Object.keys(daily).sort().map(date => ({
            date,
            amount: daily[date]
        }))

        return {
            summary: {
                total_sales: totalSales,
                total_expenses: totalExpenses,
                net_income: net,
                count: sales.length
            },
            chart: chartData,
            raw: transactions
        }
    }

    // REPORT: INVENTORY
    if (type === 'inventory') {
        // Inventory is snapshot-less, so we show CURRENT state regardless of date, 
        // but maybe filter created_at if requested? Usually inventory report is "Current Status".
        const { data: products } = await db
            .from('products')
            .select('*')
            .eq('organization_id', orgId)

        if (!products) return { summary: {}, items: [] }

        const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock)), 0)
        const lowStock = products.filter(p => p.stock < 10)
        const outOfStock = products.filter(p => p.stock === 0)

        return {
            summary: {
                total_products: products.length,
                total_value: totalValue,
                low_stock_count: lowStock.length,
                out_of_stock_count: outOfStock.length
            },
            items: products
        }
    }

    // REPORT: CLIENTS
    if (type === 'clients') {
        const { data: clients } = await db
            .from('clients')
            .select('*, transactions(amount)')
            .eq('organization_id', orgId)
            .gte('created_at', start)
            .lte('created_at', end) // Clients created in range

        // To be more useful, we might want ALL clients but sort by sales in range?
        // Let's do: Top Clients by Sales in Range
        // We need to fetch transactions and join clients.

        const { data: clientSales } = await db
            .from('transactions')
            .select('amount, client:clients(name, email)')
            .eq('organization_id', orgId)
            .eq('type', 'sale')
            .gte('date', start)
            .lte('date', end)
            .not('client_id', 'is', null)

        const clientPerformance: Record<string, number> = {}
        clientSales?.forEach((t: any) => {
            const name = t.client?.name || 'Unknown'
            clientPerformance[name] = (clientPerformance[name] || 0) + Number(t.amount)
        })

        const topClients = Object.entries(clientPerformance)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10)

        return {
            summary: {
                new_clients: clients?.length || 0,
                active_clients: Object.keys(clientPerformance).length
            },
            top_clients: topClients,
            new_list: clients
        }
    }

    return { error: 'Invalid report type' }

})
