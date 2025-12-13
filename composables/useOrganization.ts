export const useOrganization = () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()

    // Clean state for current organization
    const organization = useState('current_org', () => null)
    const loading = useState('org_loading', () => false)

    const fetchOrganization = async () => {
        if (!user.value?.id) return null

        // Return if already loaded
        if (organization.value) return organization.value

        loading.value = true
        try {
            // Get the first organization for simplicity in MVP
            const { data, error } = await client
                .from('organization_members')
                .select(`
          organization:organizations (
            id,
            name,
            logo_url,
            subscription_status
          ),
          role
        `)
                .eq('user_id', user.value.id)
                .single() as any

            if (error && error.code !== 'PGRST116') throw error // PGRST116 is no rows found

            if (data) {
                organization.value = {
                    ...data.organization,
                    role: data.role // Append role to org object for easy access
                }
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
