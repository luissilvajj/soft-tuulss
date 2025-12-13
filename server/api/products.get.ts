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

    const { data, error } = await client
        .from('products')
        .select('*')
        .eq('organization_id', organizationId)

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})
