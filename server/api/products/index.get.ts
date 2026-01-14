import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const search = (query.search as string) || ''
    const orgId = query.organization_id as string

    if (!orgId) {
        throw createError({ statusCode: 400, message: 'Organization ID is required' })
    }

    // Verify access to organization via RLS Helper logic or explicit check
    // Since RLS is enabled on table, we just need to pass the query.
    // However, serverSupabaseClient uses the USER'S auth context, so RLS applies automatically.

    let dbQuery = client
        .from('products')
        .select('*', { count: 'exact' })
        .eq('organization_id', orgId)
        .is('deleted_at', null) // Soft Delete check
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (search) {
        // ILIKE for case-insensitive search on name or SKU
        dbQuery = dbQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    const { data, count, error } = await dbQuery

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return {
        data: data,
        total: count || 0,
        page: page,
        totalPages: Math.ceil((count || 0) / limit)
    }
})
