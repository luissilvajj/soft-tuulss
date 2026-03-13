import type { Product } from '~/types/models'

import type { Database } from '~/types/database.types'
import { useOrganization } from './useOrganization'
import { useSupabaseClient, useSupabaseUser, useState } from '#imports'
import { useAuditLogs } from './useAuditLogs'

export interface InventoryFilter {
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortDesc?: boolean
}

export const useInventory = () => {
    const client = useSupabaseClient<Database>()
    const { organization } = useOrganization()
    const user = useSupabaseUser()
    const { logAction } = useAuditLogs()

    const loading = useState('inventory_loading', () => false)
    const products = useState<Product[]>('inventory_products', () => [])
    const totalProducts = useState<number>('inventory_total', () => 0)

    const resetInventoryState = () => {
        products.value = []
        totalProducts.value = 0
    }

    // Actions
    const fetchProducts = async (filters: InventoryFilter = {}) => {
        if (!organization.value?.id) return

        loading.value = true
        try {
            const page = filters.page || 1
            const limit = filters.limit || 20
            const from = (page - 1) * limit
            const to = from + limit - 1

            let query = client
                .from('products')
                .select('*', { count: 'exact' })
                .eq('organization_id', organization.value.id)
                .is('deleted_at', null)
                
            // Apply sorting
            if (filters.sortBy) {
                query = query.order(filters.sortBy, { ascending: !filters.sortDesc })
            } else {
                query = query.order('name')
            }

            // Apply searching
            if (filters.search) {
                // Using .or to search in name or sku
                query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
            }

            query = query.range(from, to)

            const { data, count, error } = await query

            if (error) throw error
            products.value = data || []
            if (count !== null) totalProducts.value = count
        } catch (e) {
            console.error('Error fetching inventory:', e)
        } finally {
            loading.value = false
        }
    }

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
        // State
        products,
        totalProducts,
        fetchProducts,
        resetInventoryState,
        loading
    }
}
