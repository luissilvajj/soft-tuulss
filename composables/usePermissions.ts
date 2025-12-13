import { useOrganization } from './useOrganization'

export const usePermissions = () => {
    const { organization } = useOrganization()

    const isAdmin = computed(() => {
        return organization.value?.role === 'owner' || organization.value?.role === 'admin'
    })

    const canEditInventory = computed(() => isAdmin.value)
    const canManageTeam = computed(() => isAdmin.value)
    const canViewFinancials = computed(() => isAdmin.value)

    return {
        isAdmin,
        canEditInventory,
        canManageTeam,
        canViewFinancials
    }
}
