import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const query = getQuery(event)
    const organizationId = query.organization_id as string
    const page = parseInt(query.page as string || '1')
    const limit = parseInt(query.limit as string || '10')
    const search = query.search as string || ''
    const offset = (page - 1) * limit

    if (!organizationId) {
        throw createError({ statusCode: 400, message: 'Organization ID required' })
    }

    // Build query with RLS + Logical Deletion + Search
    let dbQuery = client
        .from('products')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (search) {
        dbQuery = dbQuery.ilike('name', `%${search}%`)
    }

    const { data: products, error, count } = await dbQuery

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return {
        data: products,
        total: count,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 1
    }
})
