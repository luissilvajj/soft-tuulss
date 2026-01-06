import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // 1. Authenticate
    let user = null
    try {
        user = await serverSupabaseUser(event)
    } catch (e) {
        console.error('[OrgCreate] Auth Exception:', e)
        return { success: false, message: 'Authentication Failed' }
    }

    if (!user) return { success: false, message: 'Unauthorized' }

    // DEBUG: Log the entire user structure to see what's wrong
    console.log('[OrgCreate] Authenticated User:', JSON.stringify({
        id: user.id,
        sub: user.sub,
        email: user.email,
        keys: Object.keys(user)
    }, null, 2))

    const userId = user.id || user.sub // Fallback to sub if id is missing
    if (!userId) {
        console.error('[OrgCreate] User Missing ID:', JSON.stringify(user))
        return { success: false, message: 'User ID is missing from session' }
    }

    // 2. Parse Body
    const body = await readBody(event)
    const orgName = body.name
    if (!orgName) return { success: false, message: 'Name is required' }

    // 3. Setup Admin Client (Robust)
    const config = useRuntimeConfig()
    const serviceKey = (config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY || '').trim()
    const supabaseUrl = (config.public?.supabase?.url || process.env.SUPABASE_URL || '').trim()

    if (!serviceKey || !supabaseUrl || serviceKey.startsWith('sb_secret')) {
        console.error('[OrgCreate] MISCONFIGURED. URL:', !!supabaseUrl, 'Key:', !!serviceKey)
        return { success: false, message: 'Server Configuration Error (Missing Key)' }
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    try {
        console.log('[OrgCreate] Starting creation for user:', userId)

        // 4. CHECK IF USER ALREADY HAS AN ORG (Owner role)
        const { data: existingMember } = await adminClient
            .from('organization_members')
            .select('organization:organizations(*)')
            .eq('user_id', userId)
            .eq('role', 'owner')
            .limit(1)
            .maybeSingle()

        if (existingMember && existingMember.organization) {
            const org = existingMember.organization as any
            console.log('[OrgCreate] User already has org:', org.id)
            return { success: true, org: org, note: 'Existing Org Found' }
        }

        // 5. ENSURE PROFILE
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: userId,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString()
            })

        if (profileError) console.warn('[OrgCreate] Profile Warning:', profileError)

        // 6. CREATE ORG
        const { data: org, error: orgError } = await adminClient
            .from('organizations')
            .insert({
                name: orgName,
                subscription_status: 'active',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single()

        if (orgError) {
            console.error('[OrgCreate] Org DB Error:', orgError)
            return { success: false, message: orgError.message }
        }

        // 7. ADD MEMBER
        const { error: memberError } = await adminClient
            .from('organization_members')
            .insert({
                organization_id: org.id,
                user_id: userId,
                role: 'owner'
            })

        if (memberError) {
            console.error('[OrgCreate] Member DB Error:', memberError)
            return { success: false, message: memberError.message }
        }

        console.log('[OrgCreate] Success:', org.id)
        return { success: true, org }

    } catch (e: any) {
        console.error('[OrgCreate] CRITICAL FAILURE:', e)
        return { success: false, message: e.message || 'Unknown Server Error' }
    }
})
