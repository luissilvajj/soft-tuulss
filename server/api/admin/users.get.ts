import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    if (!serviceKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Config Error: Missing SUPABASE_SERVICE_KEY'
        })
    }

    const supabase = createClient(process.env.SUPABASE_URL!, serviceKey)

    // 1. Fetch Auth Users (Emails, Last Sign In)
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 1000
    })

    if (authError) throw createError({ statusCode: 500, statusMessage: authError.message })

    // 2. Fetch Profiles (Names)
    const { data: profiles, error: dbError } = await supabase
        .from('profiles')
        .select('*')

    if (dbError) throw createError({ statusCode: 500, statusMessage: dbError.message })

    // 3. Fetch Organization Memberships (to see who belongs where)
    const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select('user_id, role, organizations(name)')

    if (memberError) throw createError({ statusCode: 500, statusMessage: memberError.message })

    // 4. Merge Data
    const fullUsers = users.map(u => {
        const profile = profiles.find(p => p.id === u.id)
        const userMemberships = memberships.filter(m => m.user_id === u.id)

        return {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            full_name: profile?.full_name || 'Sin Nombre',
            avatar_url: profile?.avatar_url,
            organizations: userMemberships.map(m => {
                const orgData = m.organizations as any
                return {
                    name: Array.isArray(orgData) ? orgData[0]?.name : orgData?.name,
                    role: m.role
                }
            })
        }
    })

    // Sort by created_at desc
    return fullUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})
