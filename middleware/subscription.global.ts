export default defineNuxtRouteMiddleware(async (to) => {
    // 1. Only enforce on /app routes
    if (!to.path.startsWith('/app')) return

    // 2. Allow access to Billing Settings even if expired (to prevent lockout loop)
    if (to.path === '/app/settings/billing') return

    // Allow access to selection and debug pages
    if (to.path === '/app/select-org' || to.path === '/debug-orgs') return

    const { organization, fetchOrganization, userOrganizations } = useOrganization()

    // 3. Ensure organization data is loaded
    if (!organization.value) {
        // Retry/wait mechanism for hydration
        await fetchOrganization()
        // If still null, try one more time with force=true after small delay if client-side
        if (!organization.value && process.client) {
            await new Promise(r => setTimeout(r, 500))
            await fetchOrganization(true)
        }
    }

    // Hande missing active organization
    if (!organization.value) {
        const user = useSupabaseUser()

        // If no user detected yet, don't redirect to onboarding (let auth middleware handle login)
        // This prevents the "Flash of Onboarding" when user is null during hydration
        if (!user.value) {
            return
        }

        // Only redirect to selection/onboarding if we are SURE we have fetched orgs
        // and found nothing.
        const { userOrganizations } = useOrganization()

        if (userOrganizations.value && userOrganizations.value.length > 0) {
            return navigateTo('/app/select-org')
        }

        // If really no organizations AND we have a user, go to onboarding
        // [FIX] Moving this check to Dashboard Layout to prevent redirect loops during hydration
        // if (userOrganizations.value && userOrganizations.value.length === 0) {
        //    return navigateTo('/onboarding')
        // }
    }

    const org = organization.value

    // [FIX] Prevent crash if org is still null (waiting for layout or hydration)
    if (!org) return

    const now = new Date()

    // 5. Subscription Logic
    const status = org.subscription_status || 'active' // Default to active if null (MVP)
    const validStatuses = ['active', 'trialing']

    if (validStatuses.includes(status)) {
        return
    }

    // Grace Period Logic (for past_due)
    if (status === 'past_due') {
        const failureDate = org.last_payment_failure ? new Date(org.last_payment_failure) : new Date(org.updated_at || now)
        const daysSinceFailure = (now.getTime() - failureDate.getTime()) / (1000 * 3600 * 24)

        // 5 days grace
        if (daysSinceFailure < 5) {
            return // Allow access (Nagware will show)
        }
    }

    // 6. Hard Block (Kill Switch)
    // Redirect to billing if not in permitted paths
    if (!to.path.startsWith('/app/settings')) {
        return navigateTo('/app/settings/billing')
    }
})
