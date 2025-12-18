
<template>
  <div class="h-full flex flex-col p-6 space-y-6">
    
    <!-- HEADER & CONTROLS -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="text-3xl font-extrabold text-[var(--color-white)] tracking-tight">Reportes Avanzados</h1>
            <p class="text-[var(--color-text-secondary)]">Analiza el rendimiento detallado de tu negocio.</p>
        </div>
        
        <div class="flex flex-wrap gap-3 bg-[var(--color-bg-subtle)] p-2 rounded-xl border border-[var(--color-border-subtle)]">
            <!-- Type Selector -->
            <select v-model="reportType" class="bg-[var(--color-bg-dark)] text-[var(--color-white)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="sales">📊 Ventas</option>
                <option value="inventory">📦 Inventario</option>
                <option value="clients">👥 Clientes</option>
            </select>
            
            <!-- Date Filter -->
            <select v-model="dateRange" class="bg-[var(--color-bg-dark)] text-[var(--color-white)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="quarter">Últimos 90 Días</option>
                <option value="year">Este Año</option>
            </select>
            
            <button @click="generateReport" :disabled="loading" class="bg-[var(--color-accent-blue)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generar
            </button>
        </div>
    </div>

    <!-- MAIN CONTENT -->
    <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-4 text-center font-bold">
        ⚠️ {{ errorMsg }}
    </div>

    <div v-if="data" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        <!-- KEY METRICS CARDS -->
        <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
             <div v-for="(value, key) in formattedSummary" :key="key" class="glass-panel p-6 border border-[var(--color-border-subtle)]">
                 <p class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">{{ key.replace(/_/g, ' ') }}</p>
                 <p class="text-3xl font-black text-[var(--color-white)]">{{ value }}</p>
             </div>
        </div>

        <!-- CHART SECTION (Visual) -->
        <div class="lg:col-span-2 glass-panel p-6 border border-[var(--color-border-subtle)] flex flex-col">
            <h3 class="text-lg font-bold text-[var(--color-white)] mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                Tendencia / Distribución
            </h3>
            
            <!-- Custom CSS Bar Chart -->
            <div class="flex-1 flex items-end justify-between gap-2 min-h-[300px] w-full pb-6 border-b border-[var(--color-border-subtle)] relative">
                <div v-if="!chartItems.length" class="absolute inset-0 flex items-center justify-center text-[var(--color-text-secondary)]">No hay datos suficientes para graficar</div>
                
                <div v-for="(item, idx) in chartItems" :key="idx" class="flex-1 flex flex-col-reverse items-center group relative min-w-[20px]">
                    <!-- Tooltip -->
                    <div class="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs p-2 rounded pointer-events-none transition-opacity z-10 whitespace-nowrap">
                        {{ item.label }}: ${{ item.value }}
                    </div>
                    <!-- Bar -->
                    <div class="w-full bg-[var(--color-accent-blue)] rounded-t-sm hover:bg-blue-400 transition-all duration-500 opacity-80 group-hover:opacity-100" 
                         :style="{ height: `${(item.value / maxChartValue) * 100}%` }">
                    </div>
                    <!-- Label -->
                    <p class="text-[10px] text-[var(--color-text-secondary)] mt-2 truncate w-full text-center rotate-45 origin-left translate-y-2">{{ item.label }}</p>
                </div>
            </div>
        </div>

        <!-- LIST SECTION -->
        <div class="glass-panel p-0 border border-[var(--color-border-subtle)] overflow-hidden flex flex-col">
             <div class="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30">
                 <h3 class="font-bold text-[var(--color-white)]">Detalles</h3>
             </div>
             <div class="overflow-y-auto flex-1 p-0 max-h-[400px]">
                 <table class="w-full text-sm text-left">
                     <thead class="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-subtle)]/50 sticky top-0 backdrop-blur-sm">
                         <tr>
                             <th class="px-4 py-3">Nombre</th>
                             <th class="px-4 py-3 text-right">Valor</th>
                         </tr>
                     </thead>
                     <tbody class="divide-y divide-[var(--color-border-subtle)]">
                         <tr v-for="(row, i) in listItems" :key="i" class="hover:bg-[var(--color-bg-subtle)] transition-colors">
                             <td class="px-4 py-3 font-medium text-[var(--color-white)]">{{ row.name }}</td>
                             <td class="px-4 py-3 text-right text-[var(--color-text-primary)]">{{ row.value }}</td>
                         </tr>
                     </tbody>
                 </table>
                  <div v-if="!listItems.length" class="p-8 text-center text-[var(--color-text-secondary)] italic">
                     Sin resultados
                 </div>
             </div>
        </div>

    </div>
    
    <!-- Loading/Empty State -->
    <div v-else-if="!loading" class="flex-1 flex flex-col items-center justify-center text-[var(--color-text-secondary)] opacity-50">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <p>Selecciona tus filtros y genera un reporte.</p>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

