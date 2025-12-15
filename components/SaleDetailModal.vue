<template>
  <AppModal :show="true" title="Detalle de Venta" description="Recibo de operación" @close="$emit('close')">
    <div class="space-y-6">
        <!-- Header Info -->
        <div class="flex justify-between items-start border-b border-[var(--color-border-subtle)] pb-4">
            <div>
                <p class="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Cliente</p>
                <p class="text-lg font-bold text-[var(--color-heading)]">{{ sale.client_name || 'Cliente Casual' }}</p>
                <div class="flex items-center gap-2 mt-1">
                     <span :class="[
                        'px-2 py-1 text-xs font-bold rounded-full',
                        sale.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                    ]">
                        {{ sale.status === 'paid' ? 'PAGADO' : 'PENDIENTE' }}
                    </span>
                     <!-- Currency Toggle -->
                    <button @click="toggleCurrency" class="btn btn-xs border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)] flex items-center gap-1">
                         <span class="text-[10px] uppercase font-bold">{{ showInVes ? 'Ver en Dólares' : 'Ver en Bolívares' }}</span>
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    </button>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Fecha</p>
                <p class="font-mono text-[var(--color-heading)]">{{ new Date(sale.created_at).toLocaleString() }}</p>
                <p class="text-xs text-[var(--color-text-secondary)] mt-1">Ref: {{ sale.payment_reference || 'N/A' }}</p>
            </div>
        </div>

        <!-- Items Table -->
        <div class="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
            <table class="min-w-full divide-y divide-[var(--color-border-subtle)]">
                <thead class="bg-[var(--color-bg-subtle)]">
                    <tr>
                        <th class="px-4 py-2 text-center text-xs font-medium text-[var(--color-text-secondary)] uppercase w-16">Cant.</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase w-full">Producto</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase whitespace-nowrap">Precio Unit.</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase whitespace-nowrap">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                    <tr v-for="(item, i) in displayItems" :key="i">
                        <td class="px-4 py-2 text-sm text-[var(--color-text-secondary)] text-center font-mono">{{ item.qty }}</td>
                        <td class="px-4 py-2 text-sm text-[var(--color-heading)]">{{ item.name }}</td>
                        <td class="px-4 py-2 text-sm text-[var(--color-text-secondary)] text-right font-mono whitespace-nowrap">
                            {{ formatMoney(item.price, showInVes ? 'VES' : 'USD') }}
                        </td>
                        <td class="px-4 py-2 text-sm text-[var(--color-heading)] text-right font-mono whitespace-nowrap">
                             {{ formatMoney(item.price * item.qty, showInVes ? 'VES' : 'USD') }}
                        </td>
                    </tr>
                    <tr v-if="displayItems.length === 0">
                        <td colspan="4" class="px-4 py-4 text-center text-sm text-[var(--color-text-secondary)] italic">
                            No hay items registrados
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Financials -->
        <div class="flex justify-end">
            <div class="w-1/2 space-y-2">
                 <!-- Main Display (Toggled) -->
                <div class="border-t border-[var(--color-border-subtle)] pt-2 mt-2">
                    <div class="flex justify-between text-lg font-bold text-[var(--color-heading)]">
                        <span>Total {{ showInVes ? 'Bolívares' : 'USD' }}</span>
                        <!-- If showing VES, use paidVesAmount. If USD, use baseUsdAmount -->
                         <span class="font-mono whitespace-nowrap">
                            {{ formatMoney(showInVes ? paidVesAmount : baseUsdAmount, showInVes ? 'VES' : 'USD') }}
                         </span>
                    </div>
                </div>

                <!-- Context Box -->
                <div class="bg-[var(--color-bg-subtle)] rounded-lg p-3 mt-4 border border-[var(--color-border-subtle)] text-sm">
                     
                     <!-- Mixed Payment Details -->
                     <div v-if="sale.payment_details && (sale.payment_details.usd_amount || sale.payment_details.ves_amount)" class="space-y-2">
                        <div class="flex justify-between text-[var(--color-heading)] font-bold mb-2 border-b border-[var(--color-border-subtle)] pb-1">
                            <span>Desglose de Pago (Mixto)</span>
                        </div>
                        <div v-if="sale.payment_details.usd_amount > 0" class="flex justify-between text-[var(--color-text-secondary)]">
                            <span>Pagado en Divisa</span>
                            <span class="font-mono text-emerald-500 whitespace-nowrap">${{ Number(sale.payment_details.usd_amount).toFixed(2) }}</span>
                        </div>
                        <div v-if="sale.payment_details.ves_amount > 0" class="flex justify-between text-[var(--color-text-secondary)]">
                            <span>Pagado en Bolívares</span>
                            <div class="text-right">
                                <span class="font-mono text-[var(--color-accent-blue)] block whitespace-nowrap">Bs. {{ Number(sale.payment_details.ves_amount).toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}</span>
                            </div>
                        </div>
                         <div v-if="sale.tax_igtf > 0" class="flex justify-between text-[var(--color-text-secondary)] text-xs mt-1 pt-1 border-t border-[var(--color-border-subtle)] dashed">
                            <span>Base IGTF (Divisa)</span>
                            <span class="font-mono whitespace-nowrap">${{ Number(sale.payment_details.igtf_base || sale.payment_details.usd_amount).toFixed(2) }}</span>
                        </div>
                     </div>

                     <!-- Standard Single Method Details -->
                     <div v-else>
                        <div class="flex justify-between text-[var(--color-text-secondary)] mb-1">
                            <span>Método de Pago</span>
                            <span class="capitalize font-medium text-[var(--color-heading)]">{{ displayPaymentMethod(sale.payment_method) }}</span>
                        </div>
                        <div class="flex justify-between text-[var(--color-text-secondary)] mb-1">
                            <span>Tasa de Cambio</span>
                            <span class="font-mono whitespace-nowrap">{{ Number(sale.exchange_rate).toFixed(2) }} Bs/$</span>
                        </div>
                        
                        <div class="border-t border-[var(--color-border-subtle)] my-2"></div>
                        
                        <!-- Reference Values -->
                        <div v-if="showInVes" class="flex justify-between font-medium text-emerald-500">
                            <span>Equivalente en Divisa</span>
                            <span class="font-mono whitespace-nowrap">{{ formatMoney(baseUsdAmount, 'USD') }}</span>
                        </div>
                        <div v-else class="flex justify-between font-medium text-[var(--color-accent-blue)]">
                            <span>Equivalente en Bolívares</span>
                            <span class="font-mono whitespace-nowrap">{{ formatMoney(paidVesAmount, 'VES') }}</span>
                        </div>
                     </div>

                     <!-- Common Reference -->
                     <div v-if="sale.payment_reference" class="mt-2 pt-2 border-t border-[var(--color-border-subtle)]">
                        <div class="flex justify-between text-[var(--color-text-secondary)]">
                            <span>Referencia</span>
                            <span class="font-mono whitespace-nowrap">{{ sale.payment_reference }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <template #actions>
        <button @click="printInvoice" class="btn bg-[var(--color-bg-subtle)] text-[var(--color-heading)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] transition-colors flex items-center gap-2 mr-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Imprimir
        </button>
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

const router = useRouter()

const printInvoice = () => {
    // Navigate to print page
    const url = router.resolve(`/app/sales/print/${props.sale.id}`).href
    window.open(url, '_blank')
}

// State for the toggle (User asked for a button)
const showInVes = ref(props.sale.currency === 'VES')

// Computed logic to handle legacy vs new data types
const isOriginalCurrencyVes = computed(() => props.sale.currency === 'VES')

// The Base Amount in USD (Accountable truth)
const baseUsdAmount = computed(() => {
    if (isOriginalCurrencyVes.value) {
        return Number(props.sale.amount) / (Number(props.sale.exchange_rate) || 1)
    }
    return Number(props.sale.amount)
})

// The Paid Amount in VES ( Transaction truth)
const paidVesAmount = computed(() => {
    if (isOriginalCurrencyVes.value) {
        return Number(props.sale.amount)
    }
    return Number(props.sale.amount) * (Number(props.sale.exchange_rate) || 1)
})

const displayItems = computed(() => {
    let items = []
    
    // 1. Try relational data
    if (props.sale.items && Array.isArray(props.sale.items) && props.sale.items.length > 0) {
        items = props.sale.items.map((i: any) => ({
            qty: i.quantity,
            name: i.product?.name || 'Producto Desconocido',
            price: i.price_at_transaction || 0
        }))
    }
    // 2. Try Snapshot
    else if (props.sale.items_snapshot) {
        const raw = typeof props.sale.items_snapshot === 'string' 
            ? JSON.parse(props.sale.items_snapshot) 
            : props.sale.items_snapshot
        items = Array.isArray(raw) ? raw : []
    }

    // Normalize prices based on the toggle view
    return items.map(item => {
        let price = Number(item.price)
        // If the item price comes from DB, it's usually USD (unless legacy snapshot was VES).
        // Assuming database item prices are USD base.
        
        if (showInVes.value) {
             return { ...item, price: price * (Number(props.sale.exchange_rate) || 1) }
        }
        return { ...item, price }
    })
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

// Helpers
const toggleCurrency = () => {
    showInVes.value = !showInVes.value
}

const formatMoney = (amount: number, currency: 'USD' | 'VES') => {
    if (currency === 'VES') {
        return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
}
</script>
