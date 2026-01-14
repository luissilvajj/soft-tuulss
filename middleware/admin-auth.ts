export default defineNuxtRouteMiddleware((to, from) => {
    const { isAdmin } = usePermissions()

    // If role is not loaded yet, we might want to wait or redirect.
    // Assuming usePermissions is reactive and 'organization' is loaded.
    // Ideally, this check happens after auth/org load.

    if (!isAdmin.value) {
        if (process.client) {
            // useToast inside middleware can be tricky, relying on simple redirect
            // or just return abortNavigation
            // alert('Access Denied: Admins Only')
        }
        return navigateTo('/app/sales/new') // Redirect to POS
    }
})
