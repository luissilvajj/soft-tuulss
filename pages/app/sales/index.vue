<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-[var(--color-heading)]">Ventas</h1>
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
            <td class="p-4 text-[var(--color-text-secondary)] capitalize">
              {{ sale.payment_method }}
            </td>
            <td class="p-4">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                sale.status === 'paid' ? 'bg-green-500/10 text-green-500' : 
                sale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
              ]">
                {{ sale.status === 'paid' ? 'Pagado' : 'Pendiente' }}
              </span>
            </td>
            <td class="p-4 text-[var(--color-text-primary)] text-right font-medium">
              ${{ sale.amount.toFixed(2) }}
            </td>
            <td class="p-4 text-right">
              <button class="text-[var(--color-primary)] hover:underline text-sm">Ver</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSales } from '~/composables/useSales'

definePageMeta({
  layout: 'dashboard'
})

const { sales, fetchSales, loading } = useSales()

onMounted(() => {
  fetchSales()
})
</script>
