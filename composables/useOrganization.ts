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
            if (!data.session) {
                // Double check: ask for user directly (more robust than getSession sometimes)
                const { data: userData } = await client.auth.getUser()
                if (!userData.user) return null // Really logged out
                user.value = userData.user as any
            } else {
                user.value = data.session.user as any
            }
        }

        if (!user.value || !user.value.id) return null

        // Return if already loaded and not forced
        if (organization.value && !force && userOrganizations.value.length) return organization.value

        loading.value = true
        try {
            // 1. Fetch List of All Organizations
            let list = await $fetch<any[]>(`/api/me/organizations?t=${new Date().getTime()}`).catch(e => {
                console.warn('API Fetch failed, trying direct fallback', e)
                return []
            })

            // FALLBACK: If API returns empty/error, try direct Client Fetch (RLS Validation)
            // This bypasses server-side cookie race conditions
            if (!list || list.length === 0) {
                console.log('useOrganization: API empty, trying direct DB fetch...')
                const { data: directMembers, error: directError } = await client
                    .from('organization_members')
                    .select('role, organization:organizations(*)')
                    .eq('user_id', user.value.id)

                if (directError) {
                    console.error('useOrganization: Direct fetch error', directError)
                } else if (directMembers && directMembers.length > 0) {
                    console.log('useOrganization: Direct fetch success!', directMembers.length)
                    list = directMembers.map((d: any) => ({
                        ...d.organization,
                        role: d.role
                    })).filter(o => o && o.id) // Filter null inclusions
                }
            }

            userOrganizations.value = list || []

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
