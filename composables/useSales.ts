import type { Sale, SaleItem, Product, Client } from '~/types/models'

export interface CartItem {
    product: Product
    quantity: number
    discount: number // Amount, not percentage, for simplicity to start (or handle both in UI)
}

export const useSales = () => {
    const client = useSupabaseClient()
    const { organization } = useOrganization()
    const loading = useState('sales_loading', () => false)
    const sales = useState<Sale[]>('sales_list', () => [])

    // --- Persistent State for "Active Sale" ---
    // This allows navigating away to Inventory and coming back without losing data
    const currentSale = useState('current_sale_state', () => ({
        cart: [] as CartItem[],
        clientId: '' as string,
        paymentMethod: 'cash' as string,
        paymentReference: '' as string,
        status: 'paid' as 'paid' | 'pending',
        date: new Date().toISOString().split('T')[0],
        isExempt: false,
        includeIgtf: false, // Renamed from isIgtfExempt (logic inverted)
        globalDiscount: 0,
        currency: 'USD' as 'USD' | 'VES',
        exchangeRate: 0,
        isMixedPayment: false,
        mixedPayment: {
            usdAmount: 0,
            vesAmount: 0
        }
    }))

    // --- Actions for Active Sale ---
    const addToCart = (product: Product) => {
        const existing = currentSale.value.cart.find(i => i.product.id === product.id)
        if (existing) {
            // Check stock limit
            if (existing.quantity < product.stock) {
                existing.quantity++
            } else {
                // Should show error, but return false to let UI handle it
                return false
            }
        } else {
            if (product.stock > 0) {
                currentSale.value.cart.push({ product, quantity: 1, discount: 0 })
            } else {
                return false
            }
        }
        return true
    }

    const removeFromCart = (index: number) => {
        currentSale.value.cart.splice(index, 1)
    }

    const updateCartItemQty = (index: number, qty: number) => {
        const item = currentSale.value.cart[index]
        if (!item) return

        // Stock Validation
        if (qty > item.product.stock) {
            item.quantity = item.product.stock
            return false // Cap at stock
        }
        if (qty < 1) {
            item.quantity = 1
            return
        }
        item.quantity = qty
        return true
    }

    const clearCurrentSale = () => {
        currentSale.value = {
            cart: [],
            clientId: '',
            paymentMethod: 'cash',
            paymentReference: '',
            status: 'paid',
            date: new Date().toISOString().split('T')[0],
            isExempt: false,
            includeIgtf: false,
            globalDiscount: 0,
            currency: 'USD',
            exchangeRate: currentSale.value.exchangeRate, // Keep rate
            isMixedPayment: false,
            mixedPayment: { usdAmount: 0, vesAmount: 0 }
        }
    }

    /**
     * Fetch recent sales
     */
    const fetchSales = async (force = false) => {
        if (!organization.value?.id) return

        if (sales.value.length === 0 || force) {
            loading.value = true
        }

        try {
            const { data, error } = await client
                .from('transactions')
                .select(`
          *,
          client:clients(*),
          items:transaction_items(
            *,
            product:products(*)
          )
        `)
                .eq('organization_id', organization.value.id)
                .eq('type', 'sale')
                .order('date', { ascending: false })

            if (error) throw error

            sales.value = (data || []).map((s: any) => ({
                ...s,
                client_name: s.client?.name || 'Cliente Casual',
                amount: s.amount || 0
            })) as unknown as Sale[]
        } catch (e) {
            console.error('Error fetching sales:', e)
        } finally {
            loading.value = false
        }
    }

    /**
     * Create a new sale
     */
    const createSale = async (payload: any) => {
        if (!organization.value?.id) throw new Error('Organization not found')

        loading.value = true
        // Instantiating here to avoid scope/closure issues in some HMR environments
        const { logAction } = useAuditLogs()
        try {
            // 2. Insert Transaction (Sale) with new fields
            const { data: sale, error: saleError } = await client
                .from('transactions')
                .insert({
                    organization_id: organization.value.id,
                    type: 'sale',
                    amount: payload.total,
                    client_id: payload.clientId,
                    status: payload.status,
                    payment_method: payload.paymentMethod,
                    payment_reference: payload.paymentReference,
                    date: payload.date,
                    currency: payload.currency,
                    exchange_rate: payload.exchangeRate,
                    subtotal: payload.subtotal,
                    tax_iva: payload.taxIva,
                    tax_igtf: payload.taxIgtf,
                    is_exempt: payload.isExempt,
                    discount: payload.discount, // Global Discount
                    items: payload.itemsSnapshot,
                    payment_details: payload.paymentDetails
                } as any)
                .select()
                .single()

            if (saleError) throw saleError

            // 3. Insert Items
            const formattedItems = payload.rawItems.map((item: any) => ({
                organization_id: organization.value!.id,
                transaction_id: sale.id,
                product_id: item.productId,
                quantity: item.quantity,
                price_at_transaction: item.price,
                discount: item.discount // Save item discount
            }))

            const { error: itemsError } = await client
                .from('transaction_items')
                .insert(formattedItems as any)

            if (itemsError) throw itemsError

            // 4. Update Stock
            for (const item of payload.rawItems) {
                // Try RPC
                const { error: stockError } = await client.rpc('decrement_stock', {
                    p_id: item.productId,
                    q: item.quantity
                })
                // Fallback
                if (stockError) {
                    const { data: prod } = await client.from('products').select('stock').eq('id', item.productId).single()
                    if (prod) {
                        await client.from('products').update({ stock: prod.stock - item.quantity }).eq('id', item.productId)
                    }
                }
            }

            // Clear state after success
            clearCurrentSale()

            // Refresh List
            await fetchSales(true)

            logAction('sale_created', {
                sale_id: sale.id,
                total: payload.total,
                client_id: payload.clientId,
                payment_method: payload.paymentMethod
            })

            return sale
        } catch (e) {
            console.error('Error creating sale:', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    const deleteSale = async (id: string) => {
        const { error } = await client.from('transactions').delete().eq('id', id)
        if (error) throw error
        await fetchSales(true)
    }

    return {
        sales,
        currentSale, // Expose persistent state
        loading,
        fetchSales,
        createSale,
        deleteSale,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        clearCurrentSale
    }
}
