export const useOrganization = () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()

    // Clean state for current organization
    const organization = useState<any>('current_org', () => null)
    const loading = useState('org_loading', () => false)

    const fetchOrganization = async (force = false) => {
        if (!user.value || !user.value.id) return null

        // Return if already loaded and not forced
        if (organization.value && !force) return organization.value

        loading.value = true
        try {
            // Use Server API to bypass RLS issues
            const data = await $fetch('/api/me/organization')

            if (data) {
                organization.value = data
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
        loading,
        fetchOrganization
    }
}
