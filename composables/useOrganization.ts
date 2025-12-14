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
            // Get the first organization for simplicity in MVP
            const { data, error } = await client
                .from('organization_members')
                .select(`
          organization:organizations (
            id,
            name,
            logo_url,
            subscription_status,
            subscription_plan,
            trial_ends_at,
            current_period_end,
            stripe_customer_id
          ),
          role
        `)
                .eq('user_id', user.value.id)
                .limit(1)
                .maybeSingle() as any

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
