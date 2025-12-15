<template>
  <div v-if="sale" class="max-w-[800px] mx-auto p-8 bg-white text-black print-container font-sans">
    
    <!-- Print Controls (Hidden when printing) -->
    <div class="no-print mb-6 flex justify-between items-center bg-gray-100 p-4 rounded-lg">
        <div class="text-sm text-gray-500">
            Vista previa de impresión
        </div>
        <div class="flex gap-2">
            <button @click="print" class="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
                Imprimir
            </button>
            <button @click="close" class="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-300">
                Cerrar
            </button>
        </div>
    </div>

    <!-- Invoice Header -->
    <header class="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
        <div>
            <h1 class="text-3xl font-bold uppercase tracking-wide mb-1">{{ organization?.name || 'Soft Tuuls' }}</h1>
            <p class="text-sm text-gray-600">Nota de Entrega / Recibo</p>
        </div>
        <div class="text-right">
            <div class="inline-block bg-gray-100 px-3 py-1 rounded">
                <span class="text-xs font-bold uppercase text-gray-500 block">N° Control</span>
                <span class="text-xl font-mono font-bold">{{ String(sale.id).slice(-6) }}</span>
            </div>
        </div>
    </header>

    <!-- Client & Date Info -->
    <section class="grid grid-cols-2 gap-8 mb-8">
        <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Cliente</label>
            <div class="text-lg font-bold border-b border-gray-300 pb-1">{{ sale.client_name || 'Cliente Casual' }}</div>
            <div v-if="sale.client?.id_number" class="text-sm text-gray-600 mt-1">RIF/CI: {{ sale.client.id_number }}</div>
            <div v-if="sale.client?.phone" class="text-sm text-gray-600">Tel: {{ sale.client.phone }}</div>
        </div>
        <div class="text-right">
             <div class="mb-2">
                <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Fecha de Emisión</label>
                <div class="font-mono text-lg">{{ new Date(sale.date).toLocaleDateString() }}</div>
             </div>
             <div>
                <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Forma de Pago</label>
                <div class="font-medium capitalize">{{ getPaymentMethodLabel(sale.payment_method) }}</div>
             </div>
        </div>
    </section>

    <!-- Items Table -->
    <section class="mb-8">
        <table class="w-full text-left collapse">
            <thead>
                <tr class="border-b-2 border-black">
                    <th class="py-2 w-16 text-center text-xs font-bold uppercase">Cant.</th>
                    <th class="py-2 text-xs font-bold uppercase">Descripción</th>
                    <th class="py-2 text-right w-32 text-xs font-bold uppercase">Precio Unit.</th>
                    <th class="py-2 text-right w-32 text-xs font-bold uppercase">Total</th>
                </tr>
            </thead>
            <tbody class="text-sm">
                <tr v-for="(item, i) in displayItems" :key="i" class="border-b border-gray-100">
                    <td class="py-2 text-center font-mono align-top">{{ item.qty }}</td>
                    <td class="py-2 pr-4 align-top">
                        <div class="font-bold">{{ item.name }}</div>
                        <div v-if="item.sku" class="text-xs text-gray-500">SKU: {{ item.sku }}</div>
                    </td>
                    <td class="py-2 text-right font-mono align-top">${{ Number(item.price).toFixed(2) }}</td>
                    <td class="py-2 text-right font-mono font-bold align-top">${{ (Number(item.price) * item.qty).toFixed(2) }}</td>
                </tr>
            </tbody>
        </table>
    </section>

    <!-- Totals -->
    <section class="flex justify-end mb-12">
        <div class="w-64 space-y-2">
            <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-mono">${{ subtotal.toFixed(2) }}</span>
            </div>
            
             <div v-if="sale.discount > 0" class="flex justify-between text-sm text-green-600">
                <span>Descuento</span>
                <span class="font-mono">-${{ Number(sale.discount).toFixed(2) }}</span>
            </div>

            <div v-if="sale.include_igtf && igtfAmount > 0" class="flex justify-between text-sm text-gray-600">
                <span>IGTF (3%)</span>
                <span class="font-mono">${{ igtfAmount.toFixed(2) }}</span>
            </div>
            
            <div class="flex justify-between text-xl font-bold border-t-2 border-black pt-2 mt-2">
                <span>Total USD</span>
                <span class="font-mono">${{ total.toFixed(2) }}</span>
            </div>

            <div class="text-right text-xs text-gray-500 mt-1 font-mono">
                Tasa Utilizada: {{ Number(sale.exchange_rate).toFixed(2) }} Bs/$
            </div>
             <div class="flex justify-between text-sm font-bold text-gray-800 pt-1">
                <span>Equivalente en Bs.</span>
                <span class="font-mono">{{ (total * Number(sale.exchange_rate)).toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}</span>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
        <p>Gracias por su compra</p>
        <p class="mt-1 font-mono">Generado por Soft Tuuls</p>
    </footer>

  </div>
  <div v-else class="flex items-center justify-center min-h-screen text-gray-500">
      Cargando factura...
  </div>
</template>

<script setup>
definePageMeta({
  layout: false 
})

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const { organization, fetchOrganization } = useOrganization()

const sale = ref(null)

const fetchSale = async () => {
    const { data, error } = await client
        .from('transactions')
        .select(`
            *,
            client:clients(*)
        `)
        .eq('id', route.params.id)
        .single()
    
    if (data) {
        sale.value = data
        // Try to parse snapshot if items are missing
        if (!data.items && data.items_snapshot) {
            sale.value.items = typeof data.items_snapshot === 'string' ? JSON.parse(data.items_snapshot) : data.items_snapshot
        }
    }
}

// Helpers
const subtotal = computed(() => {
    if (!sale.value) return 0
    return displayItems.value.reduce((acc, item) => acc + (item.price * item.qty), 0)
})

const igtfAmount = computed(() => {
     if (!sale.value || !sale.value.include_igtf) return 0
     // Recalculate based on payment details if available, or just raw calc
     if (sale.value.payment_details?.igtf_amount) return Number(sale.value.payment_details.igtf_amount)
     // Fallback (only applies to USD portion usually, but here simplifying for total if explicit)
     return 0
})

const total = computed(() => {
    if (!sale.value) return 0
    // If we have stored total, trust it
    if (sale.value.amount) return Number(sale.value.amount)
    return subtotal.value - (sale.value.discount || 0) + igtfAmount.value
})

const displayItems = computed(() => {
    if (!sale.value) return []
    let items = []
     // 1. Relational
    if (sale.value.items && Array.isArray(sale.value.items)) {
         items = sale.value.items.map(i => ({
             qty: i.quantity,
             name: i.product?.name || i.product_name || 'Item',
             price: i.price_at_transaction || i.price || 0,
             sku: i.product?.sku
         }))
    }
    // 2. Snapshot
    else if (sale.value.items_snapshot) {
         const raw = typeof sale.value.items_snapshot === 'string' ? JSON.parse(sale.value.items_snapshot) : sale.value.items_snapshot
         items = Array.isArray(raw) ? raw : []
    }
    
    return items.map(i => ({ ...i, price: Number(i.price) }))
})

const getPaymentMethodLabel = (method) => {
    const map = {
        'mobile_pay': 'Pago Móvil',
        'transfer': 'Transferencia',
        'cash': 'Efectivo Divisa',
        'zelle': 'Zelle',
        'card': 'Punto de Venta',
        'credit': 'Crédito',
        'mixed': 'Pago Mixto'
    }
    return map[method] || method
}

const print = () => window.print()
const close = () => window.close()

onMounted(async () => {
    await fetchOrganization() // Ensure we have org details
    await fetchSale()
    // Auto-print after small delay to allow render
    if (sale.value) {
        setTimeout(() => {
             // window.print() // Optional: auto trigger
        }, 1000)
    }
})
</script>

<style scoped>
@media print {
    .no-print {
        display: none !important;
    }
    .print-container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
    }
    /* Clean background for print */
    body {
        background-color: white;
    }
}
</style>
