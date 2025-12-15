import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, orgId } = body

    // 0. Configuration Check
    if (!process.env.supabaseServiceKey && !process.env.SUPABASE_SERVICE_KEY) {
        throw createError({ statusCode: 500, message: 'Server Config Error: SUPABASE_SERVICE_KEY is missing.' })
    }

    // 1. Authenticate Requesting User
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 2. Initialize Service Role Client (Admin)
    const client = serverSupabaseServiceRole(event)

    // 3. Verify Permissions
    // Check if the requesting user is an Owner/Admin of the target Org
    console.log('Invite Request:', { userId: user.id, orgId })

    const { data: membership, error: permError } = await client
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()

    console.log('Permission Check:', { membership, permError })

    if (permError || !membership || !['owner', 'admin'].includes(membership.role)) {
        console.error('Permission Denied Details:', { role: membership?.role, error: permError })
        throw createError({ statusCode: 403, message: `No tienes permisos. Rol: ${membership?.role}, Error: ${permError?.message}` })
    }

    // 4. Invite User via Supabase Auth
    const { data: inviteData, error: inviteError } = await client.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/app`
    })

    let targetUserId = inviteData.user?.id

    if (inviteError) {
        // If error is "User already registered", we try to find them
        const { data: { users } } = await client.auth.admin.listUsers()
        const found = users?.find(u => u.email === email)
        if (found) targetUserId = found.id
    }

    if (!targetUserId) {
        throw createError({ statusCode: 404, message: 'No se pudo encontrar ni crear el usuario.' })
    }

    // 5. Insert into Organization Members
    const { error: finalError } = await client
        .from('organization_members')
        .upsert({
            organization_id: orgId,
            user_id: targetUserId,
            role: 'member'
        }, { onConflict: 'organization_id,user_id' })

    if (finalError) throw createError({ statusCode: 500, message: finalError.message })

    return { success: true }
})
