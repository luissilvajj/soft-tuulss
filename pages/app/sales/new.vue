<template>
  <div class="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col">
    <!-- Header Controls -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div class="flex items-center gap-4">
             <NuxtLink to="/app/sales" class="bg-[var(--color-bg-card)] p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] transition-colors">
                <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </NuxtLink>
            <div>
                <h1 class="text-2xl font-bold text-[var(--color-heading)]">Nueva Venta</h1>
                <p class="text-xs text-[var(--color-text-secondary)]">Registra una nueva transacción</p>
            </div>
        </div>

        <!-- Currency & Rate Control -->
        <div class="flex items-center gap-3 bg-[var(--color-bg-card)] p-2 rounded-xl border border-[var(--color-border)]">
            <div class="flex bg-[var(--color-bg-dark)] rounded-lg p-1 border border-[var(--color-border-subtle)]">
                <button 
                    @click="currency = 'USD'"
                    :class="[
                        'px-4 py-1.5 rounded-md text-sm font-bold transition-all',
                        currency === 'USD' ? 'bg-[var(--color-accent-blue)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    ]"
                >
                    USD ($)
                </button>
                <button 
                    @click="currency = 'VES'"
                    :class="[
                        'px-4 py-1.5 rounded-md text-sm font-bold transition-all',
                        currency === 'VES' ? 'bg-[var(--color-accent-blue)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    ]"
                >
                    VES (Bs)
                </button>
            </div>
            
            <div class="h-8 w-px bg-[var(--color-border-subtle)] mx-1"></div>
            
            <div class="flex items-center gap-2 px-2">
                <span class="text-xs font-bold text-[var(--color-text-secondary)]">Tasa:</span>
                <input 
                    type="number" 
                    v-model.number="exchangeRate"
                    class="w-20 bg-transparent text-right font-mono font-bold text-[var(--color-text-primary)] border-b border-dashed border-[var(--color-border-subtle)] focus:border-[var(--color-accent-blue)] outline-none"
                />
                <span class="text-xs text-[var(--color-text-secondary)]">Bs/USD</span>
            </div>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        <!-- LEFT: Product Search & Cart (8 cols) -->
        <div class="lg:col-span-8 flex flex-col gap-4 min-h-0">
            <!-- Search Bar (Progressive) -->
            <div class="relative shrink-0 z-20">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                    ref="searchInput"
                    v-model="searchQuery"
                    type="text" 
                    class="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl py-4 pl-12 pr-4 text-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-shadow shadow-sm"
                    placeholder="Buscar producto por nombre, código o SKU..."
                    @keydown.down.prevent="selectNextResult"
                    @keydown.up.prevent="selectPrevResult"
                    @keydown.enter.prevent="addSelectedResult"
                />
                
                <!-- Autocomplete Dropdown -->
                <div v-if="searchQuery && searchResults.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                    <div 
                        v-for="(product, index) in searchResults" 
                        :key="product.id"
                        @click="addProductToCart(product)"
                        :class="[
                            'p-4 cursor-pointer flex justify-between items-center border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-bg-subtle)] transition-colors',
                            focusedResultIndex === index ? 'bg-[var(--color-bg-subtle)]' : ''
                        ]"
                    >
                        <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-lg bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] flex items-center justify-center">
                                <span class="text-xs font-bold text-[var(--color-text-secondary)]">{{ (product.name || 'P').charAt(0) }}</span>
                             </div>
                             <div>
                                <p class="font-bold text-[var(--color-text-primary)]">{{ product.name }}</p>
                                <p class="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                                    <span :class="product.stock > 0 ? 'text-emerald-500' : 'text-red-500'">● Stock: {{ product.stock }}</span>
                                    <span>• SKU: {{ product.sku || 'N/A' }}</span>
                                </p>
                             </div>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-[var(--color-text-primary)]">{{ formatPrice(product.price) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cart Items List -->
            <div class="flex-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div class="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-dark)]/30 flex justify-between items-center">
                    <h3 class="font-bold text-[var(--color-text-secondary)] uppercase text-xs tracking-wider">Productos en Carrito ({{ cart.length }})</h3>
                    <button @click="cart = []" v-if="cart.length > 0" class="text-xs text-red-500 hover:text-red-400 font-bold hover:underline">Vaciar Carrito</button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-2 space-y-2">
                     <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] opacity-50">
                        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        <p>Busca y agrega productos para comenzar</p>
                     </div>

                     <transition-group name="list" tag="div" class="space-y-2">
                        <div v-for="(item, index) in cart" :key="item.product.id" class="bg-[var(--color-bg-dark)]/50 border border-[var(--color-border-subtle)] rounded-lg p-3 flex items-center gap-4 group hover:border-[var(--color-border)] transition-all">
                             <!-- Image/Icon -->
                             <div class="w-12 h-12 rounded bg-[var(--color-bg-card)] flex items-center justify-center shrink-0">
                                 <span class="font-bold text-[var(--color-text-secondary)]">{{ item.product.name.charAt(0) }}</span>
                             </div>

                             <!-- Info -->
                             <div class="flex-1 min-w-0">
                                 <h4 class="font-bold text-[var(--color-text-primary)] truncate">{{ item.product.name }}</h4>
                                 <p class="text-xs text-[var(--color-text-secondary)]">{{ formatPrice(item.product.price) }} unitario</p>
                             </div>

                             <!-- Controls -->
                             <div class="flex items-center bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]">
                                 <button @click="decrementQty(index)" class="w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">-</button>
                                 <input type="number" v-model.number="item.quantity" class="w-10 bg-transparent text-center font-bold text-sm text-[var(--color-text-primary)] outline-none appearance-none m-0" />
                                 <button @click="incrementQty(index)" class="w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">+</button>
                             </div>

                             <!-- Subtotal -->
                             <div class="w-24 text-right">
                                 <p class="font-bold text-[var(--color-text-primary)]">{{ formatPrice(item.product.price * item.quantity) }}</p>
                             </div>

                             <!-- Remove -->
                             <button @click="removeFromCart(index)" class="p-2 text-[var(--color-text-secondary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                             </button>
                        </div>
                     </transition-group>
                </div>
            </div>
        </div>

        <!-- RIGHT: Summary & Checkout (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-6 min-h-0 overflow-y-auto pb-4">
             <!-- Client Card -->
             <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                 <h3 class="font-bold text-[var(--color-heading)] mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Cliente
                 </h3>
                 <ClientSelector v-model="form.clientId" @create-client="showClientModal = true" />
             </div>

             <!-- Fiscal & Payment -->
             <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-5">
                 <h3 class="font-bold text-[var(--color-heading)] flex items-center gap-2">
                    <svg class="w-5 h-5 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Detalles Fiscales
                 </h3>
                 
                 <!-- Fiscal Toggle -->
                 <label class="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-dark)] cursor-pointer transition-colors">
                     <span class="text-sm font-medium text-[var(--color-text-primary)]">Exento de IVA</span>
                     <div class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="form.isExempt" class="sr-only peer">
                        <div class="w-11 h-6 bg-[var(--color-bg-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-blue)]"></div>
                     </div>
                 </label>

                 <div class="space-y-3">
                     <label class="block text-xs font-bold uppercase text-[var(--color-text-secondary)]">Método de Pago</label>
                     <div class="grid grid-cols-2 gap-2">
                         <button 
                            v-for="method in availableMethods" :key="method.id"
                            @click="form.paymentMethod = method.id"
                            :class="[
                                'p-3 rounded-lg text-sm font-bold border transition-all flex flex-col items-center gap-1',
                                form.paymentMethod === method.id 
                                    ? 'bg-[var(--color-accent-blue)]/10 border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]' 
                                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
                            ]"
                         >
                            <span class="text-xl">{{ method.icon }}</span>
                            {{ method.label }}
                         </button>
                     </div>
                 </div>

                 <!-- Reference Number (Conditional) -->
                 <div v-if="needsReference" class="animate-fade-in-down">
                     <label class="block text-xs font-bold uppercase text-[var(--color-text-secondary)] mb-1">
                        Referencia / Confirmación
                        <span class="text-red-500">*</span>
                     </label>
                     <input 
                        v-model="form.paymentReference" 
                        type="text" 
                        class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-lg p-3 text-[var(--color-text-primary)] focus:border-[var(--color-accent-blue)] outline-none font-mono"
                        placeholder="Ej: 12345678"
                     />
                 </div>
             </div>

             <!-- Calculations Card -->
             <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-xl mt-auto">
                 <div class="space-y-3 mb-4 text-sm">
                     <div class="flex justify-between text-[var(--color-text-secondary)]">
                         <span>Subtotal</span>
                         <span class="font-medium text-[var(--color-text-primary)]">{{ formatPrice(financials.subtotal) }}</span>
                     </div>
                     <div class="flex justify-between items-center text-[var(--color-text-secondary)]">
                         <span>IVA (16%)</span>
                         <span :class="form.isExempt ? 'line-through opacity-50' : 'font-medium text-[var(--color-text-primary)]'">
                            {{ formatPrice(financials.taxIva) }}
                         </span>
                     </div>
                     <div v-if="financials.taxIgtf > 0" class="flex justify-between text-[var(--color-text-secondary)]">
                         <span>IGTF (3%) <span class="text-[var(--color-accent-orange)] text-xs ml-1">(USD Cash)</span></span>
                         <span class="font-medium text-[var(--color-text-primary)]">{{ formatPrice(financials.taxIgtf) }}</span>
                     </div>
                 </div>

                 <div class="border-t border-[var(--color-border)] pt-4 mb-6">
                     <div class="flex justify-between items-baseline">
                         <span class="text-lg font-bold text-[var(--color-text-primary)]">Total a Pagar</span>
                         <span class="text-3xl font-black text-[var(--color-accent-blue)] tracking-tight">
                             {{ formatPrice(financials.total) }}
                         </span>
                     </div>
                     <div class="text-right mt-1">
                         <span class="text-xs text-[var(--color-text-secondary)] font-medium">
                            ~ {{ currency === 'USD' ? `Bs. ${(financials.total * exchangeRate).toLocaleString()}` : `$ ${(financials.total / exchangeRate).toLocaleString()}` }}
                         </span>
                     </div>
                 </div>

                 <button 
                     @click="handleCheckout"
                     :disabled="loading || cart.length === 0 || (needsReference && !form.paymentReference)"
                     class="w-full bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] text-lg flex justify-center items-center gap-2"
                 >
                     <span v-if="loading" class="animate-spin">⟳</span>
                     <span>{{ loading ? 'Procesando...' : 'Confirmar Venta' }}</span>
                     <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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
