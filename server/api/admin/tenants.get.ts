import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    // Retrieve Service Key from runtime config OR process.env directly (Vercel fallback)
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    if (!serviceKey) {
        console.error('DEBUG: Service Key missing.')
        console.error('Config:', config.supabaseServiceKey ? 'Present' : 'Missing')
        console.error('Env:', process.env.SUPABASE_SERVICE_KEY ? 'Present' : 'Missing')

        throw createError({
            statusCode: 500,
            statusMessage: 'Config Error: Missing SUPABASE_SERVICE_KEY. Check Vercel Env Vars.'
        })
    }

    // Create a Supabase client with the SERVICE ROLE key (Bypasses RLS)
    const supabase = createClient(process.env.SUPABASE_URL!, serviceKey)

    // 1. Fetch organizations and their members (to find owner ID)
    const { data: orgs, error: dbError } = await supabase
        .from('organizations')
        .select(`
            *,
            members:organization_members (
                user_id,
                role
            )
        `)
        .order('created_at', { ascending: false })

    if (dbError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'DB Error: ' + dbError.message
        })
    }

    // 2. Fetch Users from Supabase Auth (Service Key Required)
    // We fetch a batch of users to map IDs to Emails.
    // NOTE: For large scale, we should paginate or filter, but for <1000 users this is fine.
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 1000
    })

    if (authError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Auth Error: ' + authError.message
        })
    }

    // 3. Merge Data (Map Owner ID -> Email)
    const tenants = orgs.map(org => {
        const ownerMember = org.members.find((m: any) => m.role === 'owner')
        const ownerUser = users.find(u => u.id === ownerMember?.user_id)

        return {
            ...org,
            owner_email: ownerUser?.email || 'No Owner (Orphaned)',
            owner_id: ownerMember?.user_id
        }
    })

    return tenants
})
