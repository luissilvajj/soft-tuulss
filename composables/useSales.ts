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
    const fetchSales = async () => {
        if (!organization.value?.id) return

        loading.value = true
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
            sales.value = data as unknown as Sale[]
        } catch (e) {
            console.error('Error fetching sales:', e)
        } finally {
            loading.value = false
        }
    }

    /**
     * Create a new sale
     */
    const createSale = async (
        saleData: {
            clientId?: string
            status: 'paid' | 'pending'
            paymentMethod: string
            date: string
        },
        items: { productId: string; quantity: number; price: number }[]
    ) => {
        if (!organization.value?.id) throw new Error('Organization not found')

        loading.value = true
        try {
            // 1. Calculate Total
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

            // 2. Insert Transaction (Sale)
            const { data: sale, error: saleError } = await client
                .from('transactions')
                .insert({
                    organization_id: organization.value.id,
                    type: 'sale',
                    amount: totalAmount,
                    client_id: saleData.clientId,
                    status: saleData.status,
                    payment_method: saleData.paymentMethod,
                    date: saleData.date
                } as any)
                .select()
                .single()

            if (saleError) throw saleError

            // 3. Insert Items
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

            // 4. Update Local Stock (Optimistic UI or re-fetch products)
            // The DB trigger (if implemented) handles the actual decrement, 
            // but we might want to refresh products here.

            return sale
        } catch (e) {
            console.error('Error creating sale:', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        sales,
        loading,
        fetchSales,
        createSale
    }
}