const exchangeRate = ref(60.00) // Default approx, ideally fetch from API
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const focusedResultIndex = ref(0)
const showClientModal = ref(false)
const allProducts = ref<Product[]>([])

const cart = ref<{ product: Product, quantity: number }[]>([])

const form = reactive({
    clientId: '',
    paymentMethod: 'cash',
    paymentReference: '',
    status: 'paid' as 'paid' | 'pending',
    date: new Date().toISOString().split('T')[0],
    isExempt: false
})

// --- Payment Methods Config ---
const availableMethods = computed(() => {
    if (currency.value === 'VES') {
        return [
            { id: 'mobile_pay', label: 'Pago Móvil', icon: '📱' },
            { id: 'transfer', label: 'Transferencia', icon: '🏦' },
            { id: 'cash', label: 'Efectivo Bs', icon: '💵' },
            { id: 'card', label: 'Tarjeta', icon: '💳' }
        ]
    } else {
        return [
            { id: 'cash', label: 'Efectivo $', icon: '💵' },
            { id: 'zelle', label: 'Zelle', icon: '🟣' },
            { id: 'transfer', label: 'Transf. Intl', icon: '🌎' },
            { id: 'other', label: 'Otro', icon: '⚙️' }
        ]
    }
})

const needsReference = computed(() => {
    return ['mobile_pay', 'transfer', 'zelle', 'card'].includes(form.paymentMethod)
})

