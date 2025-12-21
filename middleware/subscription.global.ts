export default defineNuxtRouteMiddleware(async (to) => {
    // 1. Only enforce on /app routes
    if (!to.path.startsWith('/app')) return

    // 2. Allow access to Billing Settings even if expired (to prevent lockout loop)
    if (to.path === '/app/settings/billing') return

    // Allow access to selection page
    if (to.path === '/app/select-org') return

    const { organization, fetchOrganization, userOrganizations } = useOrganization()

    // 3. Ensure organization data is loaded
    if (!organization.value) {
        await fetchOrganization()
    }

    // Hande missing active organization
    if (!organization.value) {
        // If we have organizations but none selected, go to selection
        if (userOrganizations.value && userOrganizations.value.length > 0) {
            return navigateTo('/app/select-org')
        }
        // If really no organizations, go to onboarding
        return navigateTo('/onboarding')
    }

    const org = organization.value
    const now = new Date()

    // 4. Trial Logic
    // If trial_ends_at is in the future, ACCESS GRANTED
    if (org.trial_ends_at && new Date(org.trial_ends_at) > now) {
        return
    }

    // 5. Subscription Logic
    // If status is active or trialing (stripe status), ACCESS GRANTED
    // const validStatuses = ['active', 'trialing']
    // if (validStatuses.includes(org.subscription_status)) {
    //    return
    // }

    // EMERGENCY OVERRIDE: Allow access if org exists to unblock user
    return

    // 6. Access Denied -> Redirect to Billing
    // Force redirect to billing page if trial expired and no active sub
    return navigateTo('/app/settings/billing')
})
