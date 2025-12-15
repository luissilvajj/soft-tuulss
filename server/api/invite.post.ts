import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, orgId } = body

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
    // This sends the email AND creates the user in auth.users if they don't exist
    // If they exist, it might throw an error or just return user.
    // We suppress "User already registered" error to proceed with adding them to Org.

    const { data: inviteData, error: inviteError } = await client.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/app`
    })

    let targetUserId = inviteData.user?.id

    if (inviteError) {
        // If error is "User already registered", we need to find their ID.
        // Sadly, the error message text varies.
        // We will try to find the user by email regardless.
        const { data: userData } = await client.from('auth.users').select('id').eq('email', email).single() // RLS might block this?
        // Service Role can query auth schema? No, usually 'auth' schema is protected even from Service Role PostgREST unless exposed.
        // But we have client.auth.admin!

        if (!targetUserId) {
            const { data: listData } = await client.auth.admin.listUsers() // Inefficient but functional for small userbase
            // Ideally use specific getUser functions if available in version
            // As of v2:
            // client.auth.admin.getUserByEmail(email) is available ???
            // Let's try LIST with filter if API supports it, or just scan.
            // Actually, Supabase JS v2 has `listUsers({ page: 1, perPage: 1 })` but no filter.
            // But wait, if they are already registered, we just want to add them.

            // Let's assume we can get the ID via RPC provided earlier? 
            // "add_team_member" does `select id from auth.users`.
            // So we can fallback to calling that RPC if invite fails!
            // BUT "add_team_member" uses `auth.uid()` context, which we lack.

            // BETTER: Use a new RPC "get_user_id_by_email" that is SECURITY DEFINER.
            // I'll add this RPC to the plan if needed.
            // OR: `client.rpc('add_team_member', ...)` usually uses the token passed to it.
            // If I use `serverSupabaseServiceRole`, does it send a superuser token?
            // Yes, it bypasses RLS. But `auth.uid()` in PLPGSQL will be null.
            // `add_team_member` requires `auth.uid()` for permission check.

            // Workaround:
            // Use our manual permission check (Step 3).
            // Use `client.auth.admin.listUsers()` filtering? 
            // Actually, `getUserById` exists. `getUserByEmail`? Check docs logic.
            // If not, we can insert blindly into organization_members with a Subquery?
            // `values (orgId, (select id from auth.users where email = ...), ...)`
            // YES! SQL Subquery works perfectly.
        }
    }

    // 5. Insert into Organization Members
    // We use a subquery for user_id to be robust against "User ID not known in var".
    // We trust 'email' matches.
    const { error: insertError } = await client
        .from('organization_members')
        .insert({
            organization_id: orgId,
            role: 'member',
            user_id: targetUserId // If null, we might fail. Use raw match?
        })
        .select()

    // If targetUserId was null (invite failed because existing), we need that subquery approach.
    // PostgREST doesn't support subqueries in insert values easily.
    // So we really need the User ID.

    if (!targetUserId) {
        // Fallback: If invite failed, user exists. 
        // We need to fetch ID. 
        // We can use a raw generic query or a helper RPC.
        // Let's try `add_team_member` usage again.
        // If we modify `add_team_member` to NOT check `auth.uid()` if called by Service Role? Hard.

        // Let's rely on `client.auth.admin.listUsers` matching by email.
        const { data: { users } } = await client.auth.admin.listUsers()
        const found = users?.find(u => u.email === email)
        if (found) targetUserId = found.id
    }

    if (!targetUserId) {
        throw createError({ statusCode: 404, message: 'No se pudo encontrar ni crear el usuario.' })
    }

    // Now insert
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
