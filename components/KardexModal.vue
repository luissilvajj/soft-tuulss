<template>
  <AppModal
    :show="show"
    title="Kardex de Inventario"
    :description="productName ? `Historial de movimientos para: ${productName}` : 'Cargando...'"
    @close="$emit('close')"
  >
    <div class="space-y-4 min-h-[400px]">
      <div v-if="loading" class="flex justify-center items-center h-48">
        <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent flex rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="logs.length === 0" class="text-center py-10 text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <p>No hay movimientos registrados en el Kardex para este producto.</p>
        <p class="text-xs text-gray-400 mt-1">El registro en bitácora comenzó luego de la actualización 1.5</p>
      </div>

      <div v-else class="overflow-hidden border border-gray-200 sm:rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motivo
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variación
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nuevo Saldo
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="font-medium">{{ formatDateDefault(log.created_at) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(log.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getReasonBadgeColor(log.change_reason)
                ]">
                  {{ formatReason(log.change_reason) }}
                </span>
                <div v-if="log.user_id" class="text-[10px] mt-1 text-gray-400">Usuario ID: {{ log.user_id.slice(0,8) }}...</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                <span :class="log.quantity_changed > 0 ? 'text-green-600' : (log.quantity_changed < 0 ? 'text-red-600' : 'text-gray-900')">
                  {{ log.quantity_changed > 0 ? '+' : '' }}{{ log.quantity_changed }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold font-mono">
                {{ log.new_stock }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <template #actions>
      <BaseButton variant="secondary" @click="$emit('close')">Cerrar</BaseButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  productId: string
  productName: string
}>()

const emit = defineEmits(['close'])

const client = useSupabaseClient()
const logs = ref<any[]>([])
const loading = ref(false)

const fetchKardex = async () => {
    if (!props.productId) return
    loading.value = true
    try {
        const { data, error } = await client
            .from('inventory_ledger')
            .select('*')
            .eq('product_id', props.productId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error
        logs.value = data || []
    } catch (err: any) {
        console.error('Error fetching Kardex', err)
    } finally {
        loading.value = false
    }
}

watch(() => props.show, (newVal) => {
    if (newVal) {
        fetchKardex()
    } else {
        logs.value = []
    }
})

// Format Helpers
const formatDateDefault = (isoString: string) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatTime = (isoString: string) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const formatReason = (reason: string) => {
    const map: Record<string, string> = {
        'sale_or_decrement': 'Venta / Salida',
        'restock_or_increment': 'Compra / Entrada',
        'adjustment': 'Ajuste Manual',
        'system_initialization': 'Apertura de Sistema'
    }
    return map[reason] || reason
}

const getReasonBadgeColor = (reason: string) => {
     switch (reason) {
        case 'sale_or_decrement': return 'bg-orange-100 text-orange-800'
        case 'restock_or_increment': return 'bg-green-100 text-green-800'
        case 'system_initialization': return 'bg-blue-100 text-blue-800'
        case 'adjustment': return 'bg-yellow-100 text-yellow-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}
</script>
