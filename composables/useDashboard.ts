import { useOrganization } from './useOrganization'

export const useDashboard = () => {
    const { organization } = useOrganization()
    const client = useSupabaseClient()

    // State
    const kpis = useState('dashboard_kpis', () => ({
        total_sales: 0,
        transaction_count: 0,
        avg_ticket: 0
    }))
    const salesTrend = useState<any[]>('dashboard_trend', () => [])
    const topProducts = useState<any[]>('dashboard_top_products', () => [])
    const paymentDistribution = useState<any[]>('dashboard_payment_dist', () => [])
    const loading = useState('dashboard_loading', () => false)
    const error = useState('dashboard_error', () => null)
    const generatingZ = ref(false)

    const fetchMetrics = async (range = 'today') => {
        if (!organization.value?.id) return

        loading.value = true
        error.value = null

        try {
            // Calculate Dates
            const now = new Date()
            let start = new Date()

            if (range === 'today') {
                start.setHours(0, 0, 0, 0)
            } else if (range === 'week') {
                start.setDate(now.getDate() - 7)
            } else if (range === 'month') {
                start.setMonth(now.getMonth() - 1)
            }

            const p_range_start = start.toISOString()
            const p_range_end = now.toISOString()

            // 1. Fetch KPIs
            const { data: kpiData, error: kpiErr } = await client
                .rpc('get_kpi_metrics', {
                    p_organization_id: organization.value.id,
                    p_range_start,
                    p_range_end
                })

            if (kpiErr) throw kpiErr
            if (kpiData) kpis.value = kpiData as any

            // 2. Fetch Trend
            // Trend range defaults to week for now if just 'today' is passed, or match logic
            // Actually, keep trend aligned with filtered range for better context
            // But usually trend needs more data. stick to user logic:
            // "Trend range defaults to week for now if just 'today' is passed"
            let trendStart = new Date(start)
            if (range === 'today') {
                trendStart.setDate(now.getDate() - 7)
            }
            const trendStartIso = trendStart.toISOString()

            const { data: trendData, error: trendErr } = await client
                .rpc('get_sales_trend', {
                    p_organization_id: organization.value.id,
                    p_range_start: trendStartIso,
                    p_range_end
                })

            if (trendErr) throw trendErr
            salesTrend.value = trendData || []

            // 3. Fetch Top 5 Products (by quantity sold)
            const { data: topData } = await client
                .from('transaction_items')
                .select('product_name, quantity')
                .gte('created_at', p_range_start)
                .lte('created_at', p_range_end)
            
            if (topData) {
                const productMap: Record<string, number> = {}
                topData.forEach((item: any) => {
                    const name = item.product_name || 'Sin nombre'
                    productMap[name] = (productMap[name] || 0) + (item.quantity || 1)
                })
                topProducts.value = Object.entries(productMap)
                    .map(([name, qty]) => ({ name, quantity: qty }))
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 5)
            }

            // 4. Fetch Payment Method Distribution
            const { data: payData } = await client
                .from('transactions')
                .select('payment_method')
                .eq('organization_id', organization.value.id)
                .eq('status', 'paid')
                .gte('created_at', p_range_start)
                .lte('created_at', p_range_end)
            
            if (payData) {
                const payMap: Record<string, number> = {}
                payData.forEach((tx: any) => {
                    const method = tx.payment_method || 'other'
                    payMap[method] = (payMap[method] || 0) + 1
                })
                paymentDistribution.value = Object.entries(payMap)
                    .map(([method, count]) => ({ method, count }))
                    .sort((a, b) => b.count - a.count)
            }

        } catch (e: any) {
            console.error('Dashboard Fetch Error:', e)
            error.value = e.message
            // MANTENER LA DATA ANTERIOR (Stale Data) si falla la red, 
            // en lugar de enviar las métricas y gráficos a cero asustando al usuario.
            if (!kpis.value || kpis.value.total_sales === undefined) {
               kpis.value = { total_sales: 0, transaction_count: 0, avg_ticket: 0 }
               salesTrend.value = []
            }
        } finally {
            loading.value = false
        }
    }

    const generateZReport = async () => {
        if (!organization.value?.id) throw new Error('Organización no encontrada')
        generatingZ.value = true
        
        try {
            const today = new Date()
            today.setHours(0,0,0,0)
            
            // 1. Get today's total aggregates directly from transactions
            const { data: txs, error: fetchErr } = await client
                .from('transactions')
                .select('subtotal, exempt_amount, tax_base, tax_general_amount, tax_reduced_amount, tax_igtf')
                .eq('organization_id', organization.value.id)
                .eq('status', 'paid')
                .gte('created_at', today.toISOString())
                
            if (fetchErr) throw fetchErr
            
            let totalSales = 0, totalExempt = 0, totalBaseGen = 0, totalBaseRed = 0
            let totalIvaGen = 0, totalIvaRed = 0, totalIgtf = 0

            txs?.forEach(tx => {
                totalSales += (tx.subtotal || 0)
                totalExempt += (tx.exempt_amount || 0)
                totalBaseGen += (tx.tax_base || 0) // Approximation assuming tax_base mostly goes to general if not split in legacy
                totalIvaGen += (tx.tax_general_amount || 0)
                totalIvaRed += (tx.tax_reduced_amount || 0)
                totalIgtf += (tx.tax_igtf || 0)
            })

            // 2. Get the NEXT correlative
            const { data: lastZ } = await client
                .from('fiscal_z_reports')
                .select('z_correlative_number')
                .eq('organization_id', organization.value.id)
                .order('z_correlative_number', { ascending: false })
                .limit(1)
                .maybeSingle()
                
            const nextCorrelative = (lastZ?.z_correlative_number || 0) + 1

            // 3. Insert Z Report
            const { data: zReport, error: insertErr } = await client
                .from('fiscal_z_reports')
                .insert({
                    organization_id: organization.value.id,
                    z_correlative_number: nextCorrelative,
                    total_sales: totalSales,
                    total_exempt: totalExempt,
                    total_base_general: totalBaseGen,
                    total_base_reduced: totalBaseRed,
                    total_tax_general: totalIvaGen,
                    total_tax_reduced: totalIvaRed,
                    total_igtf: totalIgtf,
                })
                .select()
                .single()

            if (insertErr) {
                if (insertErr.code === '23505') throw new Error('Ya existe un reporte Z con este correlativo.')
                throw insertErr
            }

            return zReport
        } catch (e: any) {
            console.error('Error generating Z Report:', e)
            throw e
        } finally {
            generatingZ.value = false
        }
    }

    return {
        kpis,
        salesTrend,
        topProducts,
        paymentDistribution,
        loading,
        error,
        generatingZ,
        fetchMetrics,
        generateZReport
    }
}
