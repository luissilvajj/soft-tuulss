export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()

    // 1. Check Authentication
    if (!user.value) {
        const { data } = await client.auth.getSession()
        if (!data.session) {
            return navigateTo('/login')
        }
    }

    // 2. Check Admin Role (DB - is_super_admin)
    // We query the profile table. Note: This assumes RLS allows reading own profile.
    const { data: profile } = await client
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.value?.id)
        .single() as { data: { is_super_admin: boolean } | null } // Type assertion to bypass 'never'

    if (!profile?.is_super_admin) {
        // Fallback for safety during migration: Keep the original email as failsafe? 
        // No, removing it is the goal. But let's log the attempt.
        console.warn('Access attempt to /admin denied for:', user.value?.email)
        return navigateTo('/app')
    }
})
