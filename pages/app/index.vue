<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
       <div>
         <h1 class="text-3xl font-bold tracking-tight text-text-heading">Dashboard Financiero</h1>
         <p class="text-text-secondary">Visión general normalizada a USD.</p>
       </div>
       <BaseButton 
          variant="secondary" 
          @click="refresh" 
          :loading="pending"
          :disabled="pending"
       >
          <template #icon>
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </template>
          Actualizar
       </BaseButton>
    </div>

    <!-- Permission Feedback -->
    <div v-if="!canViewFinancials" class="p-4 bg-status-error/10 text-status-error rounded-lg border border-status-error/20">
        ⛔ Acceso Restringido. Contacta al dueño.
    </div>

    <div v-else>
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-surface-ground rounded-xl border border-surface-border p-6 shadow-sm relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg class="w-24 h-24 text-primary-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.3-2.49-2.67V6h-1.13v1.01c-1.31.3-2.19 1.16-2.19 2.18 0 1.47 1.18 2.2 3.53 2.76 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.33 2.84 2.65V18h1.13v-1.03c1.31-.3 2.19-1.12 2.19-2.18.01-1.31-.96-2.18-3.58-2.65z"/></svg>
                </div>
                <div class="relative z-10">
                    <p class="text-sm font-medium text-text-secondary">Ventas ({{ selectedRange === 'today' ? 'Hoy' : (selectedRange === 'week' ? 'Semana' : 'Mes') }})</p>
                    <div class="mt-2 flex items-baseline gap-2">
                        <span class="text-3xl font-bold text-text-heading">{{ formatMoney(kpis.total_sales) }}</span>
                        <span class="text-xs font-semibold text-status-success bg-status-success/10 px-2 py-0.5 rounded-full">
                            {{ kpis.transaction_count }} ops
                        </span>
                    </div>
                </div>
            </div>

            <div class="bg-surface-ground rounded-xl border border-surface-border p-6 shadow-sm relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg class="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                </div>
                <div class="relative z-10">
                    <p class="text-sm font-medium text-text-secondary">Ticket Promedio</p>
                    <p class="text-3xl font-bold text-text-heading mt-2">{{ formatMoney(kpis.avg_ticket) }}</p>
                </div>
            </div>
            
            <div class="bg-primary-600 rounded-xl border border-primary-500 p-6 shadow-sm relative overflow-hidden text-white">
                <p class="text-sm font-medium text-white/80">Estado</p>
                <div class="mt-2 text-2xl font-bold tracking-tight">
                    {{ userRole.toUpperCase() }}
                </div>
                <p class="text-xs text-white/60 mt-1">Suscripción Activa</p>
            </div>
        </div>

        <!-- Chart -->
        <div class="bg-surface-ground rounded-xl border border-surface-border p-6 shadow-sm min-h-[400px]">
            <h3 class="font-bold text-lg mb-4 text-text-heading">Tendencia de Ingresos (USD Real)</h3>
            <div class="h-[300px] w-full">
                <ClientOnly fallback="Cargando gráfica...">
                    <apexchart v-if="salesTrend.length > 0" width="100%" height="100%" type="area" :options="chartOptions" :series="series"></apexchart>
                    <div v-else class="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        <span class="text-sm">Aún no hay ventas en este periodo</span>
                    </div>
                </ClientOnly>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { usePermissions } from '~/composables/usePermissions'
import { useFormat } from '~/composables/useFormat'
import { useDashboard } from '~/composables/useDashboard'
import BaseButton from '~/components/base/BaseButton.vue'

definePageMeta({ 
    layout: 'authenticated',
    middleware: 'admin-auth' 
})

const { organization } = useOrganization()
const { canViewFinancials, userRole } = usePermissions()
const { formatMoney } = useFormat()
const { kpis, salesTrend, loading, fetchMetrics } = useDashboard()

// Reactive Date Range (Default 'today')
const selectedRange = ref('today')

// Fetch on Mount & Watchers
onMounted(() => {
    if (organization.value?.id && canViewFinancials.value) {
        fetchMetrics(selectedRange.value)
    }
})

watch(() => organization.value?.id, (newId) => {
    if (newId && canViewFinancials.value) fetchMetrics(selectedRange.value)
})

watch(selectedRange, (newRange) => {
    if (organization.value?.id) fetchMetrics(newRange)
})

// Chart Configuration
const series = computed(() => [{
    name: 'Ventas',
    data: salesTrend.value.map(s => ({ x: s.period, y: s.amount })) // ApexCharts supports {x, y}
}])

const chartOptions = computed(() => ({
    chart: {
        id: 'sales-trend',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#4F46E5'], // Primary-600
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.2,
            stops: [0, 90, 100]
        }
    },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
        type: 'datetime',
        tooltip: { enabled: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { 
             style: { colors: '#64748b', fontSize: '11px' },
             format: 'dd MMM'
        }
    },
    yaxis: {
        labels: { 
            style: { colors: '#64748b', fontSize: '11px' },
            formatter: (val: number) => formatMoney(val)
        }
    },
    grid: { 
        show: true, 
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
        padding: { top: 0, right: 0, bottom: 0, left: 10 } 
    },
    dataLabels: { enabled: false },
    theme: { mode: 'light' },
    tooltip: {
        theme: 'light',
        y: {
            formatter: function (val: number) {
                return formatMoney(val)
            }
        }
    }
}))

const refresh = () => fetchMetrics(selectedRange.value)
</script>
