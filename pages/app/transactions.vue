<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gradient">Movimientos</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Historial de todas las transacciones de la organización.</p>
      </div>
      <div v-if="loading || loadingMovements" class="text-sm text-[var(--color-text-secondary)] animate-pulse">
        Actualizando...
      </div>
    </div>

    <!-- View Toggle -->
    <div class="flex justify-center mb-8">
        <div class="bg-[var(--color-bg-subtle)] p-1 rounded-xl flex gap-1">
            <button 
                @click="viewMode = 'money'"
                :class="[
                    'px-6 py-2 rounded-lg text-sm font-bold transition-all',
                    viewMode === 'money' ? 'bg-[var(--color-accent-blue)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-white'
                ]"
            >
                Dinero ($)
            </button>
            <button 
                @click="viewMode = 'inventory'"
                :class="[
                    'px-6 py-2 rounded-lg text-sm font-bold transition-all',
                    viewMode === 'inventory' ? 'bg-[var(--color-accent-violet)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-white'
                ]"
            >
                Inventario
            </button>
        </div>
    </div>

    <!-- Stats/Filters Section (Only for Money View for now) -->
    <div v-if="viewMode === 'money'" class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
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
          <div class="flex flex-col md:flex-row gap-4 items-end">
              <!-- Date Filter -->
              <div class="flex-1 space-y-2 w-full">
                  <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Rango de Fechas</label>
                  <div class="flex flex-col md:flex-row gap-2">
                       <div class="relative flex-1">
                           <select 
                               v-model="dateFilter" 
                               class="w-full appearance-none bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] text-[var(--color-white)] text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-all"
                           >
                               <option value="today">Hoy</option>
                               <option value="yesterday">Ayer</option>
                               <option value="this_week">Esta Semana</option>
                               <option value="this_month">Este Mes</option>
                               <option value="last_month">Mes Pasado</option>
                               <option value="custom">Personalizado</option>
                               <option value="all">Todo el historial</option>
                           </select>
                           <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--color-text-secondary)]">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                           </div>
                       </div>
                       
                       <!-- Custom Date Inputs -->
                       <div v-if="dateFilter === 'custom'" class="flex items-center gap-2 animate-fade-in-right">
                            <input v-model="customFrom" type="date" class="bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] text-[var(--color-white)] rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]">
                            <span class="text-[var(--color-text-secondary)]">-</span>
                            <input v-model="customTo" type="date" class="bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] text-[var(--color-white)] rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]">
                       </div>
                  </div>
              </div>

              <!-- Type Filter -->
              <div class="w-full md:w-48 space-y-2">
                  <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Tipo</label>
                  <div class="relative">
                      <select 
                          v-model="typeFilter" 
                          class="w-full appearance-none bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] text-[var(--color-white)] text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-all"
                      >
                          <option value="all">Todos</option>
                          <option value="income">Ingresos</option>
                          <option value="sale">Ventas</option>
                          <option value="expense">Egresos</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--color-text-secondary)]">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>
          </div>
       </div>
    </div>

    <!-- MONEY TRANSACTIONS TABLE -->
    <div v-if="viewMode === 'money'" class="glass-panel overflow-hidden">
        <div v-if="transactions.length > 0">
           <!-- Mobile Card View -->
           <div class="block md:hidden space-y-4">
              <div v-for="trx in transactions" :key="trx.id" class="bg-[var(--color-bg-subtle)] p-4 rounded-xl border border-[var(--color-border-subtle)] space-y-3">
                  <div class="flex justify-between items-start">
                      <div class="flex items-center gap-3">
                           <div :class="[
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                ['income', 'sale'].includes(trx.type) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            ]">
                                <svg v-if="['income', 'sale'].includes(trx.type)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                            </div>
                            <div>
                                <p class="font-bold text-[var(--color-white)]">{{ parseDescription(trx) }}</p>
                                <p class="text-xs text-[var(--color-text-secondary)] font-mono">{{ new Date(trx.created_at).toLocaleDateString() }}</p>
                            </div>
                      </div>
                      <div :class="[
                            'font-bold font-mono text-lg',
                            ['income', 'sale'].includes(trx.type) ? 'text-emerald-500' : 'text-red-500'
                        ]">
                            {{ ['income', 'sale'].includes(trx.type) ? '+' : '-' }} ${{ formatMainAmount(trx) }}
                      </div>
                  </div>
                  <div class="flex justify-between items-center border-t border-[var(--color-border-subtle)] pt-3 text-sm">
                       <span class="text-[var(--color-text-secondary)]">{{ trx.client_name || (trx.client ? trx.client.name : 'General') }}</span>
                       <span class="text-[var(--color-text-secondary)] capitalize">{{ getPaymentMethodLabel(trx.payment_method) }}</span>
                  </div>
                   <div v-if="getSecondaryAmount(trx)" class="text-right text-xs text-[var(--color-text-secondary)] font-mono opacity-70 mt-1">
                       {{ getSecondaryAmount(trx) }}
                   </div>
                   <!-- Fix Button Heuristic -->
                   <div v-if="trx.currency === 'USD' && trx.amount > 2000" class="mt-2 text-right">
                       <button @click="fixTransaction(trx)" class="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
                           ¿Es Bolívares?
                       </button>
                   </div>
              </div>
           </div>

           <!-- Desktop Table View -->
           <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-left align-middle">
                <thead class="bg-[var(--color-bg-dark)]/50">
                    <tr>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Descripción</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Método</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Monto (USD)</th>
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
                                    ['income', 'sale'].includes(trx.type) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                ]">
                                    <svg v-if="['income', 'sale'].includes(trx.type)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                                </div>
                                <div>
                                    <p class="font-bold text-[var(--color-white)]">{{ parseDescription(trx) }}</p>
                                    <p class="text-xs text-[var(--color-text-secondary)]">{{ trx.client_name || (trx.client ? trx.client.name : 'General') }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-[var(--color-text-secondary)] capitalize">
                            {{ getPaymentMethodLabel(trx.payment_method) }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div :class="[
                                'font-bold font-mono text-lg',
                                ['income', 'sale'].includes(trx.type) ? 'text-emerald-500' : 'text-red-500'
                            ]">
                                {{ ['income', 'sale'].includes(trx.type) ? '+' : '-' }} ${{ formatMainAmount(trx) }}
                            </div>
                           <div v-if="getSecondaryAmount(trx)" class="text-xs text-[var(--color-text-secondary)] font-mono opacity-70">
                               {{ getSecondaryAmount(trx) }}
                           </div>
                           <button v-if="trx.currency === 'USD' && trx.amount > 2000" @click="fixTransaction(trx)" class="text-[10px] text-yellow-500 hover:text-yellow-400 underline mt-1 block w-full text-right">
                               ¿Convertir a VES?
                           </button>
                        </td>
                    </tr>
                </tbody>
            </table>
           </div>
        </div>
        <div v-else class="p-6 text-center text-[var(--color-text-secondary)]">
            <p>No hay movimientos de dinero para mostrar con los filtros actuales.</p>
        </div>
    </div>

    <!-- INVENTORY MOVEMENTS TABLE -->
    <div v-if="viewMode === 'inventory'" class="glass-panel overflow-hidden">
        <div v-if="inventoryMovements.length > 0">
           <!-- Mobile Card View (Inventory) -->
           <div class="block md:hidden space-y-4">
              <div v-for="mv in inventoryMovements" :key="mv.id" class="bg-[var(--color-bg-subtle)] p-4 rounded-xl border border-[var(--color-border-subtle)] space-y-3">
                  <div class="flex justify-between items-start">
                      <div>
                          <p class="font-bold text-[var(--color-white)]">{{ mv.product?.name || 'Producto Desconocido' }}</p>
                          <p class="text-xs text-[var(--color-text-secondary)]">{{ new Date(mv.created_at).toLocaleDateString() }}</p>
                      </div>
                      <span :class="[
                            'px-2 py-1 text-xs font-bold rounded-full',
                             mv.transaction?.type === 'expense' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        ]">
                            {{ mv.transaction?.type === 'expense' ? 'Entrada' : 'Salida' }}
                      </span>
                  </div>
                   <div class="flex justify-between items-center border-t border-[var(--color-border-subtle)] pt-3">
                       <span class="text-[var(--color-text-secondary)] text-xs">Ref: {{ parseMovementRef(mv) }}</span>
                       <span class="font-bold font-mono text-white text-lg">
                           {{ mv.transaction?.type === 'expense' ? '+' : '-' }}{{ mv.quantity }}
                       </span>
                   </div>
              </div>
           </div>

           <!-- Desktop Table View (Inventory) -->
           <div class="hidden md:block overflow-x-auto">
             <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-left align-middle">
                <thead class="bg-[var(--color-bg-dark)]/50">
                    <tr>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Producto</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Tipo</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Referencia</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Cantidad</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                    <tr v-for="mv in inventoryMovements" :key="mv.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors duration-150">
                         <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)] font-mono">
                            {{ new Date(mv.created_at).toLocaleDateString() }}
                        </td>
                         <td class="px-6 py-4 text-sm font-bold text-[var(--color-white)]">
                            {{ mv.product?.name || 'Producto Eliminado' }}
                        </td>
                         <td class="px-6 py-4">
                             <span :class="[
                                'px-2 py-1 text-xs font-bold rounded-full',
                                 mv.transaction?.type === 'expense' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            ]">
                                {{ mv.transaction?.type === 'expense' ? 'Entrada' : 'Salida' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                            {{ parseMovementRef(mv) }}
                        </td>
                         <td class="px-6 py-4 text-right font-mono font-bold text-[var(--color-white)]">
                            {{ mv.transaction?.type === 'expense' ? '+' : '-' }}{{ mv.quantity }}
                        </td>
                    </tr>
                </tbody>
             </table>
           </div>
        </div>
        <div v-else class="p-6 text-center text-[var(--color-text-secondary)]">
            <p>No hay movimientos de inventario registrados.</p>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useTransactions } from '~/composables/useTransactions'
import { useOrganization } from '~/composables/useOrganization'
import { watch, ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'dashboard' })

