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
        // Step 1: Fetch Memberships (Join-Free to be safe)
        const { data: members, error: membersError } = await client
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id)

        if (membersError) {
            console.error('Members Fetch Error:', membersError)
            throw createError({ statusCode: 500, statusMessage: 'DB Error fetching members', data: membersError })
        }

        if (!members || members.length === 0) {
            return []
        }

        // Step 2: Fetch Organization Details manually
        const orgIds = members.map((m: any) => m.organization_id)
        const { data: orgs, error: orgsError } = await client
            .from('organizations')
            .select('id, name') // Bare minimum to test if column issue
            .in('id', orgIds)

        if (orgsError) {
            console.error('Orgs Fetch Error:', orgsError)
            // Dont crash, just return what we can? No, crash so we know.
            throw createError({ statusCode: 500, statusMessage: 'DB Error fetching org details', data: orgsError })
        }

        // Step 3: Merge in Memory
        return members.map((m: any) => {
            const org = orgs?.find((o: any) => o.id === m.organization_id)
            if (!org) return null // Shouldnt happen unless data corruption

            return {
                id: org.id,
                name: org.name || 'Unnamed Org',
                subscription_status: org.subscription_status,
                role: m.role
            }
        }).filter(Boolean) // Remove nulls

    } catch (e: any) {
        console.error('Unhandled API Error:', e)
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || 'Internal Server Error',
            data: e.message
        })
    }
})
