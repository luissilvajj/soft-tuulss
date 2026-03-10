export default defineNuxtRouteMiddleware(async (to, from) => {
    const { isAdmin } = usePermissions() // computed based on organization
    const { organization, fetchOrganization } = useOrganization()

    // Ensure organization is loaded before checking permissions
    if (!organization.value) {
        await fetchOrganization()
    }

    // Vue computed properties sometimes need a micro-tick to update after fetch
    // Although Nuxt SSR is synchronous during setup, client-side might race.
    // It's safer to check the raw role directly from the fetched organization 
    // to avoid computed reactivity delays causing false kicks.
    const currentRole = organization.value?.role || 'member'
    const hasAdminAccess = ['owner', 'admin'].includes(currentRole)

    if (!hasAdminAccess) {
        if (process.client) {
            console.warn('Access Denied: Redirecting to POS. Role:', currentRole)
        }
        return navigateTo('/app/sales/new') // Redirect to POS
    }
})
