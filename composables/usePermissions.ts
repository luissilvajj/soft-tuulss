import { useOrganization } from './useOrganization'

export const usePermissions = () => {
    const { organization } = useOrganization()

    const userRole = computed(() => organization.value?.role || 'member')

    const isOwner = computed(() => userRole.value === 'owner')
    const isAdmin = computed(() => ['owner', 'admin'].includes(userRole.value))
    const isCashier = computed(() => userRole.value === 'cashier')

    const isSeniatAuditor = computed(() => userRole.value === 'seniat_auditor')
    
    // Groupings
    const isStaff = computed(() => ['owner', 'admin', 'cashier'].includes(userRole.value))

    // Capabilities
    const canEditInventory = computed(() => isAdmin.value)
    const canManageTeam = computed(() => isOwner.value) // Strict owner
    const canViewFinancials = computed(() => isAdmin.value)
    const canProcessRefunds = computed(() => isAdmin.value) // Example
    const canCreateSales = computed(() => isStaff.value) // Not auditors

    return {
        userRole,
        isOwner,
        isAdmin,
        isCashier,
        isSeniatAuditor,
        isStaff,
        canEditInventory,
        canManageTeam,
        canViewFinancials,
        canProcessRefunds,
        canCreateSales
    }
}
