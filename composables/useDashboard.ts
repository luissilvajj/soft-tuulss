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
    const loading = useState('dashboard_loading', () => false)
    const error = useState('dashboard_error', () => null)

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

    return {
        kpis,
        salesTrend,
        loading,
        error,
        fetchMetrics
    }
}
