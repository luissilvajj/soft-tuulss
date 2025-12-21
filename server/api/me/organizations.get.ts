import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const client = await serverSupabaseClient(event)

    // Fetch all memberships with org details
    const { data, error } = await client
        .from('organization_members')
        .select(`
            role,
            organization: organizations (
                id,
                name,
                logo_url,
                subscription_status
            )
        `)
        .eq('user_id', user.id)

    if (error) {
        console.error('Organizations List Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `DB Error: ${error.message} (${error.details || 'no details'})`
        })
    }

    // Flatten structure
    return data.map((m: any) => ({
        id: m.organization.id,
        name: m.organization.name,
        logo_url: m.organization.logo_url,
        subscription_status: m.organization.subscription_status,
        role: m.role
    }))
})
