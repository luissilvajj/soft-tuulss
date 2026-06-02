import { defineStore } from 'pinia'
import Dexie, { type Table } from 'dexie'
import { useToast } from 'vue-toastification'
import type { CartItem, Product, SalePayload } from '~/types/models'

// --- 1. Dexie DB Setup (Client Side Only) ---
interface PendingSale {
    id?: number
    payload: SalePayload
    createdAt: number
}

class OfflineDB extends Dexie {
    pendingSales!: Table<PendingSale>
    constructor() {
        super('KaptivaDB')
        this.version(1).stores({
            pendingSales: '++id, createdAt'
        })
    }
}
const db = new OfflineDB()

interface SalesState {
    cart: CartItem[]
    currentSale: {
        clientId: string
        documentType: 'invoice' | 'delivery_note'
        paymentMethod: string
        paymentReference: string
        status: 'paid' | 'pending'
        date: string
        isExempt: boolean
        includeIgtf: boolean
        globalDiscount: number
        currency: 'USD' | 'VES'
        exchangeRate: number
        isMixedPayment: boolean
        mixedPayment: {
            usdAmount: number
            vesAmount: number
        }
        paymentTermDays: number
    }
    isOfflineMode: boolean
    pendingCount: number
}

export const useSalesStore = defineStore('sales', {
    state: (): SalesState => ({
        cart: [],
        currentSale: {
            clientId: '',
            documentType: 'invoice',
            paymentMethod: 'cash',
            paymentReference: '',
            status: 'paid',
            date: new Date().toISOString().split('T')[0],
            isExempt: false,
            includeIgtf: false,
            globalDiscount: 0,
            currency: 'USD',
            exchangeRate: 0,
            isMixedPayment: false,
            mixedPayment: {
                usdAmount: 0,
                vesAmount: 0
            },
            paymentTermDays: 30
        },
        isOfflineMode: false,
        pendingCount: 0
    }),
    persist: {
        paths: ['cart', 'currentSale'], // Persist cart and form state across reloads
    },
    actions: {
        addToCart(product: Product) {
            const existing = this.cart.find(i => i.product.id === product.id)
            if (existing) {
                if (existing.quantity < product.stock) {
                    existing.quantity++
                    return true
                }
                return false // Stock limit
            }
            if (product.stock > 0) {
                this.cart.push({ product, quantity: 1, discount: 0 })
                return true
            }
            return false
        },

        removeFromCart(index: number) {
            this.cart.splice(index, 1)
        },

        updateCartItemQty(index: number, qty: number) {
            const item = this.cart[index]
            if (!item) return
            if (qty > item.product.stock) {
                item.quantity = item.product.stock
                return false
            }
            if (qty < 1) {
                item.quantity = 1
                return
            }
            item.quantity = qty
            return true
        },

        clearCart() {
            this.cart = []
            this.currentSale = {
                clientId: '',
                documentType: 'invoice',
                paymentMethod: 'cash',
                paymentReference: '',
                status: 'paid',
                date: new Date().toISOString().split('T')[0],
                isExempt: false,
                includeIgtf: false,
                globalDiscount: 0,
                currency: 'USD',
                exchangeRate: this.currentSale.exchangeRate, // Keep rate
                isMixedPayment: false,
                mixedPayment: { usdAmount: 0, vesAmount: 0 },
                paymentTermDays: 30
            }
        },

        resetState() {
            this.clearCart()
            this.pendingCount = 0
            // Reset dates and rates explicitly to avoid carrying over local storage defaults between physical orgs
            this.currentSale.date = new Date().toISOString().split('T')[0]
            this.currentSale.exchangeRate = 0 
        },

        async checkPendingSales() {
            this.pendingCount = await db.pendingSales.count() // Checks Dexie count
        },

        async processSale(payload: SalePayload) {
            const client = useSupabaseClient()
            const toast = useToast()

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000)

            try {
                // Intento 1: Llamada al Endpoint Seguro
                if (!navigator.onLine) throw new Error('Offline')

                const currentOrgId = (useOrganization().organization.value as any)?.id;
                const safePayload = {
                    ...payload,
                    organization_id: currentOrgId
                }

                const response = await $fetch('/api/sales/process', {
                    method: 'POST',
                    body: { payload: safePayload },
                    signal: controller.signal
                }) as any

                const sale = response.sale

                clearTimeout(timeoutId)
                ;(this as any).clearCart()
                return { status: 'success', sale }

            } catch (e: any) {
                clearTimeout(timeoutId)
                
                if (e.name === 'AbortError') {
                    throw new Error('La conexión es inestable, tiempo de espera agotado. Revise su internet o intente de nuevo.')
                }

                if (e.message !== 'Offline' && !e.message?.includes('Failed to fetch')) {
                     // Error de base de datos o 500, NO guardar local, notificar a usuario.
                     throw new Error('Error al procesar el pago, intente de nuevo. Detalle: ' + (e.message || 'Internal Server Error'))
                }

                // Fallback: Guardar Local SÓLO si es problema explícito de caída de red
                console.warn('Network fail, saving locally', e)

                // Ensure ID doesn't conflict if we retry
                // We add offline_flag to payload and snapshot organization_id
                const offlineLoad = { 
                    ...payload, 
                    offline_flag: true,
                    organization_id: (useOrganization().organization.value as any)?.id 
                }

                await db.pendingSales.add({
                    payload: offlineLoad,
                    createdAt: Date.now()
                })

                this.isOfflineMode = true
                await (this as any).checkPendingSales()
                ;(this as any).clearCart() // Clear UI so they can continue selling
                return { status: 'offline' }
            }
        },

        async syncOfflineSales() {
            if (!navigator.onLine) return
            const pending = await db.pendingSales.toArray()
            if (pending.length === 0) {
                this.pendingCount = 0
                this.isOfflineMode = false
                return
            }

            const client = useSupabaseClient()
            const toast = useToast()

            let synced = 0
            let errors = 0

            for (const sale of pending) {
                try {
                    const response = await $fetch('/api/sales/process', {
                        method: 'POST',
                        body: { payload: sale.payload }
                    }) as any

                    if (response.status === 'success') {
                        await db.pendingSales.delete(sale.id!)
                        synced++
                    } else {
                        errors++
                    }
                } catch (e) {
                    errors++
                }
            }

            this.pendingCount = await db.pendingSales.count()

            if (synced > 0) toast.success(`Sincronizadas ${synced} ventas offline`)
            if (errors > 0) toast.error(`Error sincronizando ${errors} ventas. Revisa conexión.`)

            if (this.pendingCount === 0) this.isOfflineMode = false
        }
    }
})
