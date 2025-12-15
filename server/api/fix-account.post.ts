import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 1. Check if user already has an org member link
    const { data: existingLink } = await client
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle()

    if (existingLink) {
        // User Has Link, ensure Org is Active
        await client
            .from('organizations')
            .update({
                subscription_status: 'active',
                subscription_plan: 'pro'
            })
            .eq('id', existingLink.organization_id)

        return { status: 'fixed', message: 'Organization re-activated' }
    }

    // 2. User is Orphaned - Create new Org
    const { data: newOrg, error: orgError } = await client
        .from('organizations')
        .insert({
            name: 'Mi Organización (Recuperada)',
            subscription_status: 'active',
            subscription_plan: 'pro'
        })
        .select()
        .single()

    if (orgError) throw createError({ statusCode: 500, statusMessage: orgError.message })

    // 3. Link User to New Org
    const { error: linkError } = await client
        .from('organization_members')
        .insert({
            organization_id: newOrg.id,
            user_id: user.id,
            role: 'owner'
        })

    if (linkError) throw createError({ statusCode: 500, statusMessage: linkError.message })

    return { status: 'created', message: 'New Organization created and linked' }
})