const { 
    transactions, 
    fetchTransactions, 
    loading,
    inventoryMovements,
    loadingMovements,
    fetchInventoryMovements
} = useTransactions()
const { organization } = useOrganization()

const viewMode = ref<'money' | 'inventory'>('money')

const dateFilter = ref('this_month') 
const typeFilter = ref('all') 

// Custom Date Range
const customFrom = ref('')
const customTo = ref('')

// Helpers
const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
        'mobile_pay': 'Pago Móvil',
        'transfer': 'Transferencia',
        'cash': 'Efectivo',
        'card': 'Tarjeta',
        'zelle': 'Zelle',
        'other': 'Otro'
    }
    return map[method] || method
}

// Renaming for clarity in template usage
const formatMainAmount = (trx: any) => {
    let amount = trx.amount || 0
    let rate = trx.exchange_rate || 1
    
    // Safety check: if rate is 0 or null, default to 1 to avoid NaN
    if (!rate || rate <= 0) rate = 1

    // Logic: Return USD Value
    // If recorded as VES, convert to USD
    // OR Heuristic: If Amount > 500 (unlikely for a coffee/lunch in USD) AND Rate > 20, assume it was Bs
    const isVes = trx.currency === 'VES' || (amount > 500 && rate > 20)
    
    if (isVes) {
        return (amount / rate).toFixed(2)
    }
    return amount.toFixed(2)
}

