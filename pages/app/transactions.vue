<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-heading)]">Movimientos</h1>
        <p class="text-[var(--color-text-secondary)] text-sm">Historial de todas las transacciones de la organización</p>
      </div>
      <div class="flex gap-2">
           <!-- Placeholder for "Registrar Gasto" -->
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div class="flex-1 w-full">
            <label class="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-1">Rango de Fechas</label>
             <select v-model="filterMode" class="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block p-2.5">
                <option value="this_month">Este Mes</option>
                <option value="last_month">Mes Pasado</option>
                <option value="all_time">Todo el historial</option>
            </select>
        </div>
        <div class="flex-1 w-full">
            <label class="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-1">Tipo</label>
             <select v-model="filterType" class="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block p-2.5">
                <option value="all">Todos</option>
                <option value="sale">Ventas (Ingresos)</option>
                <option value="expense">Gastos (Egresos)</option>
            </select>
        </div>
    </div>

    <!-- Transactions List -->
    <div class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
        <div v-if="loading" class="p-8 text-center text-[var(--color-text-secondary)]">
            <span class="inline-block animate-spin mr-2">⟳</span> Cargando movimientos...
        </div>
        
        <div v-else-if="transactions.length === 0" class="p-12 text-center text-[var(--color-text-secondary)] flex flex-col items-center">
            <svg class="w-16 h-16 text-[var(--color-border-subtle)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <p class="text-lg font-medium text-[var(--color-text-primary)]">Sin movimientos</p>
            <p class="text-sm">No hay transacciones registradas en este periodo.</p>
        </div>

        <table v-else class="w-full text-left text-sm">
            <thead class="bg-[var(--color-bg-dark)] border-b border-[var(--color-border)] uppercase text-xs font-semibold text-[var(--color-text-secondary)] tracking-wider">
                <tr>
                    <th class="p-4">Fecha</th>
                    <th class="p-4">Descripción</th>
                    <th class="p-4">Método</th>
                    <th class="p-4 text-right">Monto</th>
                    <th class="p-4"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border-subtle)]">
                <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors group">
                    <td class="p-4 text-[var(--color-text-primary)] whitespace-nowrap">
                        {{ new Date(tx.date).toLocaleDateString() }}
                    </td>
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            <div :class="[
                                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                                tx.type === 'sale' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            ]">
                                <svg v-if="tx.type === 'sale'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                            </div>
                            <div>
                                <p class="font-bold text-[var(--color-text-primary)]">
                                    {{ tx.type === 'sale' ? 'Venta' : (tx.type === 'expense' ? 'Gasto' : 'Ajuste') }}
                                </p>
                                <p class="text-xs text-[var(--color-text-secondary)]">
                                    {{ tx.client?.name || (tx.type === 'sale' ? 'Cliente Casual' : 'Sin descripción') }}
                                </p>
                            </div>
                        </div>
                    </td>
                    <td class="p-4 text-[var(--color-text-secondary)] capitalize">
                        {{ tx.payment_method?.replace('_', ' ') }}
                        <span v-if="tx.payment_reference" class="block text-[10px] font-mono opacity-70">Ref: {{ tx.payment_reference }}</span>
                    </td>
                    <td class="p-4 text-right font-medium font-mono">
                        <span :class="tx.type === 'sale' ? 'text-emerald-500' : 'text-red-500'">
                            {{ tx.type === 'sale' ? '+' : '-' }}
                            {{ tx.currency === 'VES' ? 'Bs.' : '$' }}{{ (tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                        </span>
                        <p class="text-[10px] text-[var(--color-text-secondary)]" v-if="tx.exchange_rate > 1">
                             Tasa: {{ tx.exchange_rate }}
                        </p>
                    </td>
                    <td class="p-4 text-right">
                        <!-- Future: Open Detail -->
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useTransactions } from '~/composables/useTransactions'
import { useOrganization } from '~/composables/useOrganization'
import { watch, ref, onMounted } from 'vue'

definePageMeta({ layout: 'dashboard' })

const { transactions, fetchTransactions, loading } = useTransactions()
const { organization } = useOrganization()

const filterMode = ref('this_month')
const filterType = ref('all')

const applyFilters = () => {
    const now = new Date()
    let from, to

    if (filterMode.value === 'this_month') {
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    } else if (filterMode.value === 'last_month') {
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
        to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
    }

    fetchTransactions({
        dateFrom: from,
        dateTo: to,
        type: filterType.value === 'all' ? undefined : filterType.value as any
    })
}

watch([filterMode, filterType, organization], () => {
    if (organization.value?.id) applyFilters()
}, { immediate: true })

onMounted(() => {
    if (organization.value?.id) applyFilters()
})
</script>
