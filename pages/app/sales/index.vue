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
