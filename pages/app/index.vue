<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
       <div>
         <h1 class="text-3xl font-bold tracking-tight text-gradient">Dashboard Financiero</h1>
         <p class="text-[var(--color-text-secondary)]">Visión general normalizada a USD.</p>
       </div>
       <button @click="refresh" class="btn bg-white dark:bg-slate-800 border" :disabled="pending">
          Refresh
       </button>
    </div>

    <!-- Permission Feedback -->
    <div v-if="!canViewFinancials" class="p-4 bg-red-100 text-red-700 rounded-lg">
        ⛔ Acceso Restringido. Contacta al dueño.
    </div>

    <div v-else>
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-panel p-6 relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10">
                    <svg class="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"></path></svg>
                </div>
                <p class="text-sm font-medium text-gray-500">Ventas de Hoy</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">${{ formatMoney(data?.kpis?.todaySales || 0) }}</p>
                <p class="text-xs text-emerald-500 mt-1 font-bold">{{ data?.kpis?.todayCount || 0 }} transacciones</p>
            </div>

            <div class="glass-panel p-6 relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-10">
                   <svg class="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
                </div>
                <p class="text-sm font-medium text-gray-500">Ticket Promedio</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">${{ formatMoney(data?.kpis?.avgTicket || 0) }}</p>
            </div>
            
            <div class="glass-panel p-6 relative overflow-hidden">
                <p class="text-sm font-medium text-gray-500">Estado</p>
                <div class="mt-2 text-xl font-mono text-gray-600 dark:text-gray-300">
                    {{ userRole.toUpperCase() }}
                </div>
            </div>
        </div>

        <!-- Chart -->
        <div class="glass-panel p-6 min-h-[400px]">
            <h3 class="font-bold text-lg mb-4">Tendencia de Ingresos (USD Real)</h3>
            <ClientOnly fallback="Cargando gráfica...">
                <apexchart 
                    width="100%" 
                    height="350" 
                    type="area" 
                    :options="chartOptions" 
                    :series="series"
                ></apexchart>
            </ClientOnly>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { usePermissions } from '~/composables/usePermissions'

definePageMeta({ 
    layout: 'dashboard',
    middleware: 'admin-auth' // Protect the route
})

const { organization } = useOrganization()
const { canViewFinancials, userRole } = usePermissions()

// Data fetching handles waiting for organization
const { data, pending, refresh } = await useFetch('/api/reports/dashboard', {
    params: { 
        refresh: 'true',
        organization_id: computed(() => organization.value?.id) 
    },
    // Only fetch if admin
    immediate: canViewFinancials.value,
    watch: [() => organization.value?.id]
})

const formatMoney = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const series = computed(() => data.value?.chart?.series || [])

const chartOptions = computed(() => ({
    chart: {
        id: 'sales-chart',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        background: 'transparent'
    },
    colors: ['#10B981'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
        categories: data.value?.chart?.categories || [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94a3b8' } }
    },
    yaxis: {
        labels: { 
            style: { colors: '#94a3b8' },
            formatter: (val) => `$${val.toFixed(0)}`
        }
    },
    grid: { show: true, borderColor: '#33415520' },
    dataLabels: { enabled: false },
    theme: { mode: 'dark' } 
}))
</script>
