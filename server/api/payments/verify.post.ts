import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { reference, date, amount, phone, type, organization_id } = body

    if (!organization_id) {
        throw createError({ statusCode: 400, statusMessage: 'Organization ID required' })
    }

    // 1. Instanciar Cliente (Usará variables de entorno cuando estén listas)
    const bancoPlaza = new BancoPlazaClient()
    let isValid = false

    // 2. Verificar según el tipo
    try {
        if (type === 'pago_movil') {
            isValid = await bancoPlaza.verifyPagoMovil({
                reference,
                date,
                amount: parseFloat(amount),
                phone
            })
        } else if (type === 'transferencia') {
            isValid = await bancoPlaza.verifyTransferencia({
                reference,
                date,
                amount: parseFloat(amount)
            })
        }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: 'Error comunicando con Banco Plaza: ' + e.message })
    }

    if (!isValid) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Pago No Encontrado o Inválido. Verifica los datos.'
        })
    }

    // 3. SI EL PAGO ES VÁLIDO -> ACTIVAR SUSCRIPCIÓN
    // Necesitamos el service key para escribir en la BD sin RLS
    const config = useRuntimeConfig()
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    // Fallback simple si no hay service key (dev mode sin env var) pero debería haber
    if (!serviceKey) console.error('Warning: No Service Key for Subscription Update')

    // Direct SQL update via Supabase Client
    // Usamos createClient manualmente como en admin/tenants.get.ts
    const supabase = createClient(process.env.SUPABASE_URL!, serviceKey as string)

    if (supabase) {
        // Calcular nueva fecha: +30 días desde HOY o desde cuando venza
        const { data: org, error: fetchError } = await supabase.from('organizations').select('trial_ends_at, subscription_status').eq('id', organization_id).single()

        if (fetchError) {
            console.error('Error fetching org:', fetchError)
            throw createError({ statusCode: 500, statusMessage: 'Error buscando organización' })
        }

        const now = new Date()
        const currentEnd = org?.trial_ends_at ? new Date(org.trial_ends_at) : now

        // Si ya venció, empezamos desde hoy. Si no, sumamos al final.
        const baseDate = currentEnd > now ? currentEnd : now
        const newDate = new Date(baseDate)
        newDate.setDate(newDate.getDate() + 30) // +1 Mes

        // Actualizar
        const { error } = await supabase.from('organizations').update({
            subscription_status: 'active',
            trial_ends_at: newDate.toISOString()
            // updated_at removed as it does not exist
        }).eq('id', organization_id)

        if (error) throw createError({ statusCode: 500, statusMessage: 'Error actualizando suscripción: ' + error.message })

        return { success: true, new_expiry: newDate, message: '¡Pago Validado! Suscripción Extendida.' }
    }
})
