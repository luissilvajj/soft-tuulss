import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const body = await readBody(event)

    const payload = body.payload
    // Extraemos de manera estricta el organization_id desde el payload (soporte offline)
    const organizationId = payload?.organization_id

    if (!payload || !payload.rawItems || !organizationId) {
        throw createError({ statusCode: 400, statusMessage: 'Payload inválido o falta organization_id' })
    }

    try {
        // 1. Insert Transaction (Encabezado)
        const { data: sale, error: saleError } = await client
            .from('transactions')
            .insert({
                organization_id: organizationId,
                type: 'sale',
                document_type: payload.documentType || 'invoice',
                amount: Number(payload.total || 0),
                client_id: payload.clientId,
                status: payload.status,
                payment_method: payload.paymentMethod === 'credit' ? 'other' : payload.paymentMethod,
                payment_reference: payload.paymentReference,
                ...(payload.paymentTermDays ? { payment_term_days: payload.paymentTermDays } : {}),
                amount_paid: payload.status === 'paid' ? Number(payload.total || 0) : 0, 
                date: payload.date,
                currency: payload.currency,
                exchange_rate: Number(payload.exchangeRate || 1),
                subtotal: Number(payload.subtotal || 0),
                tax_iva: Number(payload.taxIva || 0),
                tax_igtf: Number(payload.taxIgtf || 0),
                is_exempt: payload.isExempt,

                exempt_amount: Number(payload.exemptAmount || 0),
                tax_base: Number(payload.taxBase || 0),
                tax_general_amount: Number(payload.taxGeneralAmount || 0),
                tax_reduced_amount: Number(payload.taxReducedAmount || 0),
                tax_luxury_amount: Number(payload.taxLuxuryAmount || 0),

                discount: Number(payload.discount || 0),
                items_snapshot: payload.itemsSnapshot,
                payment_details: payload.paymentDetails
            } as any)
            .select('*, client:clients(name)')
            .single()

        if (saleError) throw new Error(`Transaction Error: ${saleError.message}`)

        // 2. Insert Items (Detalles)
        const formattedItems = payload.rawItems.map((item: any) => ({
            organization_id: organizationId,
            transaction_id: sale.id,
            product_id: item.productId,
            quantity: Number(item.quantity || 0),
            price_at_transaction: Number(item.price || 0),
            discount: Number(item.discount || 0),
            tax_condition: item.taxCondition || 'exempt',
            tax_rate: Number(item.taxRate || 0)
        }))

        const { error: itemsError } = await client
            .from('transaction_items')
            .insert(formattedItems as any)

        if (itemsError) {
            // Intentar Rollback manual (Borrar la transacción creada huérfana)
            await client.from('transactions').delete().eq('id', sale.id)
            throw new Error(`Items Error: ${itemsError.message}`)
        }

        // 3. Decrement Stock (Inventario)
        // Usamos el RPC de Supabase para descontar el stock de forma segura en la DB
        const stockErrors = []
        for (const item of payload.rawItems) {
            const { error: stockError } = await client.rpc('decrement_stock', { p_id: item.productId, q: item.quantity })
            if (stockError) stockErrors.push(stockError)
        }
        
        if (stockErrors.length > 0) {
            console.error('Algunos productos fallaron en descontar stock:', stockErrors)
            // No hacemos rollback completo de la venta aquí porque el pago ya pudo haberse procesado
            // pero dejamos log del error de inventario. En un futuro, el RPC "decrement_stock"
            // podría envolverse en la misma transacción SQL.
        }

        return { status: 'success', sale }

    } catch (e: any) {
        console.error('Error procesando venta en el servidor:', e)
        throw createError({
            statusCode: 500,
            statusMessage: e.message || 'Internal Server Error'
        })
    }
})
