import type { Sale, SaleItem, Product, Client } from '~/types/models'

export const useSales = () => {
    const client = useSupabaseClient()
    const user = useSupabaseUser()
    const { organization } = useOrganization()

    const loading = useState('sales_loading', () => false)
    const sales = useState<Sale[]>('sales_list', () => [])

    /**
     * Fetch recent sales
     */
    const fetchSales = async (force = false) => {
        if (!organization.value?.id) return

        // Stale-while-revalidate: Only show loading if no data or forced
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
            if (error) throw error

            // Map data to match Sale interface (flatten client_name)
            sales.value = (data || []).map((s: any) => ({
                ...s,
                client_name: s.client?.name || 'Cliente Casual',
                amount: s.amount || 0 // Ensure numeric
            })) as unknown as Sale[]
        } catch (e) {
            console.error('Error fetching sales:', e)
        } finally {
            loading.value = false
        }
    }

    /**
     * Create a new sale with advanced fields
     */
    const createSale = async (
        saleData: {
            clientId?: string
            status: 'paid' | 'pending'
            paymentMethod: string
            paymentReference?: string
            date: string
            currency: 'USD' | 'VES'
            exchangeRate: number
            isExempt: boolean
            subtotal: number
            taxIva: number
            taxIgtf: number
            total: number
            itemsSnapshot: any[] // Store items JSON for history
        },
        items: { productId: string; quantity: number; price: number }[]
    ) => {
        if (!organization.value?.id) throw new Error('Organization not found')

        loading.value = true
        try {
            // 2. Insert Transaction (Sale) with new fields
            const { data: sale, error: saleError } = await client
                .from('transactions')
                .insert({
                    organization_id: organization.value.id,
                    type: 'sale',
                    amount: saleData.total, // Grand Total
                    client_id: saleData.clientId,
                    status: saleData.status,
                    payment_method: saleData.paymentMethod,
                    payment_reference: saleData.paymentReference,
                    date: saleData.date,
                    // New Fields
                    currency: saleData.currency,
                    exchange_rate: saleData.exchangeRate,
                    subtotal: saleData.subtotal,
                    tax_iva: saleData.taxIva,
                    tax_igtf: saleData.taxIgtf,
                    is_exempt: saleData.isExempt,
                    items: saleData.itemsSnapshot
                } as any)
                .select()
                .single()

            if (saleError) throw saleError

            // 3. Insert Items (Legacy relation support + Stock deduction)
            const formattedItems = items.map(item => ({
                organization_id: organization.value!.id,
                transaction_id: sale.id,
                product_id: item.productId,
                quantity: item.quantity,
                price_at_transaction: item.price
            }))

            const { error: itemsError } = await client
                .from('transaction_items')
                .insert(formattedItems as any)

            if (itemsError) throw itemsError

            // 4. Update Stock (Simple client-side iteration for MVP - ideally RPC or Edge Function)
            for (const item of items) {
                const { error: stockError } = await client.rpc('decrement_stock', {
                    p_id: item.productId,
                    q: item.quantity
                })
                // fallback if RPC doesn't exist
                if (stockError) {
                    // Manual update (racy but works for MVP)
                    const { data: prod } = await client.from('products').select('stock').eq('id', item.productId).single()
                    if (prod) {
                        await client.from('products').update({ stock: prod.stock - item.quantity }).eq('id', item.productId)
                    }
                }
            }

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
    }

    return {
        sales,
        loading,
        fetchSales,
        createSale,
        deleteSale
    }
}
