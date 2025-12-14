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