// --- Products & Search ---
const fetchProducts = async () => {
    if (!organization.value?.id) {
        console.warn('FetchProducts: No Organization ID yet')
        return
    }
    console.log('FetchProducts: Fetching for org', organization.value.id)
    const { data, error } = await client.from('products').select('*').eq('organization_id', organization.value.id)
    if (error) {
        console.error('FetchProducts Error:', error)
        return
    }
    if (data) {
        console.log(`FetchProducts: Loaded ${data.length} products`)
        allProducts.value = data as any
    }
}

onMounted(() => {
    fetchProducts()
    searchInput.value?.focus()
})

watch(() => organization.value, (newOrg) => {
    if (newOrg?.id) fetchProducts()
})

const searchResults = computed(() => {
    if (!searchQuery.value) return []
    const q = searchQuery.value.toLowerCase()
    return allProducts.value.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(q)
        const skuMatch = p.sku?.toString().toLowerCase().includes(q)
        return nameMatch || skuMatch
    }).slice(0, 8)
})

const selectNextResult = () => {
    if (focusedResultIndex.value < searchResults.value.length - 1) focusedResultIndex.value++
}
const selectPrevResult = () => {
    if (focusedResultIndex.value > 0) focusedResultIndex.value--
}
const addSelectedResult = () => {
    if (searchResults.value.length > 0) {
        addProductToCart(searchResults.value[focusedResultIndex.value])
    }
}

