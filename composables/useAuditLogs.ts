export const useAuditLogs = () => {
    const client = useSupabaseClient()
    const user = useSupabaseUser()
    const { organization } = useOrganization()

    const logAction = async (action: string, details: any = {}) => {
        if (!organization.value?.id || !user.value?.id) {
            console.warn('Cannot log action: Missing Org ID or User ID', { org: organization.value?.id, user: user.value?.id })
            return
        }

        try {
            const { error } = await client.from('audit_logs').insert({
                organization_id: organization.value.id,
                user_id: user.value.id,
                action,
                details
            })

            if (error) {
                console.error('Error creating audit log:', error)
            } else {
                console.log('Audit Log Created:', action)
            }
        } catch (e) {
            console.error('Exception creating audit log:', e)
        }
    }

    return {
        logAction
    }
}
