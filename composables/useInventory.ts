import type { Product } from '~/types/models'

export const useInventory = () => {
    const client = useSupabaseClient()
    const { organization } = useOrganization()

    // Check usePermissions inside the component usage, not here to keep it pure logic

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
                status: 'paid', // Assuming manual restock is already paid or credit logic handled elsewhere
                payment_method: 'other', // Could clarify this in UI later
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

        // 3. Update Product Stock (Atomic increment ideally, but simplified here)
        // We will fetch the current stock first or use an RPC if concurrency is heavy.
        // For MVP, read-modify-write is acceptable or use a separate SQL function.
        // Let's rely on a fresh fetch for now, but ideally we'd use:
        // update products set stock = stock + X where id = Y

        // Let's do the RPC approach if we had one, or a direct raw update.
        // Supabase allows .rpc() but we haven't defined 'increment_stock'.
        // We'll trust the caller to refresh the UI.

        // Actually, let's just do a direct increment update.
        // We need the current product to do this safely? No, we can just do a view refresh.
        // But to actually update the DB:

        const { data: product } = await client.from('products').select('stock').eq('id', productId).single() as any
        const currentStock = product?.stock || 0

        const { error: updateError } = await client
            .from('products')
            .update({ stock: currentStock + quantity } as any)
            .eq('id', productId)

        if (updateError) throw updateError

        return true
    }

    return {
        restockProduct
    }
}
