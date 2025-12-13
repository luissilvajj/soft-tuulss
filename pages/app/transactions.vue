<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gradient">Movimientos</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Historial de todas las transacciones de la organización.</p>
      </div>
      <div v-if="loading" class="text-sm text-[var(--color-text-secondary)] animate-pulse">
        Actualizando...
      </div>
    </div>

    <!-- Stats/Filters Section -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
       <!-- KPI Card: Total Transactions -->
       <div class="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-blue)] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20"></div>
          <p class="text-sm font-medium text-[var(--color-text-secondary)]">Total Movimientos</p>
          <div class="mt-4 flex items-baseline gap-2">
            <p class="text-3xl font-extrabold text-[var(--color-white)]">{{ transactions.length }}</p>
          </div>
       </div>

       <!-- Filters Area (Spans 3 columns on large screens) -->
       <div class="lg:col-span-3 glass-panel p-6 flex flex-col justify-center">
          <div class="flex flex-col md:flex-row gap-4">
              <!-- Date Filter -->
              <div class="flex-1 space-y-2">
                  <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Rango de Fechas</label>
                  <div class="relative">
                      <select 
                          v-model="dateFilter" 
                          class="w-full appearance-none bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] text-[var(--color-white)] text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-all"
                      >
                          <option value="today">Hoy</option>
                          <option value="yesterday">Ayer</option>
                          <option value="this_week">Esta Semana</option>
                          <option value="this_month">Este Mes</option>
                          <option value="last_month">Mes Pasado</option>
                          <option value="all">Todo el historial</option>
                          <option value="custom">Personalizado (Rango)</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--color-text-secondary)]">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>

               <!-- Custom Date Inputs -->
              <div v-if="dateFilter === 'custom'" class="flex gap-2 items-end animate-fade-in-up">
                  <div class="space-y-2">
                      <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Desde</label>
                      <input type="date" v-model="customDateStart" class="bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] text-[var(--color-white)] text-sm rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]">
                  </div>
                  <div class="space-y-2">
                      <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Hasta</label>
                      <input type="date" v-model="customDateEnd" class="bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] text-[var(--color-white)] text-sm rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]">
                  </div>
              </div>

              <!-- Type Filter -->
              <div class="flex-1 space-y-2">
                  <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Tipo</label>
                  <div class="relative">
                      <select 
                          v-model="typeFilter" 
                          class="w-full appearance-none bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] text-[var(--color-white)] text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-all"
                      >
                          <option value="all">Todos</option>
                          <option value="income">Ingresos (Ventas)</option>
                          <option value="expense">Egresos (Gastos)</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--color-text-secondary)]">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>
          </div>
       </div>
    </div>

    <!-- Transactions Table -->
    <div class="glass-panel overflow-hidden">
        <div v-if="transactions.length > 0">
           <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-left align-middle">
                <thead class="bg-[var(--color-bg-dark)]/50">
                    <tr>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Descripción</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Método</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Monto</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                    <tr v-for="trx in transactions" :key="trx.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors duration-150">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)] font-mono">
                            {{ new Date(trx.created_at).toLocaleDateString() }}
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div :class="[
                                    'w-8 h-8 rounded-full flex items-center justify-center',
                                    trx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                ]">
                                    <svg v-if="trx.type === 'income'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                                </div>
                                <div>
                                    <p class="font-bold text-[var(--color-white)]">{{ trx.description }}</p>
                                    <p class="text-xs text-[var(--color-text-secondary)]">{{ trx.client_name || 'General' }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-[var(--color-text-secondary)] capitalize">
                            {{ trx.payment_method }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div :class="[
                                'font-bold font-mono text-lg',
                                trx.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                            ]">
            </tbody>
        </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useTransactions } from '~/composables/useTransactions'
import { useOrganization } from '~/composables/useOrganization'
import { watch, ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'dashboard' })

const { transactions, fetchTransactions, loading } = useTransactions()
const { organization } = useOrganization()

const filterMode = ref('this_month')
const filterType = ref('all')

// Custom Date Range
const customFrom = ref('')
const customTo = ref('')

const isCustom = computed(() => filterMode.value === 'custom')

const applyFilters = () => {
    const now = new Date()
    let from, to

    switch (filterMode.value) {
        case 'today':
            from = now.toISOString().split('T')[0]
            to = from
            break
        case 'yesterday':
            const y = new Date(now)
            y.setDate(now.getDate() - 1)
            from = y.toISOString().split('T')[0]
            to = from
            break
        case 'this_week':
            const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
            const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6))
            from = firstDay.toISOString().split('T')[0]
            to = lastDay.toISOString().split('T')[0]
            break
        case 'this_month':
            from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
            break
         case 'last_month':
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
            to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
            break
        case 'custom':
            from = customFrom.value
            to = customTo.value
            break
        case 'all_time':
        default:
            from = undefined
            to = undefined
            break
    }

    // Don't fetch if custom is selected but dates are empty
    if (filterMode.value === 'custom' && (!from || !to)) return

    fetchTransactions({
        dateFrom: from,
        dateTo: to,
        type: filterType.value === 'all' ? undefined : filterType.value as any
    })
}

// Watchers
watch([filterMode, filterType, organization], () => {
    if (filterMode.value !== 'custom') {
         if (organization.value?.id) applyFilters()
    }
}, { immediate: true })

watch([customFrom, customTo], () => {
    if (filterMode.value === 'custom' && customFrom.value && customTo.value) {
        if (organization.value?.id) applyFilters()
    }
})

onMounted(() => {
    if (organization.value?.id) applyFilters()
})
</script>
