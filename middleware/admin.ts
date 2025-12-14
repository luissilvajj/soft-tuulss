export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser()

    // 1. Check Authentication
    if (!user.value) {
        return navigateTo('/login')
    }

    // 2. Check Whitelist (The Wall)
    const allowedEmails = ['luisxsilva56@gmail.com']

    if (!user.value.email || !allowedEmails.includes(user.value.email)) {
        console.warn('Access attempt to /admin denied for:', user.value.email)
        return navigateTo('/app') // Bounce back to normal app
    }
})
