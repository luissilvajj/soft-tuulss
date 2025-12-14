<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gradient">Ventas</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Gestiona y rastrea todas tus operaciones de venta.</p>
      </div>
      <NuxtLink to="/app/sales/new" class="btn btn-primary shadow-lg hover:shadow-xl transform transition-all duration-300">
        <span class="relative flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Nueva Venta
        </span>
      </NuxtLink>
    </div>

<!-- Sales Table -->
    <div class="glass-panel overflow-hidden">
        <div v-if="sales.length > 0">
           <!-- Mobile Card View (Visible only on small screens) -->
           <div class="block md:hidden space-y-4">
              <div v-for="sale in sales" :key="sale.id" class="bg-[var(--color-bg-subtle)] p-4 rounded-xl border border-[var(--color-border-subtle)] space-y-3">
                  <div class="flex justify-between items-start">
                       <div>
                          <p class="font-bold text-[var(--color-white)]">{{ sale.client_name || 'Cliente Casual' }}</p>
                          <p class="text-xs text-[var(--color-text-secondary)] font-mono">{{ new Date(sale.created_at).toLocaleDateString() }}</p>
                       </div>
                       <span class="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 text-[10px] font-bold rounded-full">
                           Pagado
                       </span>
                  </div>
                   <div class="flex justify-between items-center border-t border-[var(--color-border-subtle)] pt-3">
                      <div class="text-sm text-[var(--color-text-secondary)] capitalize">
                          {{ sale.payment_method }}
                      </div>
                      <div class="font-bold text-[var(--color-white)] text-lg">
                          ${{ (sale.total_amount || 0).toFixed(2) }}
                      </div>
                  </div>
                   <button @click="openDetailModal(sale)" class="w-full btn btn-sm bg-[var(--color-bg-dark)] hover:bg-[var(--color-border-subtle)] text-xs">
                        Ver Detalle
                   </button>
              </div>
           </div>

           <!-- Desktop Table View (Hidden on small screens) -->
           <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-left align-middle">
                <thead class="bg-[var(--color-bg-dark)]/50">
                    <tr>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Cliente</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Método</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-center">Estado</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Total</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                    <tr v-for="sale in sales" :key="sale.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors duration-150 group">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)] font-mono">
                            {{ new Date(sale.created_at).toLocaleDateString() }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-[var(--color-accent-blue)] font-bold text-xs">
                                    {{ (sale.client_name || 'C').charAt(0).toUpperCase() }}
                                </div>
                                <span class="font-bold text-[var(--color-white)]">{{ sale.client_name || 'Cliente Casual' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)] capitalize">
                            {{ sale.payment_method }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span class="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full">
                                Pagado
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                             <div class="font-bold font-mono text-lg text-emerald-400">
                                ${{ (sale.total_amount || 0).toFixed(2) }}
                             </div>
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-right">
                            <button @click="openDetailModal(sale)" class="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] text-sm font-medium hover:underline">
                                Ver Detalle
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
           </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div class="w-24 h-24 bg-[var(--color-bg-dark)] rounded-full flex items-center justify-center mb-6 shadow-inner">
                 <svg class="w-10 h-10 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-[var(--color-white)] mb-2">No hay ventas registradas</h3>
            <p class="text-[var(--color-text-secondary)] max-w-sm mb-8">
                Tus operaciones de venta aparecerán aquí. ¡Comienza hoy!
            </p>
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
import { useSales } from '~/composables/useSales'
import { useOrganization } from '~/composables/useOrganization'
import type { Sale } from '~/types/models'

definePageMeta({
  layout: 'dashboard'
})

const { sales, fetchSales, loading } = useSales()
const { organization } = useOrganization()

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
  if (organization.value?.id) fetchSales()
})

watch(() => organization.value, (newOrg) => {
    if (newOrg?.id) fetchSales()
}, { immediate: true })
</script>
