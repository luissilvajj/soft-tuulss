<template>
  <AppModal :show="true" title="Detalle de Venta" description="Recibo de operación" @close="$emit('close')">
    <div class="space-y-6">
        <!-- Header Info -->
        <div class="flex justify-between items-start border-b border-[var(--color-border-subtle)] pb-4">
            <div>
                <p class="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Cliente</p>
                <p class="text-lg font-bold text-[var(--color-heading)]">{{ sale.client_name || 'Cliente Casual' }}</p>
                <p class="text-sm text-[var(--color-text-secondary)]">{{ sale.client_email }}</p>
                <p class="text-sm text-[var(--color-text-secondary)]">{{ sale.client_doc }}</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Fecha</p>
                <p class="font-mono text-[var(--color-heading)]">{{ new Date(sale.created_at).toLocaleString() }}</p>
                <div class="mt-2">
                     <span :class="[
                        'px-2 py-1 text-xs font-bold rounded-full',
                        sale.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                    ]">
                        {{ sale.status === 'paid' ? 'PAGADO' : 'PENDIENTE' }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div class="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
            <table class="min-w-full divide-y divide-[var(--color-border-subtle)]">
                <thead class="bg-[var(--color-bg-subtle)]">
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Cant.</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase w-full">Producto</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase">Precio</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                    <tr v-for="(item, i) in displayItems" :key="i">
                        <td class="px-4 py-2 text-sm text-[var(--color-text-secondary)] text-center">{{ item.qty }}</td>
                        <td class="px-4 py-2 text-sm text-[var(--color-heading)]">{{ item.name }}</td>
                        <td class="px-4 py-2 text-sm text-[var(--color-text-secondary)] text-right font-mono">${{ Number(item.price).toFixed(2) }}</td>
                        <td class="px-4 py-2 text-sm text-[var(--color-heading)] text-right font-mono">${{ (Number(item.price) * Number(item.qty)).toFixed(2) }}</td>
                    </tr>
                    <tr v-if="displayItems.length === 0">
                        <td colspan="4" class="px-4 py-4 text-center text-sm text-[var(--color-text-secondary)] italic">
                            Detalle de items no disponible
                        </td>
                    </tr>
                </tbody>
                </tbody>
            </table>
        </div>

        <!-- Financials -->
        <div class="flex justify-end">
            <div class="w-1/2 space-y-2">
                <div class="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Subtotal</span>
                    <span class="font-mono">${{ Number(sale.subtotal).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>IVA (16%)</span>
                    <span class="font-mono">${{ Number(sale.tax_iva).toFixed(2) }}</span>
                </div>
                <div v-if="sale.tax_igtf > 0" class="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>IGTF (3%)</span>
                    <span class="font-mono">${{ Number(sale.tax_igtf).toFixed(2) }}</span>
                </div>
                
                <div class="border-t border-[var(--color-border-subtle)] pt-2 mt-2">
                    <div class="flex justify-between text-lg font-bold text-[var(--color-heading)]">
                        <span>Total USD</span>
                        <span class="font-mono">${{ Number(sale.amount).toFixed(2) }}</span>
                    </div>
                </div>

                <!-- VES Conversion Display -->
                <div v-if="sale.currency === 'VES' || sale.exchange_rate > 0" class="bg-[var(--color-bg-subtle)] rounded-lg p-3 mt-4">
                     <div class="flex justify-between text-sm text-[var(--color-text-secondary)] mb-1">
                        <span>Tasa de Cambio</span>
                        <span class="font-mono">{{ Number(sale.exchange_rate).toFixed(2) }} Bs/$</span>
                    </div>
                    <div class="flex justify-between text-base font-bold text-[var(--color-accent-blue)]">
                        <span>Total en Bolívares</span>
                        <span class="font-mono">Bs. {{ (Number(sale.amount) * Number(sale.exchange_rate)).toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                     <div class="text-xs text-[var(--color-text-secondary)] text-right mt-1">
                        Método: <span class="capitalize text-[var(--color-heading)]">{{ displayPaymentMethod(sale.payment_method) }}</span>
                        <span v-if="sale.payment_reference"> (Ref: {{ sale.payment_reference }})</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <template #actions>
        <button @click="$emit('close')" class="w-full btn btn-primary">
            Cerrar
        </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import type { Sale } from '~/types/models'

const props = defineProps<{
  sale: Sale
}>()

const displayItems = computed(() => {
    // 1. Try relational data (from fetchSales)
    if (props.sale.items && Array.isArray(props.sale.items) && props.sale.items.length > 0) {
        return props.sale.items.map((i: any) => ({
            qty: i.quantity,
            name: i.product?.name || 'Producto Desconocido',
            price: i.price_at_transaction || 0
        }))
    }
    
    // 2. Try Snapshot field (legacy or fallback)
    if (props.sale.items_snapshot) {
        const raw = typeof props.sale.items_snapshot === 'string' 
            ? JSON.parse(props.sale.items_snapshot) 
            : props.sale.items_snapshot
        return Array.isArray(raw) ? raw : []
    }

    return []
})

const displayPaymentMethod = (method: string) => {
    const map: Record<string, string> = {
        'mobile_pay': 'Pago Móvil',
        'transfer': 'Transferencia',
        'cash': 'Efectivo',
        'zelle': 'Zelle',
        'card': 'Tarjeta',
        'other': 'Otro'
    }
    return map[method] || method
}
</script>
