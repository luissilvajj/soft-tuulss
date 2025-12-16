export const useAuditLogs = () => {
    const client = useSupabaseClient()
    const user = useSupabaseUser()
    const { organization } = useOrganization()

    const logAction = async (action: string, details: any = {}) => {
        let userId = user.value?.id

        // Fallback: Try fetching user directly if state is empty
        if (!userId) {
            const { data } = await client.auth.getUser()
            userId = data.user?.id
        }

        if (!organization.value?.id || !userId) {
            console.warn('Cannot log action: Missing Org ID or User ID', { org: organization.value?.id, user: userId })
            return
        }

        try {
            const { error } = await client.from('audit_logs').insert({
                organization_id: organization.value.id,
                user_id: userId,
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
