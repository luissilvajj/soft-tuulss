<template>
  <div class="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col font-sans">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 shrink-0 border-b border-surface-border pb-4">
        <div class="flex items-center gap-4">
            <button @click="router.back()" class="p-2 hover:bg-surface-subtle rounded-full transition-colors text-text-secondary">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div>
                <h1 class="text-xl font-bold text-text-heading tracking-tight">Nueva Venta</h1>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <!-- Currency Toggle -->
            <div class="flex items-center bg-surface-subtle rounded-lg p-1 border border-surface-border">
                <button 
                    @click="setCurrency('USD')"
                    :class="[
                        'px-3 py-1 text-xs font-bold rounded-md transition-all',
                        salesStore.currentSale.currency === 'USD' ? 'bg-surface-ground text-primary-600 shadow-sm ring-1 ring-surface-border' : 'text-text-secondary hover:text-text-heading'
                    ]"
                >USD</button>
                <button 
                    @click="setCurrency('VES')"
                    :class="[
                        'px-3 py-1 text-xs font-bold rounded-md transition-all',
                        salesStore.currentSale.currency === 'VES' ? 'bg-surface-ground text-primary-600 shadow-sm ring-1 ring-surface-border' : 'text-text-secondary hover:text-text-heading'
                    ]"
                >VES</button>
            </div>
            <div class="flex items-center gap-2 text-sm">
                <span class="text-text-secondary font-medium">Tasa:</span>
                <div class="relative">
                    <input 
                        v-model.number="salesStore.currentSale.exchangeRate"
                        type="number"
                        class="w-20 bg-transparent border-b border-surface-border focus:border-primary-500 outline-none text-right font-bold text-text-heading"
                    >
                    <span class="absolute right-0 top-0 -mt-2 text-[10px] text-text-secondary opacity-0 hover:opacity-100 transition-opacity">Bs/USD</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-y-auto lg:overflow-visible pb-20 lg:pb-0">
        <!-- Left: Search & Table -->
        <div class="lg:col-span-8 flex flex-col gap-6 min-h-0 order-2 lg:order-1">
            <!-- Search Section -->
            <div class="bg-surface-ground border border-surface-border rounded-2xl p-4 shadow-sm z-30">
                <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Buscar Producto</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input 
                        ref="searchInput"
                        v-model="searchQuery"
                        type="text" 
                        class="w-full bg-surface-subtle border border-surface-border rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 text-text-heading outline-none font-medium"
                        placeholder="Escribe nombre, código o escanea SKU..."
                        @keydown.down.prevent="selectNextResult"
                        @keydown.up.prevent="selectPrevResult"
                        @keydown.enter.prevent="addSelectedResult"
                    />

                    <!-- Results Dropdown -->
                    <div v-if="searchQuery" class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-96 overflow-y-auto z-50 ring-1 ring-black/5">
                        <div v-if="loadingProducts" class="p-4 text-center text-sm text-gray-400">
                            <span class="inline-block animate-spin mr-2">⟳</span> Cargando inventario...
                        </div>
                        <div v-else-if="allProducts.length === 0" class="p-4 text-center text-sm text-status-error">
                             Tu inventario está vacío. Ve a "Inventario" pro crear productos.
                        </div>
                        <div v-else-if="searchResults.length === 0" class="p-4 text-center text-sm text-gray-500">
                             No encontrado.
                        </div>
                        <div 
                            v-else
                            v-for="(product, index) in searchResults" 
                            :key="product.id"
                            @click="handleAddProduct(product)"
                            :class="[
                                'p-3 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors',
                                focusedResultIndex === index ? 'bg-gray-50' : ''
                            ]"
                        >
                            <div>
                                 <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                                 <p class="text-xs text-gray-400">SKU: {{ product.sku || '-' }} • Stock: {{ product.stock }}</p>
                            </div>
                            <span class="text-sm font-semibold text-gray-900">{{ fmtPrice(product.price) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="flex-1 bg-surface-ground border border-surface-border rounded-2xl flex flex-col shadow-sm overflow-hidden min-h-[400px]">
                <div class="p-3 border-b border-surface-border bg-surface-subtle/50 flex justify-between items-center">
                    <span class="text-xs font-bold text-text-secondary uppercase tracking-wider">Items ({{ salesStore.cart.length }})</span>
                    <button v-if="salesStore.cart.length > 0" @click="salesStore.clearCart" class="text-xs text-status-error hover:text-red-700 font-bold transition-colors">Vaciar</button>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-surface-subtle sticky top-0 z-10">
                            <tr>
                                <th class="pl-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider w-[40%]">Producto</th>
                                <th class="text-center py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Cant.</th>
                                <th class="text-right py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Precio</th>
                                <th class="text-center py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Desc. ($)</th>
                                <th class="text-right pr-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Total</th>
                                <th class="w-10"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="(item, index) in salesStore.cart" :key="item.product.id" class="group hover:bg-gray-50/50 transition-colors">
                                <td class="pl-4 py-3">
                                    <p class="font-medium text-gray-900">{{ item.product.name }}</p>
                                    <p class="text-[10px] text-gray-400">Stock: {{ item.product.stock }}</p>
                                </td>
                                <td class="py-3 text-center">
                                    <div class="inline-flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                                        <button @click="handleUpdateQty(index, item.quantity - 1)" class="px-2 py-1 text-gray-500 hover:text-primary-600 transition-colors font-bold text-lg leading-none pb-2">-</button>
                                        <input 
                                            :value="item.quantity"
                                            @input="(e) => handleUpdateQtyInput(index, (e.target as HTMLInputElement).value)"
                                            class="w-10 text-center text-xs font-bold outline-none appearance-none bg-transparent text-gray-900" 
                                        />
                                        <button @click="handleUpdateQty(index, item.quantity + 1)" class="px-2 py-1 text-gray-500 hover:text-primary-600 transition-colors font-bold text-lg leading-none pb-2">+</button>
                                    </div>
                                </td>
                                <td class="py-4 text-right font-mono text-sm text-gray-600">
                                    {{ fmtPrice(item.product.price) }}
                                </td>
                                <td class="py-3 text-center">
                                    <!-- Per Item Discount -->
                                    <input 
                                       v-model.number="item.discount"
                                       type="number"
                                       min="0"
                                       class="w-16 bg-transparent border-b border-gray-200 text-center text-xs outline-none focus:border-primary-500 text-gray-900 transition-colors font-mono"
                                       placeholder="0.00"
                                    >
                                </td>
                                <td class="py-4 text-right font-bold font-mono text-sm text-gray-900">
                                    {{ fmtPrice((item.product.price * item.quantity) - (item.discount || 0)) }}
                                </td>    
                                <td class="py-3 text-center">
                                    <button @click="salesStore.removeFromCart(index)" class="text-gray-300 hover:text-status-error transition-colors p-1">
                                        &times;
                                    </button>
                                </td>
                            </tr>
                             <tr v-if="salesStore.cart.length === 0">
                                <td colspan="6" class="py-20 text-center text-gray-400">
                                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                        <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    </div>
                                    <p class="text-sm font-medium text-gray-500">Carrito vacío</p>
                                    <p class="text-xs text-gray-400 mt-1">Busca productos para agregar a la venta</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Right: Summary -->
        <div class="lg:col-span-4 flex flex-col min-h-0 order-1 lg:order-2 lg:sticky lg:top-0 h-fit lg:max-h-[calc(100vh-12rem)]">
            <div class="bg-surface-ground border border-surface-border rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
                
                <!-- Scrollable Content Area -->
                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                    <!-- Client -->
                    <div>
                         <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Cliente</label>
                         <ClientSelector :key="clientSelectorKey" v-model="salesStore.currentSale.clientId" @create-client="showClientModal = true" />
                    </div>

                    <!-- Document Type (Fiscal vs Internal) -->
                    <div>
                        <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Tipo de Documento</label>
                        <div class="flex bg-surface-subtle p-1 rounded-lg border border-surface-border">
                            <button 
                                @click="salesStore.currentSale.documentType = 'invoice'"
                                :class="[
                                    'flex-1 py-2 px-3 text-sm font-bold rounded-md transition-all',
                                    salesStore.currentSale.documentType === 'invoice' 
                                        ? 'bg-status-success text-white shadow-sm' 
                                        : 'text-text-secondary hover:bg-surface-border/50'
                                ]"
                            >
                                Factura Fiscal
                            </button>
                            <button 
                                @click="salesStore.currentSale.documentType = 'delivery_note'"
                                :class="[
                                    'flex-1 py-2 px-3 text-sm font-bold rounded-md transition-all',
                                    salesStore.currentSale.documentType === 'delivery_note' 
                                        ? 'bg-surface-ground text-text-heading shadow-sm border border-surface-border' 
                                        : 'text-text-secondary hover:bg-surface-border/50'
                                ]"
                            >
                                Nota de Entrega
                            </button>
                        </div>
                    </div>

                    <!-- Payment Method -->
                    <div>
                        <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Método de Pago</label>
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <button 
                                v-for="method in availableMethods" :key="method.id"
                                @click="setPaymentMethod(method.id)"
                                :class="[
                                    'relative px-4 py-3 text-sm rounded-xl transition-all text-left flex items-start flex-col gap-1 border-2',
                                    salesStore.currentSale.paymentMethod === method.id 
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 ring-2 ring-primary-200 dark:ring-primary-900/50' 
                                        : 'border-surface-subtle bg-surface-ground text-text-secondary hover:border-surface-border hover:bg-surface-subtle/50'
                                ]"
                            >
                                <span class="font-bold block">{{ method.label }}</span>
                                <span v-if="salesStore.currentSale.paymentMethod === method.id" class="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary-500"></span>
                            </button>
                        </div>

                        <!-- Mixed Payment / Amounts Section -->
                        <div class="bg-surface-subtle/50 rounded-xl p-4 border border-surface-border space-y-4">
                             <div class="flex items-center justify-between">
                                <label class="text-xs font-bold text-text-secondary uppercase">Desglose</label>
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <span class="text-xs text-primary-600 font-bold group-hover:text-primary-700 transition-colors">Pago Mixto</span>
                                    <input type="checkbox" v-model="salesStore.currentSale.isMixedPayment" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                                </label>
                             </div>
                             
                             <div v-if="salesStore.currentSale.isMixedPayment" class="space-y-3 pt-2">
                                 <!-- USD Payment Input -->
                                 <div>
                                     <div class="flex justify-between mb-1">
                                        <label class="text-xs text-gray-500 font-medium">Divisa ($)</label>
                                        <!-- Quick Fill Button for USD -->
                                        <button 
                                            @click="fillRemainingUsd" 
                                            class="text-[10px] text-primary-600 font-bold uppercase hover:text-primary-700 transition-colors"
                                            v-if="remainingDue > 0.01"
                                        >Completar</button>
                                     </div>
                                     <BaseInput 
                                        v-model.number="salesStore.currentSale.mixedPayment.usdAmount"
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        @input="autoFillVes"
                                     />
                                 </div>
                                 <!-- VES Payment Input -->
                                 <div>
                                     <div class="flex justify-between items-center mb-1">
                                        <label class="text-xs text-gray-500 font-medium">Bolívares (Bs)</label>
                                        <button 
                                            @click="fillRemainingVes" 
                                            class="text-[10px] uppercase font-bold text-primary-600 hover:text-primary-700 transition-colors"
                                        >
                                            Completar ({{ formatPriceInBs(remainingDue * salesStore.currentSale.exchangeRate) }})
                                        </button>
                                     </div>
                                     <BaseInput 
                                        v-model.number="salesStore.currentSale.mixedPayment.vesAmount"
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        @input="autoFillUsd"
                                     />
                                     <div v-if="salesStore.currentSale.mixedPayment.vesAmount > 0" class="text-right mt-1">
                                         <span class="text-[10px] text-gray-400">
                                             Equivale a: <span class="font-bold text-gray-700">${{ (salesStore.currentSale.mixedPayment.vesAmount / (salesStore.currentSale.exchangeRate || 1)).toFixed(2) }}</span>
                                         </span>
                                     </div>
                                 </div>
                                 <!-- Remainder/Change Display -->
                                 <div class="flex justify-between text-xs pt-3 border-t border-surface-border">
                                     <span class="text-text-secondary font-medium">Restante:</span>
                                     <div class="text-right">
                                         <span :class="remainingDue > 0.01 ? 'text-status-error font-bold' : 'text-status-success font-bold'">
                                             ${{ remainingDue.toFixed(2) }}
                                         </span>
                                         <span v-if="remainingDue > 0.01" class="text-text-secondary ml-1 opacity-70">
                                             (~{{ (remainingDue * salesStore.currentSale.exchangeRate).toLocaleString('es-VE', { maximumFractionDigits: 2 }) }} Bs)
                                         </span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <!-- Reference -->
                    <div v-if="needsReference">
                        <BaseInput 
                            v-model="salesStore.currentSale.paymentReference" 
                            label="Referencia" 
                            placeholder="000000" 
                        />
                    </div>

                    <!-- Discount Global -->
                     <div>
                        <BaseInput 
                            v-model.number="salesStore.currentSale.globalDiscount" 
                            label="Descuento Global ($)" 
                            type="number"
                            placeholder="0.00" 
                        />
                     </div>

                    <!-- Tax Toggles -->
                     <div class="flex flex-col gap-3 pt-2">
                         <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" v-model="salesStore.currentSale.isExempt" class="rounded border-surface-border bg-surface-ground text-primary-600 focus:ring-primary-500">
                            <span class="text-sm text-text-secondary group-hover:text-text-heading transition-colors">Venta Exenta de IVA</span>
                         </label>
                         <label class="flex items-center gap-2 cursor-pointer group">
                            <!-- INVERTED LOGIC: Default OFF. Check to INCLUDE tax. -->
                            <input type="checkbox" v-model="salesStore.currentSale.includeIgtf" class="rounded border-surface-border bg-surface-ground text-primary-600 focus:ring-primary-500">
                        <span class="text-sm text-text-secondary group-hover:text-text-heading transition-colors">Cobrar IGTF (3%)</span>
                         </label>
                     </div>
                </div>

                <!-- Sticky Footer: Totals & Action -->
                <div class="bg-surface-subtle border-t border-surface-border p-4 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    <!-- Mini Totals -->
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between text-text-secondary">
                            <span>Subtotal Bruto</span>
                            <span class="font-bold text-text-heading">{{ fmtPrice(financials.subtotal) }}</span>
                        </div>
                        <div v-if="salesStore.currentSale.globalDiscount > 0" class="flex justify-between text-status-success">
                            <span>Descuento Global</span>
                            <span class="font-bold">-{{ fmtPrice(salesStore.currentSale.globalDiscount) }}</span>
                        </div>
                        <div v-if="financials.exemptAmount > 0" class="flex justify-between text-text-secondary">
                            <span>Monto Exento</span>
                            <span class="font-bold text-text-heading">{{ fmtPrice(financials.exemptAmount) }}</span>
                        </div>
                        <div v-if="financials.taxBase > 0" class="flex justify-between text-text-secondary">
                            <span>Base Imponible</span>
                            <span class="font-bold text-text-heading">{{ fmtPrice(financials.taxBase) }}</span>
                        </div>
                        <div v-if="financials.taxGeneralAmount > 0" class="flex justify-between text-text-secondary">
                            <span>IVA (16%)</span>
                             <span class="font-bold text-text-heading">{{ fmtPrice(financials.taxGeneralAmount) }}</span>
                        </div>
                        <div v-if="financials.taxReducedAmount > 0" class="flex justify-between text-text-secondary">
                            <span>IVA Reducido (8%)</span>
                             <span class="font-bold text-text-heading">{{ fmtPrice(financials.taxReducedAmount) }}</span>
                        </div>
                        <div v-if="financials.taxIgtf > 0" class="flex justify-between text-text-secondary">
                            <span>IGTF (3%)</span>
                             <span class="font-bold text-text-heading">{{ fmtPrice(financials.taxIgtf) }}</span>
                        </div>
                    </div>

                    <!-- Grand Total -->
                    <div class="flex justify-between items-end border-t border-dashed border-surface-border pt-3">
                        <span class="text-lg font-bold text-text-secondary mb-1">Total</span>
                         <div class="text-right">
                              <span class="block text-3xl font-black text-primary-600 dark:text-primary-500 leading-none">{{ fmtPrice(financials.total) }}</span>
                              <span class="text-[10px] text-text-secondary dark:text-gray-400 font-mono font-medium block mt-1">
                                 ~ {{ salesStore.currentSale.currency === 'USD' ? `Bs. ${(financials.total * salesStore.currentSale.exchangeRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })}` : `$ ${financials.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }}
                              </span>
                         </div>
                    </div>

                    <!-- Checkout Button -->
                     <BaseButton 
                         @click="handleCheckout"
                         :disabled="processingCheckout || salesStore.cart.length === 0 || (salesStore.currentSale.isMixedPayment && remainingDue > 0.05)"
                         :loading="processingCheckout"
                         variant="primary"
                         full-width
                         class="py-3 text-lg shadow-lg shadow-primary-500/30"
                     >
                         {{ processingCheckout ? 'Procesando...' : 'Cobrar Venta' }}
                     </BaseButton>
                </div>
            </div>
        </div>
    </div>


    <!-- Client Creation Modal -->
    <AppModal 
      :show="showClientModal" 
      title="Nuevo Cliente" 
      description="Información de contacto para la venta." 
      @close="showClientModal = false"
    >
      <div class="space-y-4">
           <BaseInput 
                v-model="newClient.name" 
                label="Nombre Completo" 
                placeholder="Ej. Juan Pérez" 
           />
           <BaseInput 
                v-model="newClient.identity_document" 
                label="Cédula / RIF" 
                placeholder="V-12345678" 
           />
           <BaseInput 
                v-model="newClient.email" 
                label="Email" 
                placeholder="juan@empresa.com" 
                type="email"
           />
           <BaseInput 
                v-model="newClient.phone" 
                label="Teléfono" 
                placeholder="0414 1234567" 
           />
      </div>

      <template #actions>
        <BaseButton 
            full-width 
            variant="primary" 
            :loading="savingClient" 
            @click="saveClient"
        >
            {{ savingClient ? 'Guardando...' : 'Guardar Cliente' }}
        </BaseButton>
      </template>
    </AppModal>

    <!-- Success Modal -->
    <SaleDetailModal 
      v-if="showSuccessModal && lastSale" 
      :sale="lastSale" 
      @close="resetCheckout" 
    />
  </div>
</template>

<script setup lang="ts">
import { useSalesStore } from '~/stores/sales'
import { useOrganization } from '~/composables/useOrganization'
import { useInventory } from '~/composables/useInventory'
import { useFormat } from '~/composables/useFormat'
import { useExchangeRate } from '~/composables/useExchangeRate'
import { useToast } from "vue-toastification"
import { useOnline, watchDebounced } from '@vueuse/core'

definePageMeta({
  layout: 'authenticated'
})

const client = useSupabaseClient()
const router = useRouter()
const salesStore = useSalesStore()
const { organization } = useOrganization()
// Use 'products' from inventory composable but we might want local search results separated
// flexible implementation: use search logic from inventory or keep local filter
const { products: allProducts, loading: loadingProducts, fetchProducts } = useInventory()
const { formatPrice, formatDisplayPrice, formatPriceInBs, formatMoney } = useFormat()

// Currency-aware price formatter for POS display
const fmtPrice = (amount: number) => {
    if (salesStore.currentSale.currency === 'VES') {
        return formatMoney(amount * salesStore.currentSale.exchangeRate, 'VES')
    }
    return formatMoney(amount, 'USD')
}
const { rate, loading: loadingRate, fetchLatestRate } = useExchangeRate()
const toast = useToast()
const isOnline = useOnline()

// State
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const focusedResultIndex = ref(-1)
const showClientModal = ref(false)
const processingCheckout = ref(false)
const clientSelectorKey = ref(0)
const paymentReference = ref('')
const savingClient = ref(false)
const newClient = ref({ name: '', email: '', phone: '', identity_document: '' })
const showSuccessModal = ref(false)
const lastSale = ref<any>(null)

const resetCheckout = () => {
    showSuccessModal.value = false
    lastSale.value = null
    clientSelectorKey.value++ 
    salesStore.currentSale.globalDiscount = 0
    salesStore.currentSale.isMixedPayment = false
    salesStore.currentSale.documentType = 'invoice'
}

// Sync offline sales when coming online
watch(isOnline, (online) => {
    if (online) salesStore.syncOfflineSales()
})

// Initial Load
onMounted(async () => {
    console.log('Softtuuls Build: 1.2.2 - Ultra Resilience Applied')
    // 1. Fetch Inventory if empty
    if (allProducts.value.length === 0) {
        await fetchProducts()
    }
    
    // 2. Force Rate Update
    await fetchLatestRate()
    if (rate.value > 0) {
         salesStore.currentSale.exchangeRate = rate.value
    }

    focusSearch()
})

// Sync rate back to store if it changes globally
watch(rate, (newRate) => {
    if (newRate > 0) salesStore.currentSale.exchangeRate = newRate
})

// Search Logic
const searchResults = computed(() => {
    if (!searchQuery.value || searchQuery.value.length < 2) return []
    const q = searchQuery.value.toLowerCase()
    return allProducts.value.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.sku && p.sku.toLowerCase().includes(q))
    ).slice(0, 8) 
})

const handleAddProduct = (product: any) => {
    salesStore.addToCart(product)
    searchQuery.value = ''
    focusedResultIndex.value = -1
    focusSearch()
}

const handleUpdateQty = (index: number, qty: number) => {
    salesStore.updateCartItemQty(index, qty)
}

const handleUpdateQtyInput = (index: number, value: string) => {
    const qty = parseInt(value, 10)
    if (!isNaN(qty)) {
        salesStore.updateCartItemQty(index, qty)
    } else if (value === '') {
        // Optional: allow empty temporally, but resetting to 1 is safer for the store
        salesStore.updateCartItemQty(index, 1)
    }
}

const selectNextResult = () => {
    if (focusedResultIndex.value < searchResults.value.length - 1) {
        focusedResultIndex.value++
    }
}

const selectPrevResult = () => {
    if (focusedResultIndex.value > 0) {
        focusedResultIndex.value--
    }
}

const addSelectedResult = () => {
    if (focusedResultIndex.value >= 0 && searchResults.value[focusedResultIndex.value]) {
        handleAddProduct(searchResults.value[focusedResultIndex.value])
    }
}

const focusSearch = () => {
    nextTick(() => {
        searchInput.value?.focus()
    })
}

// Client Modal Logic
const saveClient = async () => {
    if (!newClient.value.name || !newClient.value.identity_document) {
        toast.warning('Nombre y Documento son requeridos')
        return
    }
    savingClient.value = true
    try {
        const { data, error } = await client.from('clients').insert({
            name: newClient.value.name,
            email: newClient.value.email,
            phone: newClient.value.phone,
            identity_document: newClient.value.identity_document,
            organization_id: organization.value?.id
        }).select().single()

        if (error) throw error
        
        toast.success('Cliente creado')
        salesStore.currentSale.clientId = data.id
        showClientModal.value = false
        clientSelectorKey.value++ // Refresh selector
        newClient.value = { name: '', email: '', phone: '', identity_document: '' }
    } catch (e: any) {
        toast.error(e.message)
    } finally {
        savingClient.value = false
    }
}

// Currency Logic
const setCurrency = (currency: 'USD' | 'VES') => {
    salesStore.currentSale.currency = currency
    // Reset mixed payment values to avoid confusion when switching base currency
    if (salesStore.currentSale.isMixedPayment) {
        salesStore.currentSale.mixedPayment.usdAmount = 0
        salesStore.currentSale.mixedPayment.vesAmount = 0
    }
}
const setPaymentMethod = (method: string) => {
    salesStore.currentSale.paymentMethod = method
    if (method !== 'exchanged' && method !== 'cash_usd') {
        salesStore.currentSale.isMixedPayment = false
    }
}

// Mixed Payment Helpers
const remainingDue = computed(() => {
    const total = financials.value.total
    const paidUsd = salesStore.currentSale.mixedPayment.usdAmount || 0
    const paidVesInUsd = (salesStore.currentSale.mixedPayment.vesAmount || 0) / (salesStore.currentSale.exchangeRate || 1)
    
    return Math.max(0, total - paidUsd - paidVesInUsd)
})

const fillRemainingUsd = () => {
    const currentVesInUsd = (salesStore.currentSale.mixedPayment.vesAmount || 0) / (salesStore.currentSale.exchangeRate || 1)
    const needed = financials.value.total - currentVesInUsd
    salesStore.currentSale.mixedPayment.usdAmount = Number(needed.toFixed(2))
}

const fillRemainingVes = () => {
    const currentUsd = salesStore.currentSale.mixedPayment.usdAmount || 0
    const neededUsd = financials.value.total - currentUsd
    const neededVes = neededUsd * salesStore.currentSale.exchangeRate
    salesStore.currentSale.mixedPayment.vesAmount = Number(neededVes.toFixed(2))
}

const autoFillVes = () => { /* placeholder */ }
const autoFillUsd = () => { /* placeholder */ }

const needsReference = computed(() => {
    const m = salesStore.currentSale.paymentMethod
    return ['pago_movil', 'transferencia', 'zelle', 'punto_de_venta'].includes(m)
})

const availableMethods = computed(() => {
    const methods = [
        { id: 'mobile_pay', label: 'Pago Móvil' },
        { id: 'card', label: 'Punto de Venta' },
        { id: 'transfer', label: 'Transferencia' },
        { id: 'zelle', label: 'Zelle' },
        { id: 'cash', label: 'Efectivo' },
        { id: 'credit', label: 'Venta a Crédito' }
    ]

    if (salesStore.currentSale.isMixedPayment) {
        return methods.filter(m => ['mobile_pay', 'card', 'transfer', 'zelle', 'cash'].includes(m.id))
    }

    if (salesStore.currentSale.currency === 'USD') {
        return methods.filter(m => ['cash', 'zelle', 'mobile_pay', 'card', 'credit'].includes(m.id))
    } else {
        return methods.filter(m => ['mobile_pay', 'card', 'transfer', 'cash', 'credit'].includes(m.id))
    }
})


// Financials
const financials = computed(() => {
    let subtotal = 0
    let exemptAmount = 0
    let baseGeneral = 0
    let baseReduced = 0

    // Calculate bases after item discounts
    salesStore.cart.forEach(item => {
        const itemTotal = ((item.product?.price || 0) * item.quantity) - (item.discount || 0)
        subtotal += itemTotal

        if (salesStore.currentSale.isExempt) {
            exemptAmount += itemTotal
        } else {
            // Updated default logic: Use General (16%) if not explicitly exempt.
            const taxCond = item.product?.tax_condition || 'general'
            if (taxCond === 'exempt') exemptAmount += itemTotal
            else if (taxCond === 'general') baseGeneral += itemTotal
            else if (taxCond === 'reduced') baseReduced += itemTotal
        }
    })
    
    // Pro-rate global discount across bases
    const globalDiscount = salesStore.currentSale.globalDiscount || 0
    let discountRatio = 0
    if (subtotal > 0 && globalDiscount > 0) {
        discountRatio = globalDiscount / subtotal
        exemptAmount -= (exemptAmount * discountRatio)
        baseGeneral -= (baseGeneral * discountRatio)
        baseReduced -= (baseReduced * discountRatio)
    }

    // Calculate Taxes
    const taxGeneralAmount = baseGeneral * 0.16
    const taxReducedAmount = baseReduced * 0.08
    const taxIva = taxGeneralAmount + taxReducedAmount
    const taxBase = baseGeneral + baseReduced

    // IGTF logic (3% on strictly the USD portion, skipped for non-fiscal docs)
    let igtfAmount = 0
    let igtfBaseInner = 0
    
    // Only apply IGTF if explicit toggle is ON, the document is fiscal, and sale is not entirely exempt
    if (salesStore.currentSale.includeIgtf && salesStore.currentSale.documentType === 'invoice' && !salesStore.currentSale.isExempt) {
         if (salesStore.currentSale.isMixedPayment) {
             // In Mixed Payments, IGTF only applies to the USD amount physically received
             igtfBaseInner = salesStore.currentSale.mixedPayment.usdAmount || 0
         } else if (['cash', 'zelle'].includes(salesStore.currentSale.paymentMethod)) {
             // In pure USD payments, it applies to the whole subtotal + IVA
             igtfBaseInner = exemptAmount + taxBase + taxIva
         }
         
         if (igtfBaseInner > 0) {
             igtfAmount = igtfBaseInner * 0.03
         }
    }

    return {
        subtotal,
        exemptAmount,
        taxBase,
        baseGeneral,
        baseReduced,
        taxGeneralAmount,
        taxReducedAmount,
        taxIva,
        taxIgtf: igtfAmount,
        total: exemptAmount + taxBase + taxIva + igtfAmount
    }
})

const igtfBaseAmount = computed(() => {
    // If mixed, it's strictly the USD amount typed. Else, whole eligible amount before IGTF.
    if (salesStore.currentSale.isMixedPayment) return salesStore.currentSale.mixedPayment.usdAmount || 0
    if (['cash', 'zelle'].includes(salesStore.currentSale.paymentMethod)) return financials.value.total - financials.value.taxIgtf
    return 0
})


// Actions
const handleCheckout = async () => {
    if (salesStore.cart.length === 0) return
    if (!salesStore.currentSale.clientId) {
        toast.warning('Selecciona un cliente')
        return
    }

    processingCheckout.value = true
    try {
        const payload = {
            clientId: salesStore.currentSale.clientId,
            documentType: salesStore.currentSale.documentType,
            status: salesStore.currentSale.status,
            paymentMethod: salesStore.currentSale.paymentMethod,
            paymentReference: salesStore.currentSale.paymentReference,
            date: salesStore.currentSale.date,
            currency: salesStore.currentSale.currency,
            exchangeRate: salesStore.currentSale.exchangeRate,
            subtotal: financials.value.subtotal,
            
            taxIva: financials.value.taxIva,
            taxIgtf: financials.value.taxIgtf,
            exemptAmount: financials.value.exemptAmount,
            taxBase: financials.value.taxBase,
            taxGeneralAmount: financials.value.taxGeneralAmount,
            taxReducedAmount: financials.value.taxReducedAmount,

            discount: salesStore.currentSale.globalDiscount,
            isExempt: salesStore.currentSale.isExempt,
            total: financials.value.total,
            paymentDetails: salesStore.currentSale.isMixedPayment ? {
                usd_amount: salesStore.currentSale.mixedPayment.usdAmount,
                ves_amount: salesStore.currentSale.mixedPayment.vesAmount,
                igtf_base: igtfBaseAmount.value // Store the exact base used for IGTF to help the auditor
            } : null,
            rawItems: salesStore.cart.map(i => {
                const taxCond = salesStore.currentSale.isExempt ? 'exempt' : (i.product.tax_condition || 'general')
                let taxR = 0
                if (taxCond === 'general') taxR = 16.00
                if (taxCond === 'reduced') taxR = 8.00
                
                return {
                    productId: i.product.id,
                    quantity: Number(i.quantity || 0),
                    price: Number(i.product.price || 0),
                    discount: Number(i.discount || 0),
                    taxCondition: taxCond as 'exempt' | 'general' | 'reduced',
                    taxRate: Number(taxR || 0)
                }
            }),
            itemsSnapshot: salesStore.cart.map(i => {
                const taxCond = salesStore.currentSale.isExempt ? 'exempt' : (i.product.tax_condition || 'general')
                let taxR = 0
                if (taxCond === 'general') taxR = 16.00
                if (taxCond === 'reduced') taxR = 8.00

                return {
                    id: i.product.id,
                    name: i.product.name,
                    qty: Number(i.quantity || 0),
                    price: Number(i.product.price || 0),
                    discount: Number(i.discount || 0),
                    taxCondition: taxCond as 'exempt' | 'general' | 'reduced',
                    taxRate: Number(taxR || 0)
                }
            })
        }

        const res = await salesStore.processSale(payload as any)
        toast.success(`Venta procesada exitosamente`)
        
        if (res.sale) {
            lastSale.value = res.sale
            showSuccessModal.value = true
        } else {
            // Offline
            resetCheckout()
        }
    } catch (e: any) {
        toast.error(e.message || 'Error al procesar venta')
    } finally {
        processingCheckout.value = false
    }
}
</script>
