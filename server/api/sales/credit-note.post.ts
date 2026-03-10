import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { transactionId, organizationId } = body

    if (!transactionId || !organizationId) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing parameters' })
    }

    const client = await serverSupabaseClient(event)

    // 1. Validate original transaction
    const { data: original, error: origErr } = await client
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('organization_id', organizationId)
        .single()

    if (origErr || !original) {
        throw createError({ statusCode: 404, statusMessage: 'Transaction Not Found' })
    }

    // Prevents double refunds or refunding a refund
    if (original.document_type === 'credit_note') {
        throw createError({ statusCode: 400, statusMessage: 'Cannot refund a Credit Note' })
    }

    // Check if a credit note already exists for this transaction
    const { count, error: countErr } = await client
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('related_transaction_id', transactionId)
        .eq('document_type', 'credit_note')

    if (count && count > 0) {
        throw createError({ statusCode: 400, statusMessage: 'This transaction has already been refunded.' })
    }

    // 2. Clone Transaction in negative
    const { data: creditNote, error: cnErr } = await client
        .from('transactions')
        .insert({
            organization_id: original.organization_id,
            type: 'sale',
            document_type: 'credit_note',
            amount: -Math.abs(Number(original.amount || 0)),
            client_id: original.client_id,
            status: 'paid', // A credit note is effectively closed
            payment_method: original.payment_method,
            payment_reference: original.payment_reference,
            currency: original.currency,
            exchange_rate: original.exchange_rate,
            subtotal: -Math.abs(Number(original.subtotal || 0)),
            tax_iva: -Math.abs(Number(original.tax_iva || 0)),
            tax_igtf: -Math.abs(Number(original.tax_igtf || 0)),
            is_exempt: original.is_exempt,
            exempt_amount: -Math.abs(Number(original.exempt_amount || 0)),
            tax_base: -Math.abs(Number(original.tax_base || 0)),
            tax_general_amount: -Math.abs(Number(original.tax_general_amount || 0)),
            tax_reduced_amount: -Math.abs(Number(original.tax_reduced_amount || 0)),
            discount: -Math.abs(Number(original.discount || 0)),
            related_transaction_id: original.id,
            items_snapshot: original.items_snapshot // Keep historical snapshot
        } as any)
        .select()
        .single()

    if (cnErr) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to create Credit Note: ' + cnErr.message })
    }

    // 3. Clone Items as negative
    const { data: items, error: itemsErr } = await client
        .from('transaction_items')
        .select('*')
        .eq('transaction_id', original.id)

    if (itemsErr) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to load transaction items' })
    }

    for (const item of (items || [])) {
        // Insert negative item representation
        const { error: insertErr } = await client
            .from('transaction_items')
            .insert({
                organization_id: original.organization_id,
                transaction_id: creditNote.id,
                product_id: item.product_id,
                quantity: -Math.abs(item.quantity),
                price_at_transaction: item.price_at_transaction, 
                discount: item.discount,
                tax_condition: item.tax_condition,
                tax_rate: item.tax_rate
            } as any)

        if (!insertErr && item.product_id) {
            // Restore Inventory using RPC
            await client.rpc('increment_stock', { p_id: item.product_id, q: Math.abs(item.quantity) })
        }
    }

    return { 
        status: 'success', 
        message: 'Credit Note issued successfully',
        creditNote
    }
})
