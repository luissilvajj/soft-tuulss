export const useOrganization = () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()

    // Clean state for current organization
    const organization = useState<any>('current_org', () => null)
    const userOrganizations = useState<any[]>('user_orgs', () => [])
    const loading = useState('org_loading', () => false)
    const orgCookie = useCookie('softtuuls_org_id')

    const switchOrganization = async (orgId: string) => {
        if (!userOrganizations.value.length) await fetchOrganization()

        const target = userOrganizations.value.find(o => o.id === orgId)
        if (target) {
            organization.value = target
            orgCookie.value = orgId
            // Reload window to refresh all data (cleanest way for now)
            if (process.client) {
                window.location.reload()
            }
        }
    }

    const fetchOrganization = async (force = false) => {
        // Wait for user if not hydrated
        if (!user.value) {
            const { data } = await client.auth.getSession()
            if (!data.session) return null // Really logged out
            // Supabase user state should update automatically, but let's trust the session
            if (!user.value) user.value = data.session.user as any // Manual hydration fallback
        }

        if (!user.value || !user.value.id) return null

        // Return if already loaded and not forced
        if (organization.value && !force && userOrganizations.value.length) return organization.value

        loading.value = true
        try {
            // 1. Fetch List of All Organizations
            const response: any = await $fetch(`/api/me/organizations?t=${new Date().getTime()}`)

            if (response.error) {
                console.error('[useOrg] API Error:', response)
                throw new Error(response.message || 'Server Error')
            }

            const list = Array.isArray(response) ? response : []
            userOrganizations.value = list

            if (list && list.length > 0) {
                // 2. Determine Active Org
                let active = list.find((o: any) => o.id === orgCookie.value)

                // Fallback Logic:
                // Only auto-select if there is only ONE organization.
                if (!active) {
                    if (list.length === 1) {
                        active = list[0]
                        orgCookie.value = active.id
                    } else {
                        // More than 1 org and no valid cookie? 
                        // Leave active as undefined/null so middleware redirects to selection page
                        active = null
                    }
                }

                organization.value = active
            } else {
                organization.value = null
            }

        } catch (e) {
            console.error('Error fetching organization:', e)
        } finally {
            loading.value = false
        }

        return organization.value
    }

    return {
        organization,
        userOrganizations,
        loading,
        fetchOrganization,
        switchOrganization
    }
}
