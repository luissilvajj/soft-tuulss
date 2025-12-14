export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()

    // 1. Check Authentication (Robust SPA Check)
    if (!user.value) {
        const { data } = await client.auth.getSession()
        if (!data.session) {
            return navigateTo('/login')
        }
    }

    // 2. Check Whitelist (The Wall)
    // Re-fetch user in case we just hydrated the session
    const currentUser = user.value || (await client.auth.getUser()).data.user
    const allowedEmails = ['luisxsilva56@gmail.com']

    if (!currentUser?.email || !allowedEmails.includes(currentUser.email)) {
        console.warn('Access attempt to /admin denied for:', currentUser?.email)
        return navigateTo('/app') // Bounce back to normal app
    }
})
