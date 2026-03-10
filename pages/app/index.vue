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
          :loading="loading"
          :disabled="loading"
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
            
            <div class="bg-surface-ground rounded-xl border border-primary-500/30 p-6 shadow-sm relative overflow-hidden transition-colors">
                <p class="text-sm font-medium text-text-secondary">Estado</p>
                <div class="mt-2 text-2xl font-bold tracking-tight text-primary-600">
                    {{ userRole.toUpperCase() }}
                </div>
                <p class="text-xs text-text-secondary mt-1">Suscripción Activa</p>
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

        <!-- Low Stock Alert Widget -->
        <div v-if="lowStockProducts.length > 0" class="bg-surface-ground rounded-xl border border-status-error/30 p-6 shadow-sm mt-6">
            <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-status-error animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                <h3 class="font-bold text-lg text-status-error">Productos con Stock Bajo</h3>
                <span class="ml-auto bg-status-error/10 text-status-error px-2 py-0.5 rounded-full text-xs font-bold">{{ lowStockProducts.length }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="p in lowStockProducts" :key="p.id" class="flex items-center gap-3 bg-status-error/5 border border-status-error/10 rounded-lg p-3 hover:bg-status-error/10 transition-colors">
                    <div class="w-10 h-10 rounded-lg bg-status-error/10 flex items-center justify-center flex-shrink-0">
                        <span class="text-lg font-bold text-status-error">{{ p.stock }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-text-heading truncate">{{ p.name }}</p>
                        <p class="text-xs text-text-secondary">Mín: {{ p.min_stock || 5 }} · SKU: {{ p.sku || 'N/A' }}</p>
                    </div>
                    <NuxtLink to="/app/inventory" class="text-xs text-primary-600 hover:underline font-bold flex-shrink-0">Reponer</NuxtLink>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useOrganization } from '~/composables/useOrganization'
import { usePermissions } from '~/composables/usePermissions'
import { useFormat } from '~/composables/useFormat'
import { useDashboard } from '~/composables/useDashboard'
import { useTheme } from '~/composables/useTheme'
import BaseButton from '~/components/base/BaseButton.vue'

definePageMeta({ 
    layout: 'authenticated',
    middleware: 'admin-auth' 
})

const { organization } = useOrganization()
const { canViewFinancials, userRole } = usePermissions()
const { formatMoney } = useFormat()
const { kpis, salesTrend, loading, fetchMetrics } = useDashboard()
const { currentTheme } = useTheme()

const lowStockProducts = ref<any[]>([])
const client = useSupabaseClient()

// Reactive Dark Mode check for Chart Options
const isDark = computed(() => {
    if (typeof window === 'undefined') return false
    if (currentTheme.value === 'dark') return true
    if (currentTheme.value === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches
    return false
})

// Reactive Date Range (Default 'today')
const selectedRange = ref('today')

// Fetch on Mount & Watchers
onMounted(async () => {
    if (organization.value?.id && canViewFinancials.value) {
        fetchMetrics(selectedRange.value)
        // Fetch low stock products
        const { data } = await client
            .from('products')
            .select('id, name, sku, stock, min_stock')
            .eq('organization_id', organization.value.id)
            .order('stock', { ascending: true })
            .limit(12)
        if (data) {
            lowStockProducts.value = data.filter((p: any) => p.stock <= (p.min_stock || 5))
        }
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
        animations: { enabled: true, easing: 'easeinout', speed: 800 },
        background: 'transparent'
    },
    colors: ['#eab308'], // Primary-500 (Yellow/Amber)
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
        borderColor: isDark.value ? '#334155' : '#f1f5f9', // adapt grid lines
        strokeDashArray: 4,
        padding: { top: 0, right: 0, bottom: 0, left: 10 } 
    },
    dataLabels: { enabled: false },
    theme: { mode: isDark.value ? 'dark' : 'light' },
    tooltip: {
        theme: isDark.value ? 'dark' : 'light',
        y: {
            formatter: function (val: number) {
                return formatMoney(val)
            }
        }
    }
}))

const refresh = () => fetchMetrics(selectedRange.value)
</script>
