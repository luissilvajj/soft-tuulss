import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { orgId, action, days, plan } = body

    if (!orgId || !action) {
        throw createError({ statusCode: 400, statusMessage: 'Missing orgId or action' })
    }

    const config = useRuntimeConfig()
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY
    if (!serviceKey) throw createError({ statusCode: 500, statusMessage: 'Missing Service Key' })

    const supabase = createClient(process.env.SUPABASE_URL!, serviceKey)

    let updateData = {}

    if (action === 'extend_trial') {
        // Add X days to current date (default 14)
        const daysToAdd = days ? parseInt(days) : 14
        const newDate = new Date()
        newDate.setDate(newDate.getDate() + daysToAdd)
        updateData = {
            trial_ends_at: newDate.toISOString(),
            subscription_status: 'trialing'
        }
    } else if (action === 'set_plan') {
        // Generic set plan action
        const validPlans = ['basic', 'pro', 'enterprise']
        const selectedPlan = validPlans.includes(plan) ? plan : 'pro'

        updateData = {
            subscription_status: 'active',
            subscription_plan: selectedPlan
        }
    } else if (action === 'cancel_sub') {
        updateData = {
            subscription_status: 'canceled'
        }
    } else if (action === 'delete_org') {
        // Delete organization (cascade will delete related data)
        const { error: deleteError } = await supabase
            .from('organizations')
            .delete()
            .eq('id', orgId)

        if (deleteError) {
            throw createError({ statusCode: 500, statusMessage: deleteError.message })
        }
        return { success: true, deleted: true }
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
