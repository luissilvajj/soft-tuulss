import { useOrganization } from './useOrganization'

export const usePermissions = () => {
    const { organization } = useOrganization()

    const isAdmin = computed(() => {
        // Strict Role Check: Only Owner or Admin can edit
        const role = organization.value?.role
        return role === 'owner' || role === 'admin'
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
