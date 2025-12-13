<template>
  <div class="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col font-sans">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 shrink-0 border-b border-[var(--color-border-subtle)] pb-4">
        <div class="flex items-center gap-4">
            <button @click="router.back()" class="p-2 hover:bg-[var(--color-bg-subtle)] rounded-full transition-colors text-[var(--color-text-secondary)]">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div>
                <h1 class="text-xl font-semibold text-[var(--color-heading)] tracking-tight">Nueva Venta</h1>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <div class="flex items-center bg-[var(--color-bg-subtle)] rounded-lg p-1">
                <button 
                    @click="currency = 'USD'"
                    :class="[
                        'px-3 py-1 text-xs font-medium rounded-md transition-all',
                        currency === 'USD' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'
                    ]"
                >USD</button>
                <button 
                    @click="currency = 'VES'"
                    :class="[
                        'px-3 py-1 text-xs font-medium rounded-md transition-all',
                        currency === 'VES' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'
                    ]"
                >VES</button>
            </div>
            <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-400">Tasa:</span>
                <div class="relative">
                    <input 
                        v-model.number="exchangeRate"
                        type="number"
                        class="w-20 bg-transparent border-b border-gray-200 focus:border-black outline-none text-right font-medium"
                    >
                    <span class="absolute right-0 top-0 -mt-2 text-[10px] text-gray-400 opacity-0 hover:opacity-100 transition-opacity">Bs/USD</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="flex-1 grid grid-cols-12 gap-8 min-h-0">
        <!-- Left: Search & Table -->
        <div class="col-span-8 flex flex-col gap-6 min-h-0">
            <!-- Search -->
            <div class="relative z-20">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                    ref="searchInput"
                    v-model="searchQuery"
                    type="text" 
                    class="w-full bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black focus:border-black transition-all placeholder-gray-400"
                    placeholder="Buscar producto (Nombre o SKU)..."
                    @keydown.down.prevent="selectNextResult"
                    @keydown.up.prevent="selectPrevResult"
                    @keydown.enter.prevent="addSelectedResult"
                />

                <!-- Results Dropdown -->
                <div v-if="searchQuery" class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto z-50 ring-1 ring-black/5">
                    <div v-if="loadingProducts" class="p-4 text-center text-sm text-gray-400">
                        <span class="inline-block animate-spin mr-2">⟳</span> Cargando inventario...
                    </div>
                    <div v-else-if="allProducts.length === 0" class="p-4 text-center text-sm text-red-400">
                         Tu inventario está vacío. Ve a "Inventario" para crear productos.
                    </div>
                    <div v-else-if="searchResults.length === 0" class="p-4 text-center text-sm text-gray-500">
                         No encontrado.
                    </div>
                    <div 
                        v-else
                        v-for="(product, index) in searchResults" 
                        :key="product.id"
                        @click="addProductToCart(product)"
                        :class="[
                            'p-3 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors',
                            focusedResultIndex === index ? 'bg-gray-50' : ''
                        ]"
                    >
                        <div>
                             <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                             <p class="text-xs text-gray-400">SKU: {{ product.sku || '-' }} • Stock: {{ product.stock }}</p>
                        </div>
                        <span class="text-sm font-semibold text-gray-900">{{ formatPrice(product.price) }}</span>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm overflow-hidden">
                <div class="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items ({{ cart.length }})</span>
                    <button v-if="cart.length > 0" @click="cart = []" class="text-xs text-red-600 hover:text-red-700 font-medium">Vaciar</button>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-white sticky top-0 z-10">
                            <tr>
                                <th class="pl-4 py-2 font-medium text-gray-400 w-1/2">Producto</th>
                                <th class="text-center py-2 font-medium text-gray-400">Cant.</th>
                                <th class="text-right py-2 font-medium text-gray-400">Precio</th>
                                <th class="text-right pr-4 py-2 font-medium text-gray-400">Total</th>
                                <th class="w-10"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="(item, index) in cart" :key="item.product.id" class="group hover:bg-gray-50/50">
                                <td class="pl-4 py-3">
                                    <p class="font-medium text-gray-900">{{ item.product.name }}</p>
                                </td>
                                <td class="py-3 text-center">
                                    <div class="inline-flex items-center border border-gray-200 rounded-md bg-white">
                                        <button @click="decrementQty(index)" class="px-2 py-1 text-gray-500 hover:text-black">-</button>
                                        <input v-model.number="item.quantity" class="w-8 text-center text-xs font-medium outline-none appearance-none" />
                                        <button @click="incrementQty(index)" class="px-2 py-1 text-gray-500 hover:text-black">+</button>
                                    </div>
                                </td>
                                <td class="text-right py-3 text-gray-600">{{ formatPrice(item.product.price) }}</td>
                                <td class="text-right pr-4 py-3 font-semibold text-gray-900">{{ formatPrice(item.product.price * item.quantity) }}</td>
                                <td class="py-3 text-center">
                                    <button @click="removeFromCart(index)" class="text-gray-400 hover:text-red-500 transition-colors">
                                        &times;
                                    </button>
                                </td>
                            </tr>
                             <tr v-if="cart.length === 0">
                                <td colspan="5" class="py-20 text-center text-gray-300">
                                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    <p class="text-sm">Carrito vacío</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Right: Summary -->
        <div class="col-span-4 flex flex-col gap-6">
            <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-6">
                <!-- Client -->
                <div>
                     <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cliente</label>
                     <ClientSelector v-model="form.clientId" @create-client="showClientModal = true" />
                </div>

                <!-- Payment Method -->
                <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Método de Pago</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button 
                            v-for="method in availableMethods" :key="method.id"
                            @click="form.paymentMethod = method.id"
                            :class="[
                                'px-3 py-2 text-sm border rounded-md transition-all text-left flex items-center justify-between',
                                form.paymentMethod === method.id 
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-600' 
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            ]"
                        >
                            {{ method.label }}
                            <div v-if="form.paymentMethod === method.id" class="w-2 h-2 rounded-full bg-blue-600"></div>
                        </button>
                    </div>
                </div>

                <!-- Reference -->
                <div v-if="needsReference">
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Referencia</label>
                    <input 
                        v-model="form.paymentReference" 
                        type="text" 
                        class="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none font-mono"
                        placeholder="000000"
                    />
                </div>

                <!-- Tax Toggle -->
                 <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" v-model="form.isExempt" class="rounded border-gray-300 text-black focus:ring-black">
                    <span class="text-sm text-gray-600 group-hover:text-black transition-colors">Venta Exenta de IVA</span>
                 </label>

                <!-- Totals -->
                <div class="border-t border-gray-100 pt-4 space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Subtotal</span>
                        <span class="font-medium">{{ formatPrice(financials.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">IVA (16%)</span>
                         <span class="font-medium">{{ formatPrice(financials.taxIva) }}</span>
                    </div>
                    <div v-if="financials.taxIgtf > 0" class="flex justify-between text-sm">
                        <span class="text-gray-500">IGTF (3%)</span>
                         <span class="font-medium">{{ formatPrice(financials.taxIgtf) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-lg font-bold border-t border-gray-100 pt-3 mt-2">
                        <span>Total</span>
                        <span>{{ formatPrice(financials.total) }}</span>
                    </div>
                     <p class="text-right text-xs text-gray-400">
                        ~ {{ currency === 'USD' ? `Bs. ${(financials.total * exchangeRate).toLocaleString()}` : `$ ${(financials.total / exchangeRate).toLocaleString()}` }}
                     </p>
                </div>

                <!-- Checkout Button -->
                 <button 
                     @click="handleCheckout"
                     :disabled="loading || cart.length === 0 || (needsReference && !form.paymentReference)"
                     class="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-200"
                 >
                     {{ loading ? 'Procesando...' : 'Cobrar' }}
                 </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSales } from '~/composables/useSales'
import { useOrganization } from '~/composables/useOrganization'
import type { Product } from '~/types/models'

definePageMeta({ layout: 'dashboard' })

const { createSale, loading } = useSales()
const { organization } = useOrganization()
const client = useSupabaseClient()
const router = useRouter()

// --- State ---
const currency = ref<'USD' | 'VES'>('USD')
const exchangeRate = ref(60.00)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const focusedResultIndex = ref(0)
const showClientModal = ref(false)
const allProducts = ref<Product[]>([])
const loadingProducts = ref(true)

const cart = ref<{ product: Product, quantity: number }[]>([])

const form = reactive({
    clientId: '',
    paymentMethod: 'cash',
    paymentReference: '',
    status: 'paid' as 'paid' | 'pending',
    date: new Date().toISOString().split('T')[0],
    isExempt: false
})

// --- Computed Config ---
const availableMethods = computed(() => {
    return currency.value === 'VES' 
        ? [ { id: 'mobile_pay', label: 'Pago Móvil' }, { id: 'transfer', label: 'Transferencia' }, { id: 'cash', label: 'Efectivo Bs' }, { id: 'card', label: 'Tarjeta' } ]
        : [ { id: 'cash', label: 'Efectivo $' }, { id: 'zelle', label: 'Zelle' }, { id: 'transfer', label: 'Transf. Intl' }, { id: 'other', label: 'Otro' } ]
})

const needsReference = computed(() => ['mobile_pay', 'transfer', 'zelle', 'card'].includes(form.paymentMethod))

// --- Data Loading ---
const fetchProducts = async () => {
    if (!organization.value?.id) return
    loadingProducts.value = true
    try {
        // Use our own server API to avoid CORS/Browser blocking on Safari
        const { data, error } = await useFetch('/api/products', {
            params: { organization_id: organization.value.id },
            retry: 1
        })

        if (error.value) {
            console.error('Error fetching products:', error.value)
            alert('Error cargando inventario: ' + error.value.message)
            return
        }
        
        if (data.value) {
            allProducts.value = data.value as any
        }
    } catch (e) {
        console.error('Exception fetching products:', e)
    } finally {
        loadingProducts.value = false
    }
}

let pollingInterval: any = null

onMounted(() => {
    fetchProducts()
    searchInput.value?.focus()
    
    // Polling fallback to ensure products load if watcher misses
    pollingInterval = setInterval(() => {
        if (allProducts.value.length === 0 && organization.value?.id) {
            fetchProducts()
        } else if (allProducts.value.length > 0) {
            clearInterval(pollingInterval)
        }
    }, 2000)
})

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval)
})

watch(() => organization.value, (newOrg) => {
    if (newOrg?.id) fetchProducts()
}, { immediate: true })

const searchResults = computed(() => {
    if (!searchQuery.value) return []
    const q = searchQuery.value.toLowerCase()
    return allProducts.value.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(q)
        const skuMatch = p.sku?.toString().toLowerCase().includes(q)
        return nameMatch || skuMatch
    }).slice(0, 8)
})

