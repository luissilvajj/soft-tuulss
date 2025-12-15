import type { Transaction } from '~/types/models'

// Extend the model locally if not yet defined globally
export interface TransactionFilter {
    dateFrom?: string
    dateTo?: string
    type?: 'sale' | 'expense' | 'adjustment' | 'all'
    search?: string
}

export const useTransactions = () => {
    const client = useSupabaseClient()
    const { organization } = useOrganization()

    const loading = useState('transactions_loading', () => false)
    const transactions = useState<Transaction[]>('transactions_list', () => [])

    const fetchTransactions = async (filters: TransactionFilter = {}) => {
        if (!organization.value?.id) return

        // If applying filters, we generally WANT to show loading to indicate filtering is happening
        // But for initial load (no filters or default), we can cache.
        // Simplified: Use current length check. Use a refined strategy if needed.
        const isFiltering = Object.keys(filters).length > 0

        if (transactions.value.length === 0 || isFiltering) {
            loading.value = true
        }

        try {
            let query = client
                .from('transactions')
                .select(`
                    *,
                    client:clients(name)
                `)
                .eq('organization_id', organization.value.id)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })

            // Apply Filters
            if (filters.type && filters.type !== 'all') {
                query = query.eq('type', filters.type)
            }

            if (filters.dateFrom) {
                query = query.gte('date', filters.dateFrom)
            }

            if (filters.dateTo) {
                query = query.lte('date', filters.dateTo)
            }

            // Note: Search on generic fields (like description or client name) 
            // is harder with simple standardized Supabase queries without a joining search index 
            // or specific text search column. For now we will filter client-side or assume exact match if needed.

            const { data, error } = await query

            if (error) throw error

            transactions.value = data as unknown as Transaction[]
        } catch (e) {
            console.error('Error fetching transactions:', e)
        } finally {
            loading.value = false
        }
    }

    // New: Inventory Movements
    const inventoryMovements = useState<any[]>('inventory_movements', () => [])
    const loadingMovements = useState('inventory_movements_loading', () => false)

    const fetchInventoryMovements = async () => {
        if (!organization.value?.id) return
        loadingMovements.value = true
        try {
            // We need: Date, Product Name, Qty, Type (In/Out), Reference
            const { data, error } = await client
                .from('transaction_items')
                .select(`
                    id,
                    quantity,
                    created_at,
                    product:products(name),
                    transaction:transactions!inner(
                        type,
                        description,
                        date,
                        client_id,
                        organization_id
                    )
                `)
                .eq('transaction.organization_id', organization.value.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            inventoryMovements.value = data || []
        } catch (e) {
            console.error('Error fetching inventory movements', e)
        } finally {
            loadingMovements.value = false
        }
    }

    return {
        transactions,
        loading,
        fetchTransactions,
        // Inventory
        inventoryMovements,
        loadingMovements,
        fetchInventoryMovements
    }
}
