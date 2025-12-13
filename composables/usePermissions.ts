import { useOrganization } from './useOrganization'

export const usePermissions = () => {
    const { organization } = useOrganization()

    const isAdmin = computed(() => {
        // MVP: Allow 'member' to act as admin, or check if role exists at all.
        // This fixes the issue where users might default to 'member' and get locked out.
        return !!organization.value?.role
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