const addProductToCart = (product: Product) => {
    if (product.stock <= 0) {
        alert('Sin stock disponible')
        return
    }
    const existing = cart.value.find(i => i.product.id === product.id)
    if (existing) {
        if (existing.quantity < product.stock) existing.quantity++
    } else {
        cart.value.push({ product, quantity: 1 })
    }
    // Reset inputs
    searchQuery.value = ''
    focusedResultIndex.value = 0
    searchInput.value?.focus()
}

const removeFromCart = (index: number) => {
    cart.value.splice(index, 1)
}

const incrementQty = (index: number) => {
    if (cart.value[index].quantity < cart.value[index].product.stock) {
        cart.value[index].quantity++
    }
}
const decrementQty = (index: number) => {
    if (cart.value[index].quantity > 1) {
        cart.value[index].quantity--
    } else {
        removeFromCart(index)
    }
}

// --- Financial Logic ---
const formatPrice = (amount: number) => {
    if (currency.value === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const financials = computed(() => {
    // 1. Calculate Raw Subtotal (Wait, product prices are base USD usually?)
    // ASSUMPTION: Database prices are in USD.
    let rawSubtotalUSD = cart.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    
    // 2. Convert to View Currency
    let subtotal = currency.value === 'USD' ? rawSubtotalUSD : rawSubtotalUSD * exchangeRate.value
    
    // 3. Taxes
    let taxIva = 0
    if (!form.isExempt) {
        taxIva = subtotal * 0.16
    }
    
    let taxIgtf = 0
    // IGTF applies if paying in Foreign Currency (USD) and usually Cash? 
    // Venezuelan law: IGTF 3% applies to payments in foreign currency.
    // If currency is USD, we assume it triggers IGTF unless Zelle? (Zelle technically foreign too, but often treated differently by some shops, but law says foreign).
    // Let's stick to user request: "IGTF que es del 3 % cuanto la gente paga en dolares cash" -> OK, specifically CASH.
    if (currency.value === 'USD' && form.paymentMethod === 'cash') {
        taxIgtf = (subtotal + taxIva) * 0.03 // Usually on the total amount
    }

    const total = subtotal + taxIva + taxIgtf

    return { subtotal, taxIva, taxIgtf, total }
})

// --- Checkout ---
const handleCheckout = async () => {
    if (cart.value.length === 0) return
    if (needsReference.value && !form.paymentReference) return

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
                price: i.product.price // Store Base USD price or transaction price? Usually transaction price.
            }))
        }, cart.value.map(i => ({ 
            productId: i.product.id, 
            quantity: i.quantity, 
            price: i.product.price // Base Price sent to composable, logic there matches it
        })))

        alert('¡Venta registrada con éxito!')
        router.push('/app/sales')
    } catch (e: any) {
        alert('Error: ' + e.message)
    }
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
