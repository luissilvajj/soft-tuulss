import type { Product } from '~/types/models'

export const useInventory = () => {
    const client = useSupabaseClient()
    const { organization } = useOrganization()

    const loading = useState('inventory_loading', () => false)
    const products = useState<Product[]>('inventory_products', () => [])

    const fetchProducts = async (force = false) => {
        if (!organization.value?.id) return

        if (products.value.length === 0 || force) {
            loading.value = true
        }

        try {
            const { data, error } = await client
                .select('*')
                .eq('organization_id', organization.value.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            products.value = data as unknown as Product[]
        } catch (e) {
            console.error("Error fetching products", e)
        } finally {
            loading.value = false
        }
    }

    const { logAction } = useAuditLogs()

    const addProduct = async (productData: Partial<Product>) => {
        if (!organization.value?.id) throw new Error('No Organization')

        const { data, error } = await client.from('products').insert({
            organization_id: organization.value.id,
            ...productData
        }).select().single()

        if (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('El código SKU ya existe en otro producto.')
            }
            throw error
        }

        logAction('product_created', { name: productData.name, sku: productData.sku, initial_stock: productData.stock })

        // Refresh list
        await fetchProducts(true)
    }

    const updateProduct = async (id: string, productData: Partial<Product>) => {
        if (!organization.value?.id) throw new Error('No Organization')

        const { error } = await client.from('products')
            .update(productData)
            .eq('id', id)
            .eq('organization_id', organization.value.id)

        if (error) {
            if (error.code === '23505') {
                throw new Error('El código SKU ya existe en otro producto.')
            }
            throw error
        }

        logAction('product_updated', { id, changes: productData })

        await fetchProducts(true)
    }

    const restockProduct = async (productId: string, quantity: number, costPerUnit: number) => {
        if (!organization.value?.id) throw new Error('No Organization')

        // 1. Create "Expense" Transaction
        const totalCost = quantity * costPerUnit

        const { data: transaction, error: transError } = await client
            .from('transactions')
            .insert({
                organization_id: organization.value.id,
                type: 'expense',
                amount: totalCost,
                status: 'paid', // Assuming manual restock is already paid
                payment_method: 'other',
                date: new Date().toISOString()
            } as any)
            .select()
            .single() as any

        if (transError) throw transError

        // 2. Register Item (to know WHAT was bought)
        const { error: itemError } = await client
            .from('transaction_items')
            .insert({
                organization_id: organization.value!.id,
                transaction_id: transaction.id,
                product_id: productId,
                quantity: quantity,
                price_at_transaction: costPerUnit
            } as any)

        if (itemError) throw itemError

        // 3. Update Product Stock (Direct update as previously analyzed)
        const product = products.value.find(p => p.id === productId)
        const currentStock = product?.stock || 0 // Use local state if mostly fresh

        const { error: updateError } = await client
            .from('products')
            .update({ stock: currentStock + quantity } as any)
            .eq('id', productId)

        if (updateError) throw updateError

        logAction('product_restocked', { product_id: productId, added: quantity, cost: costPerUnit })

        await fetchProducts(true) // Updates UI
        return true
    }

    return {
        products,
        loading,
        fetchProducts,
        addProduct,
        updateProduct,
        restockProduct
    }
}
