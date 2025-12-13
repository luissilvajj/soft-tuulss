<template>
  <div v-if="sale" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col relative">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
            <h2 class="text-xl font-bold text-gray-900">Detalle de Venta</h2>
            <p class="text-xs text-gray-500 font-mono">ID: {{ sale.id.split('-')[0] }}... • {{ new Date(sale.date).toLocaleDateString() }}</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Content (Scrollable) -->
      <div class="p-6 overflow-y-auto space-y-8 flex-1 bg-white">
        
        <!-- Top Info Grid -->
        <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p class="text-xs font-bold text-gray-400 uppercase mb-1">Cliente</p>
                <div class="flex items-center gap-2">
                     <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {{ (sale.client?.name?.[0] || 'C').toUpperCase() }}
                     </div>
                     <div>
                        <p class="font-bold text-gray-900 leading-tight">{{ sale.client?.name || 'Cliente Casual' }}</p>
                        <p v-if="sale.client?.email" class="text-xs text-gray-500">{{ sale.client.email }}</p>
                     </div>
                </div>
            </div>
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p class="text-xs font-bold text-gray-400 uppercase mb-1">Estado & Pago</p>
                <div class="flex flex-col gap-1">
                     <span class="text-sm font-medium text-gray-900 capitalize flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        {{ sale.payment_method?.replace('_', ' ') }}
                     </span>
                     <div class="flex items-center gap-2">
                        <span :class="[
                            'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide',
                            sale.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                        ]">
                            {{ sale.status === 'paid' ? 'Pagado' : 'Pendiente' }}
                        </span>
                        <span v-if="sale.payment_reference" class="text-xs font-mono text-gray-400">#{{ sale.payment_reference }}</span>
                     </div>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div>
            <h3 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                Items Vendidos
                <span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">{{ (sale.items || []).length }}</span>
            </h3>
            
            <div v-if="!sale.items || sale.items.length === 0" class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
                <p class="text-gray-400 text-sm font-medium">No hay items registrados en esta venta.</p>
                <p class="text-xs text-gray-400 mt-1">Es posible que ocurriera un error al guardarla.</p>
            </div>

            <div v-else class="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="p-3 font-semibold text-gray-500 text-xs uppercase">Producto</th>
                            <th class="p-3 font-semibold text-gray-500 text-xs uppercase text-right">Cant.</th>
                            <th class="p-3 font-semibold text-gray-500 text-xs uppercase text-right">Precio</th>
                            <th class="p-3 font-semibold text-gray-500 text-xs uppercase text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 bg-white">
                        <tr v-for="item in sale.items" :key="item.id" class="hover:bg-gray-50/50">
                            <td class="p-3 text-gray-900 font-medium">{{ item.product?.name || 'Producto eliminado' }}</td>
                            <td class="p-3 text-gray-600 text-right font-mono">{{ item.quantity }}</td>
                             <td class="p-3 text-gray-600 text-right font-mono">{{ formatCurrency(item.price_at_transaction, 'USD') }}</td>
                            <td class="p-3 text-gray-900 font-bold text-right font-mono">{{ formatCurrency(item.price_at_transaction * item.quantity, 'USD') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Financial Summary -->
        <div class="flex justify-end pt-4 border-t border-gray-100">
            <div class="w-full sm:w-1/2 space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Subtotal</span>
                    <span class="font-medium text-gray-900">{{ formatCurrency(sale.subtotal || sale.amount, sale.currency) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">IVA (16%)</span>
                    <span class="font-medium text-gray-900">{{ formatCurrency(sale.tax_iva || 0, sale.currency) }}</span>
                </div>
                <div v-if="(sale.tax_igtf || 0) > 0" class="flex justify-between text-sm">
                    <span class="text-gray-500">IGTF (3%)</span>
                    <span class="font-medium text-gray-900">{{ formatCurrency(sale.tax_igtf || 0, sale.currency) }}</span>
                </div>
                
                <div class="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                    <span class="font-bold text-base text-gray-900">Total Pagado</span>
                    <span class="font-black text-2xl text-black">{{ formatCurrency(sale.amount, sale.currency) }}</span>
                </div>
                 <p class="text-right text-xs text-gray-400 mt-1">
                    Tasa: {{ sale.exchange_rate }} • Moneda: {{ sale.currency }}
                </p>
            </div>
        </div>

      </div>
      
      <!-- Footer -->
      <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <button 
            @click="deleteSale" 
            :disabled="deleting"
            class="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <span v-if="deleting" class="animate-spin">⟳</span>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Eliminar Venta
          </button>

          <div class="flex gap-3">
            <button class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:text-black hover:border-black font-medium text-sm transition-colors">Imprimir Recibo</button>
            <button @click="$emit('close')" class="px-6 py-2 rounded-lg bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">Cerrar</button>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSales } from '~/composables/useSales'
import type { Sale } from '~/types/models'

const props = defineProps<{
  sale: Sale
}>()

const emit = defineEmits(['close', 'refresh'])
const { deleteSale: removeSale } = useSales()
const deleting = ref(false)

const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (!amount && amount !== 0) return '-'
    if (currency === 'VES') {
        return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const deleteSale = async () => {
    if (!confirm('¿Estás seguro de eliminar esta venta? Esta acción no se puede deshacer.')) return
    deleting.value = true
    try {
        await removeSale(props.sale.id)
        emit('close')
        window.location.reload() // Simple reload to refresh list
    } catch (e) {
        alert('Error eliminando venta')
    } finally {
        deleting.value = false
    }
}
</script>