const selectNextResult = () => { if (focusedResultIndex.value < searchResults.value.length - 1) focusedResultIndex.value++ }
const selectPrevResult = () => { if (focusedResultIndex.value > 0) focusedResultIndex.value-- }
const addSelectedResult = () => { if (searchResults.value.length > 0) addProductToCart(searchResults.value[focusedResultIndex.value]) }

const addProductToCart = (product: Product) => {
    if (product.stock <= 0) return alert('Sin stock disponible')
    const existing = cart.value.find(i => i.product.id === product.id)
    if (existing) {
        if (existing.quantity < product.stock) existing.quantity++
    } else {
        cart.value.push({ product, quantity: 1 })
    }
    searchQuery.value = ''
    focusedResultIndex.value = 0
    searchInput.value?.focus()
}

const removeFromCart = (index: number) => { cart.value.splice(index, 1) }
const incrementQty = (index: number) => { if (cart.value[index].quantity < cart.value[index].product.stock) cart.value[index].quantity++ }
const decrementQty = (index: number) => { cart.value[index].quantity > 1 ? cart.value[index].quantity-- : removeFromCart(index) }

// --- Financial ---
const formatPrice = (amount: number) => {
    return currency.value === 'USD' 
        ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const financials = computed(() => {
    let rawSubtotalUSD = cart.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    let subtotal = currency.value === 'USD' ? rawSubtotalUSD : rawSubtotalUSD * exchangeRate.value
    
    let taxIva = !form.isExempt ? subtotal * 0.16 : 0
    let taxIgtf = (currency.value === 'USD' && form.paymentMethod === 'cash') ? (subtotal + taxIva) * 0.03 : 0
    const total = subtotal + taxIva + taxIgtf

    return { subtotal, taxIva, taxIgtf, total }
})

const handleCheckout = async () => {
    if (cart.value.length === 0) return
    try {
        await createSale({
            clientId: form.clientId || undefined,
            status: form.status,
            paymentMethod: form.paymentMethod,
            paymentReference: form.paymentReference,
            date: form.date,
            currency: currency.value,
            exchangeRate: exchangeRate.value,
            isExempt: form.isExempt,
            subtotal: financials.value.subtotal,
            taxIva: financials.value.taxIva,
            taxIgtf: financials.value.taxIgtf,
            total: financials.value.total,
            itemsSnapshot: cart.value.map(i => ({
                id: i.product.id,
                name: i.product.name,
                qty: i.quantity,
                price: i.product.price 
            }))
        }, cart.value.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })))
        
        alert('Venta Completada')
        router.push('/app/sales')
    } catch (e: any) {
        alert(e.message)
    }
}
</script>
