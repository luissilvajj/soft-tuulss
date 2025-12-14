import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    // Retrieve Service Key from runtime config
    // Ensure you added SUPABASE_SERVICE_KEY to .env and Vercel
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Configuration Error: Missing SUPABASE_SERVICE_KEY'
        })
    }

    // Create a Supabase client with the SERVICE ROLE key (Bypasses RLS)
    const supabase = createClient(process.env.SUPABASE_URL!, serviceKey)

    // Fetch all organizations with their owner's email
    // We join organization_members -> profiles
    const { data, error } = await supabase
        .from('organizations')
        .select(`
            *,
            members:organization_members (
                role,
                profile:profiles ( email )
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    // Process data to flatter structure (get owner email)
    const tenants = data.map(org => {
        const owner = org.members.find((m: any) => m.role === 'owner')
        return {
            ...org,
            owner_email: owner?.profile?.email || 'No Owner'
        }
    })

    return tenants
})
