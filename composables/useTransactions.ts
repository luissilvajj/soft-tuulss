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

        loading.value = true
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

    return {
        transactions,
        loading,
        fetchTransactions
    }
}
