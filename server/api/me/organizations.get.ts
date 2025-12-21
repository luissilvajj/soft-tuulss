import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // Use standard user client (RLS)
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    try {
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
            // Return empty list on error during list fetch - safer for UI than crashing
            // But if it's a real DB error, we might want to know. 
            // For now, let's throw 500 but with more info if dev.
            throw createError({
                statusCode: 500,
                statusMessage: 'DB Error fetching organizations',
                data: error
            })
        }

        // Flatten structure
        return data.map((m: any) => ({
            id: m.organization?.id,
            name: m.organization?.name || 'Unnamed Org',
            logo_url: m.organization?.logo_url,
            subscription_status: m.organization?.subscription_status,
            role: m.role
        }))

    } catch (e: any) {
        console.error('Unhandled API Error:', e)
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || 'Internal Server Error',
            data: e.message
        })
    }
})
