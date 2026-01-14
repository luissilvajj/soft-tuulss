import type { Product } from '~/types/models'

import type { Database } from '~/types/database.types'

export const useInventory = () => {
    const client = useSupabaseClient<Database>()
    const { organization } = useOrganization()
    const { logAction } = useAuditLogs()

    // We keep these for legacy compatibility or simple views, 
    // but the main pagination logic should be handled by the component using useFetch directly on the new API.
    const loading = useState('inventory_loading', () => false)

    // Actions
    const addStock = async (productId: string, quantity: number, costPerUnit: number) => {
        if (!organization.value?.id) throw new Error('No Organization')

        // 1. Transaction (Expense)
        const totalCost = quantity * costPerUnit

        const { data: transaction, error: transError } = await client
            .from('transactions')
            .insert({
                organization_id: organization.value.id,
                type: 'expense',
                amount: totalCost,
                status: 'paid',
                payment_method: 'other',
                date: new Date().toISOString()
            } as any)
            .select()
            .single()

        if (transError) throw new Error('Error creando transacción: ' + transError.message)

        // 2. Transaction Item
        const { error: itemError } = await client
            .from('transaction_items')
            .insert({
                organization_id: organization.value.id,
                transaction_id: transaction.id,
                product_id: productId,
                quantity: quantity,
                price_at_transaction: costPerUnit
            } as any)

        if (itemError) throw new Error('Error registrando item: ' + itemError.message)

        // 3. RPC Call: restock_product_weighted
        const { error: rpcError } = await client.rpc('restock_product_weighted', {
            p_id: productId,
            qty_added: quantity,
            new_cost: costPerUnit
        })

        if (rpcError) {
            console.error('RPC Error:', rpcError)
            throw new Error('Error actualizando stock/costo: ' + rpcError.message)
        }

        logAction('product_restocked', { product_id: productId, added: quantity, cost: costPerUnit })
        return true
    }

    const softDeleteProduct = async (productId: string) => {
        const { error } = await client
            .from('products')
            .update({ deleted_at: new Date().toISOString() } as any)
            .eq('id', productId)

        if (error) throw new Error('Error al eliminar: ' + error.message)

        logAction('product_deleted_soft', { id: productId })
        return true
    }

    const addProduct = async (productData: Partial<Product>) => {
        if (!organization.value?.id) throw new Error('No Apps')
        const { error } = await client.from('products').insert({
            organization_id: organization.value.id,
            ...productData
        })
        if (error) {
            if (error.code === '23505') throw new Error('SKU duplicado')
            throw error
        }
        logAction('product_created', { name: productData.name })
    }

    const updateProduct = async (id: string, productData: Partial<Product>) => {
        const { error } = await client.from('products').update(productData).eq('id', id)
        if (error) throw error
        logAction('product_updated', { id })
    }

    const importProductsFromExcel = async (items: any[]) => {
        // ... (Keep existing logic or refactor similarly if needed. For brevity, assuming existing logic fits but needs organization check)
        // Ideally we use a batch insert endpoint or loop. Keeping it simple for this turn as not main focus.
        // Re-implementing briefly to ensure 'useInventory' is complete.
        if (!organization.value?.id) throw new Error('No Organization')
        const formatted = items.map(i => ({
            organization_id: organization.value!.id,
            name: i.name, sku: i.sku, price: i.price, stock: i.stock, cost: i.cost
        }))
        const { error } = await client.from('products').upsert(formatted, { onConflict: 'sku' }) // Assuming SKU constraint exists or we rely on ID
        if (error) throw error
    }

    return {
        addStock,
        softDeleteProduct,
        addProduct,
        updateProduct,
        importProductsFromExcel,
        // Deprecated state properties can encourage migration
        loading
    }
}
