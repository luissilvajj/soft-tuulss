import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { reference, date, amount, plan, organization_id } = body

    if (!reference || !amount || !organization_id) {
        throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    const config = useRuntimeConfig()
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY
    if (!serviceKey) throw createError({ statusCode: 500, message: 'Missing Service Key' })

    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, serviceKey)

    // Insert Report
    const { data, error } = await supabaseAdmin
        .from('payment_reports')
        .insert({
            user_id: user.id || user.sub,
            organization_id: organization_id,
            reference_number: reference,
            payment_date: date,
            amount: parseFloat(amount),
            plan_type: plan,
            status: 'pending'
        })
        .select()
        .single()

    if (error) {
        console.error('Payment Report Error:', error)
        throw createError({ statusCode: 500, message: 'Failed to save report' })
    }

    return { success: true, report: data }
})
