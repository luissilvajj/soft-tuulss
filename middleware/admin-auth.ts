export default defineNuxtRouteMiddleware(async (to, from) => {
    const { isAdmin } = usePermissions() // computed based on organization
    const { organization, fetchOrganization } = useOrganization()

    // Ensure organization is loaded before checking permissions
    if (!organization.value) {
        await fetchOrganization()
    }

    if (!isAdmin.value) {
        if (process.client) {
            console.warn('Access Denied: Redirecting to POS. Role:', organization.value?.role)
        }
        return navigateTo('/app/sales/new') // Redirect to POS
    }
})