const reportType = ref('sales')
const dateRange = ref('month')
const loading = ref(false)
const data = ref(null)
const errorMsg = ref('')

// Computed for Summary Cards
const formattedSummary = computed(() => {
    if (!data.value?.summary) return {}
    const s = data.value.summary
    const res = {}
    
    for (const [key, val] of Object.entries(s)) {
        // Format money/numbers heuristics
        if (key.includes('total') || key.includes('net') || key.includes('income')) {
            res[key] = `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        } else {
            res[key] = val
        }
    }
    return res
})

// Computed for Chart
const chartItems = computed(() => {
    if (reportType.value === 'sales' && data.value?.chart) {
        return data.value.chart.map(c => ({
            label: new Date(c.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            value: c.amount
        }))
    }
    if (reportType.value === 'clients' && data.value?.top_clients) {
         return data.value.top_clients.map(c => ({
            label: c.name.split(' ')[0], // First name for chart
            value: c.total
         }))
    }
     if (reportType.value === 'inventory' && data.value?.items) {
         // Show distribution of top stock value items?
         // Or just top stock counts
         const sorted = [...data.value.items].sort((a,b) => b.stock - a.stock).slice(0, 10)
         return sorted.map(i => ({ label: i.name.substring(0, 10), value: i.stock }))
    }
    return []
})

const maxChartValue = computed(() => {
    if (!chartItems.value.length) return 100
    return Math.max(...chartItems.value.map(i => i.value)) * 1.1 // +10% padding
})

// Computed for List
const listItems = computed(() => {
     if (reportType.value === 'sales' && data.value?.raw) {
         return data.value.raw.slice(0, 50).map(t => ({
             name: `${t.type === 'sale' ? '🛒' : '💸'} ${new Date(t.date).toLocaleDateString()}`,
             value: `$${t.amount}`
         }))
     }
     if (reportType.value === 'clients' && data.value?.top_clients) {
        return data.value.top_clients.map(c => ({ name: c.name, value: `$${c.total.toFixed(2)}` }))
     }
     if (reportType.value === 'inventory' && data.value?.items) {
         return data.value.items.map(i => ({ name: i.name, value: `${i.stock} unds` }))
     }
     return []
})

async function generateReport() {
    loading.value = true
    try {
        const now = new Date()
        let start = new Date()
        let end = new Date()

        // Calculate Dates
        if (dateRange.value === 'today') {
            start = now
        } else if (dateRange.value === 'week') {
            const day = now.getDay()
            const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
            start = new Date(now.setDate(diff))
        } else if (dateRange.value === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1)
        } else if (dateRange.value === 'quarter') {
             start.setDate(now.getDate() - 90)
        } else if (dateRange.value === 'year') {
            start = new Date(now.getFullYear(), 0, 1)
        }

        const query = {
            type: reportType.value,
            startDate: start.toISOString().split('T')[0], // YYYY-MM-DD
            endDate: end.toISOString().split('T')[0]
        }

        data.value = await $fetch('/api/reports/summary', { params: query })

    } catch (e) {
        console.error('Report Generation Error:', e)
        const msg = e.response?._data?.statusMessage || e.message || 'Error desconocido'
        console.log('DEBUG MSG FROM BACKEND:', msg)
        errorMsg.value = msg
    } finally {
        loading.value = false
    }
}

// Auto generate on mount for "This Month Sales"
onMounted(() => {
    generateReport()
})
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
