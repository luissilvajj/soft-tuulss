<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-text-heading">Movimientos</h1>
        <p class="mt-1 text-sm text-text-secondary">Historial de todas las transacciones de la organización.</p>
      </div>
      <div v-if="loading || loadingMovements" class="text-sm text-text-secondary animate-pulse">
        Actualizando...
      </div>
    </div>

    <!-- View Toggle -->
    <div class="flex justify-center mb-8">
        <div class="bg-surface-subtle border border-surface-border p-1 rounded-xl flex gap-1">
            <button 
                @click="viewMode = 'money'"
                :class="[
                    'px-6 py-2 rounded-lg text-sm font-bold transition-all',
                    viewMode === 'money' ? 'bg-surface-ground text-primary-600 shadow-sm border border-surface-border' : 'text-text-secondary hover:text-text-heading'
                ]"
            >
                Dinero ($)
            </button>
            <button 
                @click="viewMode = 'inventory'"
                :class="[
                    'px-6 py-2 rounded-lg text-sm font-bold transition-all',
                    viewMode === 'inventory' ? 'bg-surface-ground text-primary-600 shadow-sm border border-surface-border' : 'text-text-secondary hover:text-text-heading'
                ]"
            >
                Inventario
            </button>
        </div>
    </div>

    <!-- Stats/Filters Section (Only for Money View for now) -->
    <div v-if="viewMode === 'money'" class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
       <!-- KPI Card: Total Transactions -->
       <div class="bg-surface-ground p-6 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-primary-500 opacity-5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-10"></div>
          <p class="text-sm font-medium text-text-secondary">Total Movimientos</p>
          <div class="mt-4 flex items-baseline gap-2">
            <p class="text-3xl font-extrabold text-text-heading">{{ transactions.length }}</p>
          </div>
       </div>

       <!-- Filters Area (Spans 3 columns on large screens) -->
       <div class="lg:col-span-3 bg-surface-ground p-6 rounded-xl border border-surface-border shadow-sm flex flex-col justify-center">
          <div class="flex flex-col md:flex-row gap-4 items-end">
              <!-- Date Filter -->
              <div class="flex-1 space-y-2 w-full">
                  <label class="text-xs font-bold text-text-secondary uppercase tracking-wider">Rango de Fechas</label>
                  <div class="flex flex-col md:flex-row gap-2">
                       <div class="relative flex-1">
                           <select 
                               v-model="dateFilter" 
                               class="w-full appearance-none bg-surface-subtle border border-surface-border text-text-heading text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                           >
                               <option value="today">Hoy</option>
                               <option value="yesterday">Ayer</option>
                               <option value="this_week">Esta Semana</option>
                               <option value="this_month">Este Mes</option>
                               <option value="last_month">Mes Pasado</option>
                               <option value="custom">Personalizado</option>
                               <option value="all">Todo el historial</option>
                           </select>
                           <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-secondary">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                           </div>
                       </div>
                       
                       <!-- Custom Date Inputs -->
                       <div v-if="dateFilter === 'custom'" class="flex items-center gap-2 animate-fade-in-right">
                            <input v-model="customFrom" type="date" class="bg-surface-subtle border border-surface-border text-text-heading rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                            <span class="text-text-secondary">-</span>
                            <input v-model="customTo" type="date" class="bg-surface-subtle border border-surface-border text-text-heading rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                       </div>
                  </div>
              </div>

              <!-- Type Filter -->
              <div class="w-full md:w-48 space-y-2">
                  <label class="text-xs font-bold text-text-secondary uppercase tracking-wider">Tipo</label>
                  <div class="relative">
                      <select 
                          v-model="typeFilter" 
                          class="w-full appearance-none bg-surface-subtle border border-surface-border text-text-heading text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                          <option value="all">Todos</option>
                          <option value="income">Ingresos</option>
                          <option value="sale">Ventas</option>
                          <option value="expense">Egresos</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-secondary">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>
          </div>
       </div>
    </div>

    <!-- MONEY TRANSACTIONS TABLE -->
    <div v-if="viewMode === 'money'">
        <UiDataList
            :items="transactions"
            :columns="moneyColumns"
            :loading="loading"
            title-key="description"
        >
            <template #col-date="{ item }">
                <span class="font-mono text-sm text-text-secondary">{{ new Date(item.created_at).toLocaleDateString() }}</span>
            </template>

            <template #col-description="{ item }">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center border',
                        ['income', 'sale'].includes(item.type) && item.document_type !== 'credit_note' ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-error/10 text-status-error border-status-error/20'
                    ]">
                        <svg v-if="['income', 'sale'].includes(item.type) && item.document_type !== 'credit_note'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </div>
                    <div>
                        <p class="font-bold text-text-heading">{{ parseDescription(item) }}</p>
                        <p class="text-xs text-text-secondary">{{ item.client_name || (item.client ? item.client.name : 'General') }}</p>
                    </div>
                </div>
            </template>

            <template #col-method="{ item }">
                <span class="text-sm text-text-secondary capitalize">{{ getPaymentMethodLabel(item.payment_method) }}</span>
            </template>

            <template #col-amount="{ item }">
                <div class="text-right">
                    <div :class="[
                        'font-bold font-mono text-base',
                        ['income', 'sale'].includes(item.type) && item.document_type !== 'credit_note' ? 'text-status-success' : 'text-status-error'
                    ]">
                    {{ ['income', 'sale'].includes(item.type) && item.document_type !== 'credit_note' ? '+' : '-' }} ${{ formatMainAmount(item) }}
                    </div>
                    <div v-if="getSecondaryAmount(item)" class="text-xs text-text-secondary font-mono mt-0.5 opacity-70">
                         {{ getSecondaryAmount(item) }}
                    </div>
                     <button v-if="item.currency === 'USD' && item.amount > 2000" @click="fixTransaction(item)" class="text-[10px] text-status-warning hover:text-yellow-600 underline mt-1 inline-block">
                        ¿Convertir a VES?
                    </button>
                </div>
            </template>

            <!-- Mobile Card Slots -->
            <template #card-subtitle="{ item }">
                <span class="text-xs text-text-secondary">{{ new Date(item.created_at).toLocaleDateString() }}</span>
            </template>
            
            <template #mobile-actions="{ item }">
                 <div class="flex justify-between w-full border-t border-surface-border pt-2 mt-2">
                     <span class="text-xs text-text-secondary">{{ item.client_name || (item.client ? item.client.name : 'General') }}</span>
                     <div class="text-right">
                         <span :class="['font-bold font-mono', ['income', 'sale'].includes(item.type) && item.document_type !== 'credit_note' ? 'text-status-success' : 'text-status-error']">
                             {{ ['income', 'sale'].includes(item.type) && item.document_type !== 'credit_note' ? '+' : '-' }} ${{ formatMainAmount(item) }}
                         </span>
                     </div>
                 </div>
            </template>
        </UiDataList>
    </div>

    <!-- INVENTORY MOVEMENTS TABLE -->
    <div v-if="viewMode === 'inventory'">
         <UiDataList
            :items="inventoryMovements"
            :columns="inventoryColumns"
            :loading="loadingMovements"
            title-key="product_name"
        >
             <template #col-date="{ item }">
                <span class="font-mono text-sm text-text-secondary">{{ new Date(item.created_at).toLocaleDateString() }}</span>
            </template>

            <template #col-product="{ item }">
                <span class="font-bold text-text-heading">{{ item.product?.name || 'Producto Desconocido' }}</span>
            </template>

            <template #col-type="{ item }">
                <span :class="[
                    'px-2 py-1 text-xs font-bold rounded-full border',
                        item.transaction?.type === 'expense' ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-error/10 text-status-error border-status-error/20'
                ]">
                    {{ item.transaction?.type === 'expense' ? 'Entrada' : 'Salida' }}
                </span>
            </template>

            <template #col-reference="{ item }">
                 <span class="text-sm text-text-secondary">{{ parseMovementRef(item) }}</span>
            </template>

            <template #col-quantity="{ item }">
                <span class="font-mono font-bold text-text-heading">
                    {{ item.transaction?.type === 'expense' ? '+' : '-' }}{{ item.quantity }}
                </span>
            </template>
            
            <!-- Mobile Customization -->
            <template #card-title="{ item }">
                {{ item.product?.name || 'Producto Desconocido' }}
            </template>
             <template #card-subtitle="{ item }">
                <span class="text-xs text-text-secondary">{{ new Date(item.created_at).toLocaleDateString() }}</span>
            </template>
             <template #mobile-actions="{ item }">
                <div class="flex justify-between items-center border-t border-surface-border pt-2 mt-2">
                   <span :class="[
                        'px-2 py-0.5 text-[10px] font-bold rounded-full border',
                        item.transaction?.type === 'expense' ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-error/10 text-status-error border-status-error/20'
                    ]">
                        {{ item.transaction?.type === 'expense' ? 'Entrada' : 'Salida' }}
                    </span>
                    <span class="font-bold font-mono text-text-heading">
                         {{ item.transaction?.type === 'expense' ? '+' : '-' }}{{ item.quantity }}
                    </span>
                </div>
            </template>
        </UiDataList>
    </div>

  </div>
</template>

<script setup lang="ts">
import UiDataList from '~/components/ui/DataList.vue'
import { useTransactions } from '~/composables/useTransactions'
import { useOrganization } from '~/composables/useOrganization'
import { watch, ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'authenticated' })

const moneyColumns = [
    { key: 'date', label: 'Fecha' },
    { key: 'description', label: 'Descripción' },
    { key: 'method', label: 'Método' },
    { key: 'amount', label: 'Monto (USD)', class: 'text-right' }
]

const inventoryColumns = [
    { key: 'date', label: 'Fecha' },
    { key: 'product', label: 'Producto' },
    { key: 'type', label: 'Tipo' },
    { key: 'reference', label: 'Referencia' },
    { key: 'quantity', label: 'Cantidad', class: 'text-right' }
]

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
    if (trx.document_type === 'credit_note') return 'Anulación / Nota de Crédito'
    if (trx.document_type === 'debit_note') return 'Nota de Débito'
    if (trx.document_type === 'delivery_note') return 'Nota de Entrega'
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
