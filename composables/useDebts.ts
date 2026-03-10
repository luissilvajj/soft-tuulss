import { useOrganization } from './useOrganization'

export interface Debt {
    id: string
    type: 'receivable' | 'payable' // CxC (cobrar) vs CxP (pagar)
    entity_id: string
    entity_name: string
    reference: string
    date: string
    due_date?: string
    total: number
    amount_paid: number
    balance: number
    status: 'pending' | 'partial'
    currency: string
}

export const useDebts = () => {
    const { organization } = useOrganization()
    const client = useSupabaseClient()

    const receivables = useState<Debt[]>('debts_receivables', () => [])
    const payables = useState<Debt[]>('debts_payables', () => [])
    const loading = useState('debts_loading', () => false)

    const fetchDebts = async () => {
        if (!organization.value?.id) return
        loading.value = true
        
        try {
            // 1. Fetch Receivables (Transactions that are sales and pending/partial)
            // Need columns: id, date, due_date, amount, amount_paid, status, client(name)
            const { data: rxData, error: rxErr } = await client
                .from('transactions')
                .select('id, date, due_date, amount, amount_paid, status, control_number, client:clients(name)')
                .eq('organization_id', organization.value.id)
                .in('type', ['sale'])
                .in('status', ['pending', 'partial'])
                .order('date', { ascending: false })

            if (rxErr) throw rxErr

            receivables.value = (rxData || []).map((t: any) => ({
                id: t.id,
                type: 'receivable',
                entity_id: t.client?.id || '',
                entity_name: t.client?.name || 'Cliente sin registro',
                reference: t.control_number || t.id.split('-')[0],
                date: t.date,
                due_date: t.due_date,
                total: Number(t.amount || 0),
                amount_paid: Number(t.amount_paid || 0),
                balance: Number(t.amount || 0) - Number(t.amount_paid || 0),
                status: t.status,
                currency: 'USD' // Defaulting to USD base
            }))

            // 2. Fetch Payables (Purchases that are pending/partial)
            const { data: pxData, error: pxErr } = await client
                .from('purchases')
                .select('id, date, due_date, total, amount_paid, status, invoice_number, supplier:suppliers(name)')
                .eq('organization_id', organization.value.id)
                .in('status', ['pending', 'partial'])
                .order('date', { ascending: false })

            if (pxErr) throw pxErr

            payables.value = (pxData || []).map((p: any) => ({
                id: p.id,
                type: 'payable',
                entity_id: p.supplier?.id || '',
                entity_name: p.supplier?.name || 'Proveedor sin registro',
                reference: p.invoice_number || p.id.split('-')[0],
                date: p.date,
                due_date: p.due_date,
                total: Number(p.total || 0),
                amount_paid: Number(p.amount_paid || 0),
                balance: Number(p.total || 0) - Number(p.amount_paid || 0),
                status: p.status,
                currency: p.currency || 'USD'
            }))

        } catch (e) {
            console.error('Error fetching debts', e)
        } finally {
            loading.value = false
        }
    }

    const payDebt = async (debtId: string, type: 'receivable' | 'payable', paymentAmount: number, paymentMethod: string, notes?: string) => {
        if (!organization.value?.id) throw new Error('Organización requerida')
        
        try {
            // Fetch current debt to check status
            const table = type === 'receivable' ? 'transactions' : 'purchases'
            const totalCol = type === 'receivable' ? 'amount' : 'total'

            const { data: debtData } = await client.from(table).select(`amount_paid, ${totalCol}, status`).eq('id', debtId).single()
            if (!debtData) throw new Error('Deuda no encontrada')

            const newAmountPaid = Number(debtData.amount_paid || 0) + paymentAmount
            const totalAmount = Number(debtData[totalCol] || 0)
            const newStatus = newAmountPaid >= totalAmount ? 'paid' : 'partial'

            // 1. Update the debt record
            const { error: updateErr } = await client.from(table).update({
                amount_paid: newAmountPaid,
                status: newStatus
            }).eq('id', debtId)

            if (updateErr) throw updateErr

            // 2. Log the payment
            const { error: insertErr } = await client.from('debt_payments').insert({
                organization_id: organization.value.id,
                reference_type: type === 'receivable' ? 'sale' : 'purchase',
                reference_id: debtId,
                amount: paymentAmount,
                payment_method: paymentMethod,
                notes: notes || `Pago para factura ${debtId.split('-')[0]}`
            })

            if (insertErr) throw insertErr

            // Refresh lists
            await fetchDebts()
            return { success: true }

        } catch (e) {
            console.error('Error paying debt', e)
            throw e
        }
    }

    return {
        receivables,
        payables,
        loading,
        fetchDebts,
        payDebt
    }
}
