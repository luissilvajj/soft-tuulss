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
                    @click="currentSale.currency = 'USD'"
                    :class="[
                        'px-3 py-1 text-xs font-medium rounded-md transition-all',
                        currentSale.currency === 'USD' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'
                    ]"
                >USD</button>
                <button 
                    @click="currentSale.currency = 'VES'"
                    :class="[
                        'px-3 py-1 text-xs font-medium rounded-md transition-all',
                        currentSale.currency === 'VES' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'
                    ]"
                >VES</button>
            </div>
            <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-400">Tasa:</span>
                <div class="relative">
                    <input 
                        v-model.number="currentSale.exchangeRate"
                        type="number"
                        class="w-20 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none text-right font-medium text-[var(--color-text-primary)]"
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
                    class="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all placeholder-gray-400 text-[var(--color-text-primary)]"
                    placeholder="Buscar producto (Nombre, Código o SKU)..."
                    @keydown.down.prevent="selectNextResult"
                    @keydown.up.prevent="selectPrevResult"
                    @keydown.enter.prevent="addSelectedResult"
                />

                <!-- Results Dropdown -->
                <div v-if="searchQuery" class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto z-50 ring-1 ring-black/5">
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
                        @click="handleAddProduct(product)"
                        :class="[
                            'p-3 cursor-pointer flex justify-between items-center border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                            focusedResultIndex === index ? 'bg-gray-50 dark:bg-gray-800' : ''
                        ]"
                    >
                        <div>
                             <p class="text-sm font-medium text-gray-900 dark:text-white">{{ product.name }}</p>
                             <p class="text-xs text-gray-400">SKU: {{ product.sku || '-' }} • Stock: {{ product.stock }}</p>
                        </div>
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatDisplayPrice(product.price) }}</span>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="flex-1 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col shadow-sm overflow-hidden">
                <div class="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items ({{ currentSale.cart.length }})</span>
                    <button v-if="currentSale.cart.length > 0" @click="clearCurrentSale" class="text-xs text-red-600 hover:text-red-700 font-medium">Vaciar</button>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-white dark:bg-[#1C1C1E] sticky top-0 z-10">
                            <tr>
                                <th class="pl-4 py-2 font-medium text-gray-400 w-[40%]">Producto</th>
                                <th class="text-center py-2 font-medium text-gray-400">Cant.</th>
                                <th class="text-right py-2 font-medium text-gray-400">Precio</th>
                                <th class="text-center py-2 font-medium text-gray-400">Desc. ($)</th>
                                <th class="text-right pr-4 py-2 font-medium text-gray-400">Total</th>
                                <th class="w-10"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                            <tr v-for="(item, index) in currentSale.cart" :key="item.product.id" class="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                <td class="pl-4 py-3">
                                    <p class="font-medium text-gray-900 dark:text-white">{{ item.product.name }}</p>
                                    <p class="text-[10px] text-gray-400">Stock: {{ item.product.stock }}</p>
                                </td>
                                <td class="py-3 text-center">
                                    <div class="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                                        <button @click="handleUpdateQty(index, item.quantity - 1)" class="px-2 py-1 text-gray-500 hover:text-black dark:hover:text-white">-</button>
                                        <input 
                                            :value="item.quantity"
                                            @input="(e) => handleUpdateQtyInput(index, (e.target as HTMLInputElement).value)"
                                            class="w-10 text-center text-xs font-medium outline-none appearance-none bg-transparent text-[var(--color-text-primary)]" 
                                        />
                                        <button @click="handleUpdateQty(index, item.quantity + 1)" class="px-2 py-1 text-gray-500 hover:text-black dark:hover:text-white">+</button>
                                    </div>
                                </td>
                                <td class="py-4 text-right font-mono text-sm text-[var(--color-text-primary)]">
                                    {{ formatDisplayPrice(item.product.price) }}
                                </td>
                                <td class="py-3 text-center">
                                    <!-- Per Item Discount -->
                                    <input 
                                       v-model.number="item.discount"
                                       type="number"
                                       min="0"
                                       class="w-16 bg-transparent border-b border-gray-200 dark:border-gray-700 text-center text-xs outline-none focus:border-black dark:focus:border-white text-[var(--color-text-primary)]"
                                       placeholder="0.00"
                                    >
                                </td>
                                <td class="py-4 text-right font-bold font-mono text-sm text-[var(--color-text-primary)]">
                                    {{ formatDisplayPrice((item.product.price * item.quantity) - (item.discount || 0)) }}
                                </td>    
                                <td class="py-3 text-center">
                                    <button @click="removeFromCart(index)" class="text-gray-400 hover:text-red-500 transition-colors">
                                        &times;
                                    </button>
                                </td>
                            </tr>
                             <tr v-if="currentSale.cart.length === 0">
                                <td colspan="6" class="py-20 text-center text-gray-300 dark:text-gray-600">
                                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
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
            <div class="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm space-y-6">
                <!-- Client -->
                <div>
                     <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cliente</label>
                     <ClientSelector :key="clientSelectorKey" v-model="currentSale.clientId" @create-client="showClientModal = true" />
                </div>

                <!-- Payment Method -->
                <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Método de Pago</label>
                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <button 
                            v-for="method in availableMethods" :key="method.id"
                            @click="setPaymentMethod(method.id)"
                            :class="[
                                'px-3 py-2 text-sm border rounded-md transition-all text-left flex items-center justify-between',
                                currentSale.paymentMethod === method.id 
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium ring-1 ring-blue-600' 
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            ]"
                        >
                            {{ method.label }}
                            <div v-if="currentSale.paymentMethod === method.id" class="w-2 h-2 rounded-full bg-blue-600"></div>
                        </button>
                    </div>

                    <!-- Mixed Payment / Amounts Section -->
                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 space-y-3">
                         <div class="flex items-center justify-between">
                            <label class="text-xs font-semibold text-gray-500 uppercase">Desglose de Pago</label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <span class="text-xs text-blue-600 font-medium">Pago Mixto / Exacto</span>
                                <input type="checkbox" v-model="currentSale.isMixedPayment" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            </label>
                         </div>
                         
                         <div v-if="currentSale.isMixedPayment" class="space-y-3 pt-2">
                             <!-- USD Payment Input -->
                             <div>
                                 <div class="flex justify-between mb-1">
                                    <label class="text-xs text-gray-400">Monto en Divisa ($)</label>
                                    <!-- Quick Fill Button for USD -->
                                    <button 
                                        @click="fillRemainingUsd" 
                                        class="text-[10px] text-blue-500 font-bold uppercase hover:underline"
                                        v-if="remainingDue > 0.01"
                                    >Completar</button>
                                 </div>
                                 <input 
                                    v-model.number="currentSale.mixedPayment.usdAmount"
                                    type="number"
                                    step="0.01" 
                                    class="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm font-mono focus:border-blue-500 outline-none"
                                    placeholder="0.00"
                                    @input="autoFillVes"
                                 >
                             </div>
                             <!-- VES Payment Input -->
                             <div>
                                 <div class="flex justify-between items-center mb-1">
                                    <label class="text-xs text-gray-400">Monto en Bolívares (Bs)</label>
                                    <button 
                                        @click="fillRemainingVes" 
                                        class="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 transition-colors"
                                    >
                                        Completar ({{ formatPriceInBs(remainingDue * currentSale.exchangeRate) }})
                                    </button>
                                 </div>
                                 <input 
                                    v-model.number="currentSale.mixedPayment.vesAmount"
                                    type="number"
                                    step="0.01"
                                    class="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm font-mono focus:border-blue-500 outline-none"
                                    placeholder="0.00"
                                    @input="autoFillUsd"
                                 >
                                 <div v-if="currentSale.mixedPayment.vesAmount > 0" class="text-right mt-1">
                                     <span class="text-[10px] text-gray-400">
                                         Equivale a: <span class="font-bold text-[var(--color-text-primary)]">${{ (currentSale.mixedPayment.vesAmount / (currentSale.exchangeRate || 1)).toFixed(2) }}</span>
                                     </span>
                                 </div>
                             </div>
                             <!-- Remainder/Change Display -->
                             <div class="flex justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                                 <span class="text-gray-500">Restante por Pagar:</span>
                                 <div class="text-right">
                                     <span :class="remainingDue > 0.01 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'">
                                         ${{ remainingDue.toFixed(2) }}
                                     </span>
                                     <span v-if="remainingDue > 0.01" class="text-gray-400 ml-1">
                                         (~{{ (remainingDue * currentSale.exchangeRate).toLocaleString('es-VE', { maximumFractionDigits: 2 }) }} Bs)
                                     </span>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                <!-- Reference -->
                <div v-if="needsReference">
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Referencia</label>
                    <input 
                        v-model="currentSale.paymentReference" 
                        type="text" 
                        class="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none font-mono text-[var(--color-text-primary)]"
                        placeholder="000000"
                    />
                </div>

                <!-- Discount Global -->
                 <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Descuento Global ($)</label>
                    <input 
                        v-model.number="currentSale.globalDiscount"
                        type="number"
                        min="0"
                        class="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none font-mono text-[var(--color-text-primary)]"
                        placeholder="0.00"
                    />
                 </div>

                <!-- Tax Toggles -->
                 <div class="flex flex-col gap-2">
                     <label class="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" v-model="currentSale.isExempt" class="rounded border-gray-300 text-black focus:ring-black">
                        <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Venta Exenta de IVA</span>
                     </label>
                     <label class="flex items-center gap-2 cursor-pointer group">
                        <!-- INVERTED LOGIC: Default OFF. Check to INCLUDE tax. -->
                        <input type="checkbox" v-model="currentSale.includeIgtf" class="rounded border-gray-300 text-black focus:ring-black">
                        <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Cobrar IGTF (3%)</span>
                     </label>
                 </div>

                <!-- Totals -->
                <div class="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                    <div class="flex justify-between text-sm text-[var(--color-text-primary)]">
                        <span class="text-gray-500">Subtotal</span>
                        <span class="font-medium">{{ formatDisplayPrice(financials.subtotal) }}</span>
                    </div>
                     <div v-if="currentSale.globalDiscount > 0" class="flex justify-between text-sm text-green-600">
                        <span>Descuento</span>
                        <span>-{{ formatDisplayPrice(currentSale.globalDiscount) }}</span>
                    </div>
                    <div class="flex justify-between text-sm text-[var(--color-text-primary)]">
                        <span class="text-gray-500">IVA (16%)</span>
                         <span class="font-medium">{{ formatDisplayPrice(financials.taxIva) }}</span>
                    </div>
                    <div v-if="financials.taxIgtf > 0" class="flex justify-between text-sm text-[var(--color-text-primary)]">
                        <span class="text-gray-500">IGTF (3% de ${{ igtfBaseAmount.toFixed(2) }})</span>
                         <span class="font-medium">{{ formatDisplayPrice(financials.taxIgtf) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-lg font-bold border-t border-gray-100 dark:border-gray-800 pt-3 mt-2 text-[var(--color-text-primary)]">
                        <span>Total</span>
                        <span>{{ formatDisplayPrice(financials.total) }}</span>
                    </div>
                     <p class="text-right text-xs text-gray-400">
                        ~ {{ currentSale.currency === 'USD' ? `Bs. ${(financials.total * currentSale.exchangeRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })}` : `$ ${(financials.total).toLocaleString('en-US', { maximumFractionDigits: 2 })}` }}
                     </p>
                </div>

                <!-- Checkout Button -->
                 <button 
                     @click="handleCheckout"
                     :disabled="loading || currentSale.cart.length === 0 || (needsReference && !currentSale.paymentReference) || (currentSale.isMixedPayment && remainingDue > 0.05)"
                     class="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-200 dark:shadow-none"
                 >
                     {{ loading ? 'Procesando...' : 'Cobrar' }}
                 </button>
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
        <div>
           <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Nombre Completo</label>
           <input v-model="newClient.name" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="Ej. Juan Pérez">
        </div>
        <div>
           <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Cédula / RIF</label>
           <input v-model="newClient.identity_document" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="V-12345678">
        </div>
        <div>
           <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Email</label>
           <input v-model="newClient.email" type="email" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="juan@empresa.com">
        </div>
         <div>
           <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Teléfono</label>
           <input v-model="newClient.phone" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="0414 1234567">
        </div>
      </div>

      <template #actions>
        <button @click="saveClient" type="button" class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" :disabled="savingClient">
         {{ savingClient ? 'Guardando...' : 'Guardar Cliente' }}
       </button>
       <button @click="showClientModal = false" type="button" class="px-6 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-bg-dark)] focus:outline-none transition-colors">
         Cancelar
       </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useSales } from '~/composables/useSales'
import { useOrganization } from '~/composables/useOrganization'
import type { Product } from '~/types/models'

definePageMeta({ layout: 'dashboard' })

const { createSale, loading, currentSale, addToCart, removeFromCart, updateCartItemQty, clearCurrentSale } = useSales()
const { organization } = useOrganization()
const client = useSupabaseClient()
const router = useRouter()

// --- Local UI State ---
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const focusedResultIndex = ref(0)
const showClientModal = ref(false)
const clientSelectorKey = ref(0) // Force re-render of selector
const savingClient = ref(false)
const newClient = ref({ name: '', email: '', phone: '', identity_document: '' })
const allProducts = ref<Product[]>([])
const loadingProducts = ref(true)

// --- Computed Config ---
const availableMethods = computed(() => {
    // Payment Methods: Cash, Zelle, Transfer, Mobile Pay, Credit, Card
    // Order requested: Most common first.
    // Assuming: Cash $, Pago Movil, Zelle, Credit, Transfer
    return currentSale.value.currency === 'VES' 
        ? [ 
            { id: 'mobile_pay', label: 'Pago Móvil' }, 
            { id: 'cash', label: 'Efectivo Bs' }, 
            { id: 'card', label: 'Punto de Venta' },
            { id: 'transfer', label: 'Transferencia' },
            { id: 'credit', label: 'Crédito' }
          ]
        : [ 
            { id: 'cash', label: 'Efectivo $' }, 
            { id: 'zelle', label: 'Zelle' }, 
            { id: 'transfer', label: 'Transf. Intl' }, 
            { id: 'credit', label: 'Crédito' },
            { id: 'other', label: 'Otro' } 
          ]
})

const needsReference = computed(() => ['mobile_pay', 'transfer', 'zelle', 'card'].includes(currentSale.value.paymentMethod))

// --- Data Loading ---
const fetchProducts = async () => {
    if (!organization.value?.id) return
    loadingProducts.value = true
    try {
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

// --- Exchange Rate Persistence ---
const fetchExchangeRate = async () => {
    // Keep existing rate if we have one (persistence)
    if (currentSale.value.exchangeRate > 0) return

    try {
        const data = await $fetch('/api/bcv-rate')
        if (data && data.rate) {
            currentSale.value.exchangeRate = data.rate
            return
        }
    } catch (e) { console.error('Error fetching BCV API rate', e) }

    if (!organization.value?.id) return
    try {
        const { data } = await client.from('exchange_rates')
            .select('rate')
            .eq('organization_id', organization.value.id)
            .eq('date', new Date().toISOString().split('T')[0])
            .eq('currency_from', 'USD')
            .eq('currency_to', 'VES')
            .maybeSingle()
        
        if (data) currentSale.value.exchangeRate = data.rate
    } catch (e) { console.error('Error loading rate', e) }
}

onMounted(() => {
    fetchProducts()
    fetchExchangeRate()
    searchInput.value?.focus()
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

const selectNextResult = () => { if (focusedResultIndex.value < searchResults.value.length - 1) focusedResultIndex.value++ }
const selectPrevResult = () => { if (focusedResultIndex.value > 0) focusedResultIndex.value-- }
const addSelectedResult = () => { if (searchResults.value.length > 0) handleAddProduct(searchResults.value[focusedResultIndex.value]) }

const handleAddProduct = (product: Product) => {
    const success = addToCart(product)
    if (!success) {
        alert('Sin stock disponible')
        return
    }
    searchQuery.value = ''
    focusedResultIndex.value = 0
    searchInput.value?.focus()
}

const handleUpdateQty = (index: number, newQty: number) => {
    const success = updateCartItemQty(index, newQty)
    if (success === false) {
        // alert('Stock insuficiente') // Too noisy, just cap it
    }
}

const handleUpdateQtyInput = (index: number, val: string) => {
    let qty = parseInt(val)
    if (isNaN(qty)) return
    handleUpdateQty(index, qty)
}

const setPaymentMethod = (id: string) => {
    currentSale.value.paymentMethod = id
}

// --- Mixed Payment Logic (Improved Auto-Fill) ---
const autoFillVes = () => {
    // Called when USD Amount changes by user
    if (!currentSale.value.isMixedPayment) return
    const totalDue = financials.value.total
    const paidUSD = currentSale.value.mixedPayment.usdAmount
    const missingUSD = Math.max(0, totalDue - paidUSD)
    const missingVes = missingUSD * currentSale.value.exchangeRate
    currentSale.value.mixedPayment.vesAmount = parseFloat(missingVes.toFixed(2))
}

const autoFillUsd = () => {
    // Called when VES Amount changes by user
    if (!currentSale.value.isMixedPayment) return
    // This is trickier because of circular dependency if we aren't careful.
    // But usually we just want to know how much USD is left if they pay X Bolivares.
    // However, usually the FLOW is: "I have $20 cash, rest in Pago Movil".
    // So usually USD is set first.
    // But if they say "I have 500 Bs, rest in USD".
    const totalDue = financials.value.total
    const paidVES = currentSale.value.mixedPayment.vesAmount
    const paidUSD_equiv = paidVES / (currentSale.value.exchangeRate || 1)
    const missingUSD = Math.max(0, totalDue - paidUSD_equiv)
    currentSale.value.mixedPayment.usdAmount = parseFloat(missingUSD.toFixed(2))
}

const fillRemainingVes = () => {
    const totalDue = financials.value.total
    const paidUSD = currentSale.value.mixedPayment.usdAmount
    const missingUSD = Math.max(0, totalDue - paidUSD)
    currentSale.value.mixedPayment.vesAmount = parseFloat((missingUSD * currentSale.value.exchangeRate).toFixed(2))
}

const fillRemainingUsd = () => {
     // If they cleared USD and want to fill it
     const totalDue = financials.value.total
     currentSale.value.mixedPayment.usdAmount = totalDue
     currentSale.value.mixedPayment.vesAmount = 0
}

const formatPriceInBs = (val: number) => `Bs. ${val.toLocaleString('es-VE', { maximumFractionDigits: 2 })}`

// Calculate IGTF Base
const igtfBaseAmount = computed(() => {
    if (currentSale.value.isMixedPayment) {
        return currentSale.value.mixedPayment.usdAmount
    }
    // Logic Request: "Default include IGTF only in Dollar part".
    // If not mixed, and payment is USD Cash (or selected to include), base is Total.
    if (currentSale.value.includeIgtf) {
         // Base is Subtotal + IVA - Discount.
         const sub = currentSale.value.cart.reduce((sum, item) => sum + (item.product.price * item.quantity) - (item.discount || 0), 0)
         const tax = !currentSale.value.isExempt ? sub * 0.16 : 0
         const globalDisc = currentSale.value.globalDiscount
         return Math.max(0, sub + tax - globalDisc)
    }
    return 0
})

const remainingDue = computed(() => {
    if (!currentSale.value.isMixedPayment) return 0
    const totalDue = financials.value.total
    const paidUSD = currentSale.value.mixedPayment.usdAmount
    const paidVES_in_USD = currentSale.value.mixedPayment.vesAmount / (currentSale.value.exchangeRate || 1)
    return Math.max(0, totalDue - (paidUSD + paidVES_in_USD))
})

// --- Financial ---
const formatDisplayPrice = (amount: number) => {
    if (currentSale.value.currency === 'VES') {
        const rate = currentSale.value.exchangeRate || 1
        const converted = amount * rate
        return `Bs. ${converted.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const financials = computed(() => {
    // Base Calculation (Always USD)
    let subtotalUSD = currentSale.value.cart.reduce((sum, item) => sum + (item.product.price * item.quantity) - (item.discount || 0), 0)
    
    // Tax Logic
    let taxIvaUSD = !currentSale.value.isExempt ? subtotalUSD * 0.16 : 0

    // Discount Global
    let globalDisc = currentSale.value.globalDiscount

    // IGTF Logic
    // If Checked: Apply 3% to the Base.
    let igtfBase = 0
    if (currentSale.value.includeIgtf) {
         if (currentSale.value.isMixedPayment) {
             igtfBase = currentSale.value.mixedPayment.usdAmount
         } else {
             igtfBase = subtotalUSD + taxIvaUSD - globalDisc
         }
    }
    
    let taxIgtfUSD = igtfBase * 0.03
    
    const totalUSD = Math.max(0, subtotalUSD + taxIvaUSD + taxIgtfUSD - globalDisc)

    return { 
        subtotal: subtotalUSD, 
        taxIva: taxIvaUSD, 
        taxIgtf: taxIgtfUSD, 
        total: totalUSD 
    }
})



const handleCheckout = async () => {
    if (currentSale.value.cart.length === 0) return
    
    try {
        const paymentDetails = currentSale.value.isMixedPayment ? {
            usd_amount: currentSale.value.mixedPayment.usdAmount,
            ves_amount: currentSale.value.mixedPayment.vesAmount,
            igtf_base: igtfBaseAmount.value
        } : (currentSale.value.currency === 'USD' ? { usd_amount: financials.value.total } : { ves_amount: financials.value.total * currentSale.value.exchangeRate })

        await createSale({
            clientId: currentSale.value.clientId || undefined,
            status: currentSale.value.status,
            paymentMethod: currentSale.value.paymentMethod,
            paymentReference: currentSale.value.paymentReference,
            date: currentSale.value.date,
            currency: 'USD',
            exchangeRate: currentSale.value.exchangeRate,
            isExempt: currentSale.value.isExempt,
            subtotal: financials.value.subtotal,
            taxIva: financials.value.taxIva,
            taxIgtf: financials.value.taxIgtf,
            discount: currentSale.value.globalDiscount, // Pass Global Discount
            total: financials.value.total,
            paymentDetails: paymentDetails,
            rawItems: currentSale.value.cart.map(i => ({
                productId: i.product.id,
                quantity: i.quantity,
                price: i.product.price,
                discount: i.discount
            })),
            itemsSnapshot: currentSale.value.cart.map(i => ({
                id: i.product.id,
                name: i.product.name,
                qty: i.quantity,
                price: i.product.price,
                discount: i.discount
            }))
        })
        
        alert('Venta Completada')
        router.push('/app/sales')
    } catch (e: any) {
        alert(e.message)
    }
}

const saveClient = async () => {
    if (!newClient.value.name || !organization.value?.id) return
    savingClient.value = true
    try {
        const { data, error } = await client.from('clients').insert({
            organization_id: organization.value.id,
            ...newClient.value
        }).select('id').single()

        if (error) throw error
        
        alert('Cliente creado exitosamente')
        showClientModal.value = false
        newClient.value = { name: '', email: '', phone: '', identity_document: '' }
        clientSelectorKey.value++ 
        if (data) currentSale.value.clientId = data.id

    } catch (e: any) {
        alert('Error creando cliente: ' + e.message)
    } finally {
        savingClient.value = false
    }
}
</script>
