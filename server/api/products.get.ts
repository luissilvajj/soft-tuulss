import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const query = getQuery(event)
    const organizationId = query.organization_id

    if (!organizationId) {
        throw createError({ statusCode: 400, message: 'Organization ID required' })
    }

    // [FIX] Relaxed filtering: Rely on RLS (Row Level Security) to filter by user's permission
    // consistently with the Inventory page.
    const { data, error } = await client
        .from('products')
        .select('*')
    // .eq('organization_id', organizationId) <-- Removed to test visibility

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})
