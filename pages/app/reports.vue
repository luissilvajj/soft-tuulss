<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { usePermissions } from '~/composables/usePermissions'
import { useFormat } from '~/composables/useFormat'
import { useDashboard } from '~/composables/useDashboard'

definePageMeta({ 
    layout: 'authenticated',
    middleware: 'admin-auth' 
})

const { organization } = useOrganization()
const { canViewFinancials } = usePermissions()
const { kpis, salesTrend, loading, fetchMetrics } = useDashboard()
const { formatMoney, formatDate } = useFormat()

const selectedRange = ref('month') // Default to month for reports

// Fetch on mount and changes
onMounted(() => {
    if (organization.value?.id && canViewFinancials.value) {
        fetchMetrics(selectedRange.value)
    }
})

watch(() => organization.value?.id, (newId) => {
    if (newId && canViewFinancials.value) fetchMetrics(selectedRange.value)
})

// Chart Config
const series = computed(() => [{
    name: 'Ventas',
    data: salesTrend.value.map(s => ({ x: s.date, y: s.amount }))
}])

const chartOptions = computed(() => ({
    chart: {
        id: 'reports-trend',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true }
    },
    colors: ['#4F46E5'],
    fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] }
    },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
        type: 'datetime',
        labels: { style: { colors: '#64748b', fontSize: '11px' }, format: 'dd MMM' },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false }
    },
    yaxis: {
        labels: { style: { colors: '#64748b', fontSize: '11px' }, formatter: (val: number) => formatMoney(val) }
    },
    grid: { show: true, borderColor: '#f1f5f9', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light', y: { formatter: (val: number) => formatMoney(val) } }
}))
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-text-heading">Reportes Financieros</h1>
                <p class="text-sm text-text-secondary mt-1">Análisis detallado del rendimiento de tu negocio.</p>
            </div>
            
            <div class="flex items-center gap-2 bg-surface-ground rounded-lg p-1 border border-surface-border shadow-sm">
                <button 
                    v-for="range in ['week', 'month', 'year']" 
                    :key="range"
                    @click="selectedRange = range; fetchMetrics(range)"
                    class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                    :class="selectedRange === range ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:bg-surface-subtle'"
                >
                    {{ range === 'week' ? 'Semana' : (range === 'month' ? 'Mes' : 'Año') }}
                </button>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-surface-ground rounded-xl border border-surface-border p-6 shadow-sm">
                <p class="text-sm font-medium text-text-secondary">Ventas Totales</p>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-text-heading">{{ formatMoney(kpis.total_sales) }}</span>
                </div>
            </div>
             <div class="bg-surface-ground rounded-xl border border-surface-border p-6 shadow-sm">
                <p class="text-sm font-medium text-text-secondary">Transacciones</p>
                 <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-text-heading">{{ kpis.transaction_count }}</span>
                </div>
            </div>
             <div class="bg-surface-ground rounded-xl border border-surface-border p-6 shadow-sm">
                <p class="text-sm font-medium text-text-secondary">Ticket Promedio</p>
                 <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-text-heading">{{ formatMoney(kpis.avg_ticket) }}</span>
                </div>
            </div>
        </div>

        <!-- Main Chart -->
        <div class="bg-surface-ground rounded-xl border border-surface-border p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-text-heading mb-6">Tendencia de Ingresos</h3>
            <div class="h-[350px] w-full">
                <ClientOnly>
                    <apexchart v-if="salesTrend.length > 0" width="100%" height="100%" type="area" :options="chartOptions" :series="series"></apexchart>
                    <div v-else class="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        <span class="text-sm">No hay datos suficientes para mostrar el gráfico</span>
                    </div>
                </ClientOnly>
            </div>
        </div>

        <!-- Sales Detail Table (Skeleton) -->
        <div class="bg-surface-ground rounded-xl border border-surface-border shadow-sm overflow-hidden">
             <div class="px-6 py-4 border-b border-surface-border">
                <h3 class="text-lg font-semibold text-text-heading">Detalle de Ventas</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="bg-surface-section text-text-secondary border-b border-surface-border">
                            <th class="px-6 py-3 font-medium">Fecha</th>
                            <th class="px-6 py-3 font-medium">Monto</th>
                            <th class="px-6 py-3 font-medium text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-border">
                         <tr v-if="salesTrend.length === 0" class="text-center">
                            <td colspan="3" class="px-6 py-8 text-text-secondary">No hay transacciones en este periodo</td>
                        </tr>
                        <tr v-for="item in salesTrend" :key="item.date" class="hover:bg-surface-subtle transition-colors">
                            <td class="px-6 py-4 text-text-body">{{ formatDate(item.date) }}</td>
                            <td class="px-6 py-4 font-medium text-text-heading">{{ formatMoney(item.amount) }}</td>
                             <td class="px-6 py-4 text-right">
                                <span class="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer">Ver Detalle</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