const getSecondaryAmount = (trx: any) => {
    let amount = trx.amount || 0
    let rate = trx.exchange_rate || 1
    if (!rate || rate <= 0) rate = 1

    const isVes = trx.currency === 'VES' || (amount > 500 && rate > 20)
    
    if (isVes) {
        // Main was USD, so Secondary is original Bs
        return `Bs. ${amount.toFixed(2)}`
    } else {
        // Main is USD, maybe show Bs equivalent?
        // User asked: "I should see a detail... how many dollars it equals" (when paid in Bs)
        // Actually user said: "The only accounts kept in Bolivares are those paid in Bolivares... and I should see a detail below of how many Dollars it equals" -> This implies Main = Bs, Detail = USD? 
        // BUT "Todas las cuentas deben ser en dólares". "Me estás colocando 19k... me lo estás colocando con dólares".
        // Interpretation: Main Amount MUST BE USD. Detail can be the original Bs payment if applicable.
        return null 
    }
}

const parseMovementRef = (mv: any) => {
    if (mv.transaction?.description) return mv.transaction.description
    // If sale, maybe show client?
    if (mv.transaction?.type === 'sale') return 'Venta'
    return 'Movimiento'
}

const parseDescription = (trx: any) => {
    if (trx.description) return trx.description
    if (trx.type === 'sale') return 'Venta Registrada'
    if (trx.type === 'expense') return 'Gasto Operativo'
    return 'Transacción'
}

// Data Fixer
const fixTransaction = async (trx: any) => {
    if (!confirm('¿Marcar esta transacción como Bolívares (VES)? Se aplicará tasa del día o 270 por defecto.')) return
    
    // Default rate if missing
    const rate = trx.exchange_rate > 1 ? trx.exchange_rate : 270.79
    
    try {
        const client = useSupabaseClient()
        const { error } = await client
            .from('transactions')
            .update({
                currency: 'VES',
                exchange_rate: rate
            })
            .eq('id', trx.id)

        if (error) throw error
        
        // Optimistic Update
        const t = transactions.value.find(t => t.id === trx.id)
        if (t) {
            t.currency = 'VES'
            t.exchange_rate = rate
        }
    } catch (e) {
        alert('Error actualizando: ' + e.message)
    }
}

const applyFilters = () => {
    const now = new Date()
    let from, to

    switch (dateFilter.value) {
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
        case 'all': 
            from = undefined
            to = undefined
            break
        default:
            from = undefined
            to = undefined
            break
    }

    if (dateFilter.value === 'custom' && (!from || !to)) return

    fetchTransactions({
        dateFrom: from,
        dateTo: to,
        type: typeFilter.value === 'all' ? undefined : typeFilter.value as any
    })
}

// Watchers
watch([dateFilter, typeFilter, organization], () => {
    if (dateFilter.value !== 'custom') {
         if (organization.value?.id) applyFilters()
    }
}, { immediate: true })

watch([customFrom, customTo], () => {
    if (dateFilter.value === 'custom' && customFrom.value && customTo.value) {
        if (organization.value?.id) applyFilters()
    }
})

// Watch viewMode to fetch inventory movements
watch(viewMode, (mode) => {
    if (mode === 'inventory' && inventoryMovements.value.length === 0) {
        if (organization.value?.id) fetchInventoryMovements()
    }
})

onMounted(() => {
    if (organization.value?.id) {
        applyFilters()
        // Prefetch movements if we want? No, let's wait for user to click tab.
    }
})
</script>
