import { useOrganization } from './useOrganization'

export const usePermissions = () => {
    const { organization } = useOrganization()

    const userRole = computed(() => organization.value?.role || 'member')

    const isOwner = computed(() => userRole.value === 'owner')
    const isAdmin = computed(() => ['owner', 'admin'].includes(userRole.value))
    const isCashier = computed(() => userRole.value === 'cashier')

    // Capabilities
    const canEditInventory = computed(() => isAdmin.value)
    const canManageTeam = computed(() => isOwner.value) // Strict owner
    const canViewFinancials = computed(() => isAdmin.value)
    const canProcessRefunds = computed(() => isAdmin.value) // Example

    return {
        userRole,
        isOwner,
        isAdmin,
        isCashier,
        canEditInventory,
        canManageTeam,
        canViewFinancials,
        canProcessRefunds
    }
}
