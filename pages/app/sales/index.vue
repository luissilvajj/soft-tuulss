<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-[var(--color-heading)]">Ventas 🛍️</h1>
      <NuxtLink to="/app/sales/new" class="btn btn-primary">
        + Nueva Venta
      </NuxtLink>
    </div>

    <!-- Stats Cards (Optional, can be added later) -->

    <!-- Sales List -->
    <div class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-[var(--color-bg-dark)] border-b border-[var(--color-border)]">
          <tr>
            <th class="p-4 font-medium text-[var(--color-text-secondary)]">Fecha</th>
            <th class="p-4 font-medium text-[var(--color-text-secondary)]">Cliente</th>
            <th class="p-4 font-medium text-[var(--color-text-secondary)]">Método</th>
            <th class="p-4 font-medium text-[var(--color-text-secondary)]">Estado</th>
            <th class="p-4 font-medium text-[var(--color-text-secondary)] text-right">Total</th>
            <th class="p-4 font-medium text-[var(--color-text-secondary)]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="animate-pulse">
            <td colspan="6" class="p-4 text-center text-[var(--color-text-secondary)]">Cargando ventas...</td>
          </tr>
          <tr v-else-if="sales.length === 0">
            <td colspan="6" class="p-8 text-center text-[var(--color-text-secondary)]">
              No hay ventas registradas. ¡Crea la primera!
            </td>
          </tr>
          <tr v-else v-for="sale in sales" :key="sale.id" class="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-dark)]/50 transition-colors">
            <td class="p-4 text-[var(--color-text-primary)]">
              {{ new Date(sale.date).toLocaleDateString() }}
            </td>
            <td class="p-4 text-[var(--color-text-primary)]">
              {{ sale.client?.name || 'Cliente Casual' }}
            </td>
            <td class="p-4 text-[var(--color-text-secondary)]">
              <span class="capitalize">{{ sale.payment_method?.replace('_', ' ') }}</span>
              <span v-if="sale.payment_reference" class="block text-xs text-[var(--color-text-secondary)]/70 font-mono">Ref: {{ sale.payment_reference }}</span>
            </td>
            <td class="p-4">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                sale.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                sale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
              ]">
                {{ sale.status === 'paid' ? 'Pagado' : 'Pendiente' }}
              </span>
            </td>
            <td class="p-4 text-[var(--color-text-primary)] text-right font-medium">
              {{ sale.currency === 'VES' ? 'Bs.' : '$' }}{{ (sale.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
            </td>
            <td class="p-4 text-right">
              <button @click="openDetailModal(sale)" class="text-[var(--color-primary)] hover:underline text-sm">Ver Detalle</button>
            </td>
          </tr>
        </tbody>
      </table>
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
import { useSales } from '~/composables/useSales'
import type { Sale } from '~/types/models'

definePageMeta({
  layout: 'dashboard'
})

const { sales, fetchSales, loading } = useSales()

const showDetailModal = ref(false)
const selectedSale = ref<Sale | null>(null)

const openDetailModal = (sale: Sale) => {
    selectedSale.value = sale
    showDetailModal.value = true
}

const closeDetailModal = () => {
    showDetailModal.value = false
    selectedSale.value = null
}

onMounted(() => {
  fetchSales()
})
</script>
