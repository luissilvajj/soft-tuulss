<template>
  <div v-if="sale" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-dark)]/50">
        <div>
            <h2 class="text-xl font-bold text-[var(--color-heading)]">Detalle de Venta</h2>
            <p class="text-xs text-[var(--color-text-secondary)] font-mono opacity-70">ID: {{ sale.id.split('-')[0] }}... • {{ new Date(sale.date).toLocaleDateString() }}</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-[var(--color-bg-subtle)] rounded-full transition-colors">
            <svg class="w-6 h-6 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Content (Scrollable) -->
      <div class="p-6 overflow-y-auto space-y-6">
        
        <!-- Top Info Grid -->
        <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-[var(--color-bg-subtle)]/30 border border-[var(--color-border-subtle)]">
                <p class="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-1">Cliente</p>
                <p class="font-bold text-[var(--color-text-primary)] text-lg">{{ sale.client?.name || 'Cliente Casual' }}</p>
                <p v-if="sale.client?.email" class="text-sm text-[var(--color-text-secondary)]">{{ sale.client.email }}</p>
            </div>
            <div class="p-4 rounded-xl bg-[var(--color-bg-subtle)]/30 border border-[var(--color-border-subtle)]">
                <p class="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-1">Estado & Pago</p>
                <div class="flex items-center gap-2 mb-1">
                     <span :class="[
                        'px-2 py-0.5 rounded-full text-xs font-bold',
                        sale.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                     ]">
                        {{ sale.status === 'paid' ? 'PAGADO' : 'PENDIENTE' }}
                     </span>
                     <span class="text-sm font-medium text-[var(--color-text-primary)] capitalize">{{ sale.payment_method?.replace('_', ' ') }}</span>
                </div>
                <p v-if="sale.payment_reference" class="text-xs font-mono text-[var(--color-text-secondary)]">Ref: {{ sale.payment_reference }}</p>
            </div>
        </div>

        <!-- Items Table -->
        <div>
            <h3 class="text-sm font-bold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">Productos Vendidos</h3>
            <div class="border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-[var(--color-bg-dark)] border-b border-[var(--color-border-subtle)]">
                        <tr>
                            <th class="p-3 font-medium text-[var(--color-text-secondary)]">Producto</th>
                            <th class="p-3 font-medium text-[var(--color-text-secondary)] text-right">Cant.</th>
                            <th class="p-3 font-medium text-[var(--color-text-secondary)] text-right">Precio</th>
                            <th class="p-3 font-medium text-[var(--color-text-secondary)] text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[var(--color-border-subtle)]">
                        <tr v-for="item in (sale.items || [])" :key="item.id" class="hover:bg-[var(--color-bg-subtle)]/30">
                            <td class="p-3 text-[var(--color-text-primary)] font-medium">{{ item.product?.name || 'Producto eliminado' }}</td>
                            <td class="p-3 text-[var(--color-text-primary)] text-right">{{ item.quantity }}</td>
                             <td class="p-3 text-[var(--color-text-secondary)] text-right">{{ formatCurrency(item.price_at_transaction, 'USD') }}</td>
                            <td class="p-3 text-[var(--color-text-primary)] font-bold text-right">{{ formatCurrency(item.price_at_transaction * item.quantity, 'USD') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Financial Summary -->
        <div class="flex justify-end">
            <div class="w-full sm:w-1/2 space-y-3">
                <div class="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Moneda de Venta</span>
                    <span class="font-bold text-[var(--color-text-primary)]">{{ sale.currency || 'USD' }}</span>
                </div>
                <div class="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Tasa de Cambio</span>
                    <span class="font-mono">{{ sale.exchange_rate || 1 }}</span>
                </div>
                <div class="h-px bg-[var(--color-border-subtle)] my-2"></div>
                
                <div class="flex justify-between text-sm">
                    <span class="text-[var(--color-text-secondary)]">Subtotal</span>
                    <span class="font-medium text-[var(--color-text-primary)]">{{ formatCurrency(sale.subtotal || sale.amount, sale.currency) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-[var(--color-text-secondary)]">IVA (16%)</span>
                    <span class="font-medium text-[var(--color-text-primary)]">{{ formatCurrency(sale.tax_iva || 0, sale.currency) }}</span>
                </div>
                <div v-if="(sale.tax_igtf || 0) > 0" class="flex justify-between text-sm">
                    <span class="text-[var(--color-text-secondary)]">IGTF (3%)</span>
                    <span class="font-medium text-[var(--color-text-primary)]">{{ formatCurrency(sale.tax_igtf || 0, sale.currency) }}</span>
                </div>
                
                <div class="flex justify-between items-center pt-2 border-t border-[var(--color-border-subtle)]">
                    <span class="font-bold text-lg text-[var(--color-text-primary)]">Total Pagado</span>
                    <span class="font-black text-2xl text-[var(--color-accent-blue)]">{{ formatCurrency(sale.amount, sale.currency) }}</span>
                </div>
            </div>
        </div>

      </div>
      
      <!-- Footer -->
      <div class="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-dark)]/30 flex justify-end gap-3">
          <button class="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm transition-colors">Imprimir Recibo</button>
          <button @click="$emit('close')" class="px-6 py-2 rounded-lg bg-[var(--color-accent-blue)] text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sale } from '~/types/models'

const props = defineProps<{
  sale: Sale
}>()

defineEmits(['close'])

const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (!amount && amount !== 0) return '-'
    if (currency === 'VES') {
        return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>
