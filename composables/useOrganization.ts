export const useOrganization = () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()
    const { $pinia } = useNuxtApp()

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

            // Limpiar todo el estado de Nuxt globalmente para evitar fugas de datos
            clearNuxtState()

            // Limpieza higiénica profunda del Pinia Store (Carrito y estado persistido)
            if (process.client) {
                // Must import dynamically to avoid initialization circular dependency in Nuxt plugins
                import('~/stores/sales').then(({ useSalesStore }) => {
                     const sales = useSalesStore($pinia)
                     sales.resetState()
                })
            }

            // Limpia el caché de peticiones y lanza una reactivación global sin recargar
            // [FIX] clearNuxtData() puede no retornar Promise en todas las iteraciones/versiones.
            // Para evitar el "TypeError", lo envolvemos en asincronía segura.
            if (process.client) {
                try {
                    const result = clearNuxtData()
                    if (result && typeof result.then === 'function') {
                        await result
                    }
                } catch (e) {
                    console.warn('Nuxt Data Cache clean warning', e)
                }
                refreshNuxtData()
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
            list = list || [] // Absolute guarantee it is an array

            // FALLBACK: If API returns empty/error, try direct Client Fetch (RLS Validation)
            // This bypasses server-side cookie race conditions
            // FALLBACK: If API returns empty/error, try direct Client Fetch (RLS Validation)
            // This bypasses server-side cookie race conditions
            if (!list || list.length === 0) {
                // Re-verify user if ID is missing, just in case ref was lost
                if (!user.value?.id) {
                    const { data: retryUser } = await client.auth.getUser()
                    if (retryUser.user) user.value = retryUser.user as any
                }

                // Validate UUID to prevent Postgres 22P02 error
                const userId = user.value?.id
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

                if (userId && uuidRegex.test(userId)) {
                    console.log('useOrganization: API empty, trying direct DB fetch...', userId)

                    // Step 1: Fetch Memberships
                    const { data: memberships, error: memError } = await client
                        .from('organization_members')
                        .select('organization_id, role')
                        .eq('user_id', userId)

                    if (memError) {
                        console.error('useOrganization: Direct fetch (members) error', memError)
                    } else if (memberships && memberships.length > 0) {
                        // Step 2: Fetch Organization Details
                        const orgIds = memberships.map((m: any) => m.organization_id)
                        const { data: orgDetails, error: orgError } = await client
                            .from('organizations')
                            .select('id, name, logo_url, subscription_status, subscription_plan, trial_ends_at, current_period_end, stripe_customer_id, stripe_subscription_id, fiscal_doc, address, phone, receipt_footer, last_payment_failure, created_at')
                            .in('id', orgIds)

                        if (orgError) {
                            console.error('useOrganization: Direct fetch (orgs) error', orgError)
                        } else {
                            // Step 3: Merge
                            list = memberships.map((m: any) => {
                                const details = (orgDetails || []).find((o: any) => o.id === m.organization_id)
                                if (!details) return null
                                return {
                                    ...details,
                                    role: m.role // Explicitly set role from membership
                                }
                            }).filter(Boolean)

                            console.log('useOrganization: Direct fetch success! Merged:', list.length)
                        }
                    } else {
                        console.warn('useOrganization: No memberships found for user.')
                    }
                } else {
                    console.warn('useOrganization: Skipping direct fetch, invalid user ID:', userId)
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
