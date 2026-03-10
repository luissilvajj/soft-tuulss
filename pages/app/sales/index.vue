<template>
  <div>
    <!-- Header Section -->
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-text-heading">Ventas</h1>
        <p class="mt-1 text-sm text-text-secondary">Gestiona y rastrea todas tus operaciones de venta.</p>
    </div>

    <!-- Toolbar -->
    <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <!-- Search -->
        <div class="relative w-full md:w-64">
            <BaseInput
                v-model="searchQuery" 
                placeholder="Buscar..." 
                type="text"
            >
                <template #prefix>
                    <span class="text-gray-400">🔍</span>
                </template>
            </BaseInput>
        </div>
        
        <!-- Actions -->
        <div class="w-full md:w-auto flex justify-end">
            <BaseButton 
                to="/app/sales/new" 
                variant="primary"
                id="tour-new-sale-btn"
            >
                <template #icon>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </template>
                Nueva Venta
            </BaseButton>
        </div>
    </div>

    <!-- Sales List -->
    <UiDataList
        v-if="loading || sales.length > 0"
        :items="sales"
        :columns="columns"
        :loading="loading"
        title-key="client"
    >
        <!-- Custom Columns -->
        <template #col-created_at="{ item }">
            <span class="font-mono text-sm text-gray-600">
                {{ new Date(item.created_at || '').toLocaleDateString() }}
            </span>
        </template>

        <template #col-client="{ item }">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-primary-600 font-bold text-xs shrink-0 border border-indigo-100">
                    {{ getClientName(item).charAt(0).toUpperCase() }}
                </div>
                <span class="font-bold text-gray-900 truncate max-w-[150px]">{{ getClientName(item) }}</span>
            </div>
        </template>

        <template #col-payment_method="{ item }">
            <span class="text-sm text-gray-600 capitalize">
                {{ getPaymentMethodLabel(item.payment_method) }}
            </span>
        </template>

        <template #col-status="{ item }">
             <span :class="[
                'px-2.5 py-0.5 rounded-full text-xs font-medium border',
                item.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
             ]">
                {{ item.status === 'paid' ? 'Pagado' : item.status }}
            </span>
        </template>

        <template #col-amount="{ item }">
            <div class="font-bold font-mono text-sm text-gray-900">
                {{ formatAmount(item) }}
            </div>
        </template>

        <template #col-actions="{ item }">
            <div class="flex justify-end">
                <button @click="openDetailModal(item)" class="text-gray-400 hover:text-primary-600 font-medium text-sm transition-colors p-1">
                    Ver Detalle
                </button>
            </div>
        </template>

        <!-- Mobile Logic -->
        <template #card-title="{ item }">
            {{ getClientName(item) }}
        </template>

        <template #card-subtitle="{ item }">
            {{ formatAmount(item) }}
        </template>

        <template #card-badge="{ item }">
             <span :class="[
                'px-2 py-1 rounded-md text-[10px] font-bold border',
                item.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
             ]">
                {{ item.status === 'paid' ? 'Pagado' : item.status }}
            </span>
        </template>

        <template #mobile-actions="{ item }">
            <div class="flex flex-col gap-1 w-full">
                <div class="flex justify-between items-center text-xs text-gray-500 mb-2">
                     <span>{{ new Date(item.created_at || '').toLocaleDateString() }}</span>
                     <span>{{ getPaymentMethodLabel(item.payment_method) }}</span>
                </div>
                <button @click="openDetailModal(item)" class="w-full py-2 text-primary-600 text-sm font-medium border border-primary-100 rounded-lg hover:bg-primary-50 transition-colors">
                    Ver Detalle
                </button>
            </div>
        </template>
    </UiDataList>

    <!-- Empty State -->
    <div v-else class="py-12 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <div class="flex flex-col items-center justify-center max-w-sm mx-auto p-6">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">No hay ventas registradas</h3>
            <p class="text-gray-500 text-sm mb-6">Tus operaciones de venta aparecerán aquí. ¡Comienza hoy!</p>
            <NuxtLink to="/app/sales/new" class="btn btn-primary">
                Crear Primera Venta
            </NuxtLink>
        </div>
    </div>

    <!-- Detail Modal -->
    <SaleDetailModal 
        v-if="showDetailModal && selectedSale" 
        :sale="selectedSale" 
        @close="closeDetailModal" 
    />
  </div>
</template>

<script setup lang="ts">
import { useTransactions } from '~/composables/useTransactions'
import { useOrganization } from '~/composables/useOrganization'
import type { Transaction } from '~/types/models'
import UiDataList from '~/components/ui/DataList.vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'

definePageMeta({
  layout: 'authenticated'
})

const { transactions: sales, totalTransactions, loading, fetchTransactions, resetTransactionsState } = useTransactions()
const { organization } = useOrganization()

const showDetailModal = ref(false)
const selectedSale = ref<Transaction | null>(null)
const searchQuery = ref('')
const page = ref(1)
const limit = 20

const totalPages = computed(() => {
    return Math.ceil(totalTransactions.value / limit)
})

import { watchDebounced } from '@vueuse/core'

watchDebounced(searchQuery, () => {
    page.value = 1 // reset on new search
    if (organization.value?.id) {
       fetchTransactions({ type: 'sale', page: page.value, limit, search: searchQuery.value })
    }
}, { debounce: 500 })

watch(page, (newPage) => {
    if (organization.value?.id) {
       fetchTransactions({ type: 'sale', page: newPage, limit, search: searchQuery.value })
    }
})

// Removed local filteredSales implementation as it's now handled by the server

const columns = [
    { key: 'created_at', label: 'Fecha', class: 'w-32' },
    { key: 'client', label: 'Cliente' },
    { key: 'payment_method', label: 'Método' },
    { key: 'status', label: 'Estado', class: 'text-center' },
    { key: 'amount', label: 'Total', class: 'text-right' },
    { key: 'actions', label: '', class: 'text-right w-24' }
]

const openDetailModal = (sale: Transaction) => {
    selectedSale.value = sale
    showDetailModal.value = true
}

const closeDetailModal = () => {
    showDetailModal.value = false
    selectedSale.value = null
}

// Helpers
const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
        'mobile_pay': 'Pago Móvil',
        'transfer': 'Transferencia',
        'cash': 'Efectivo',
        'card': 'Tarjeta',
        'zelle': 'Zelle',
        'other': 'Otro',
        'mixed': 'Mixto'
    }
    return map[method] || method
}

// Helper to safely get client name from join or fallback
const getClientName = (sale: any) => {
    return sale.client?.name || sale.client_name || 'Cliente Casual'
}

const formatAmount = (sale: any) => {
    const amount = Number(sale.amount) || 0
    if (sale.currency === 'VES') {
        return `Bs. ${amount.toFixed(2)}`
    }
    return `$${amount.toFixed(2)}`
}

onMounted(() => {
  if (organization.value?.id && sales.value.length === 0) {
      fetchTransactions({ type: 'sale', page: page.value, limit })
  }
})

onUnmounted(() => {
    resetTransactionsState()
})

watch(() => organization.value, (newOrg) => {
    if (newOrg?.id) {
        page.value = 1
        fetchTransactions({ type: 'sale', page: page.value, limit })
    }
}, { immediate: false })
</script>
