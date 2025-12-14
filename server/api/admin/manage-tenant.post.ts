import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { orgId, action } = body

    if (!orgId || !action) {
        throw createError({ statusCode: 400, statusMessage: 'Missing orgId or action' })
    }

    const config = useRuntimeConfig()
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY
    if (!serviceKey) throw createError({ statusCode: 500, statusMessage: 'Missing Service Key' })

    const supabase = createClient(process.env.SUPABASE_URL!, serviceKey)

    let updateData = {}

    if (action === 'extend_trial') {
        // Add 14 days to current time (or current trial end if valid?)
        // Let's just reset to NOW + 14 days for simplicity
        const newDate = new Date()
        newDate.setDate(newDate.getDate() + 14)
        updateData = {
            trial_ends_at: newDate.toISOString(),
            subscription_status: 'trialing'
        }
    } else if (action === 'activate_pro') {
        updateData = {
            subscription_status: 'active',
            subscription_plan: 'pro'
        }
    } else if (action === 'cancel_sub') {
        updateData = {
            subscription_status: 'canceled'
        }
    } else {
        throw createError({ statusCode: 400, statusMessage: 'Invalid Action' })
    }

    const { error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', orgId)

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
})
