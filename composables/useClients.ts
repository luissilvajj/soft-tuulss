import type { Client } from '~/types/models'

export const useClients = () => {
    const client = useSupabaseClient()
    const { organization } = useOrganization()

    const loading = useState('clients_loading', () => false)
    const clients = useState<Client[]>('clients_list', () => [])

    const fetchClients = async (force = false) => {
        if (!organization.value?.id) return

        if (clients.value.length === 0 || force) {
            loading.value = true
        }

        try {
            const { data, error } = await client
                .from('clients')
                .select('*')
                .eq('organization_id', organization.value.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            clients.value = data as unknown as Client[]
        } catch (e) {
            console.error('Error fetching clients:', e)
        } finally {
            loading.value = false
        }
    }

    const { logAction } = useAuditLogs()

    const addClient = async (clientData: Partial<Client>) => {
        if (!organization.value?.id) throw new Error('Organization not found')

        const { data, error } = await client.from('clients').insert({
            organization_id: organization.value.id,
            ...clientData
        }).select().single()

        if (error) throw error

        logAction('client_created', { name: clientData.name, email: clientData.email })

        await fetchClients(true)
    }

    const updateClient = async (id: string, clientData: Partial<Client>) => {
        const { error } = await client
            .from('clients')
            .update(clientData)
            .eq('id', id)

        if (error) throw error

        logAction('client_updated', { id, changes: clientData })

        await fetchClients(true)
    }

    const deleteClient = async (id: string) => {
        const clientToDelete = clients.value.find(c => c.id === id)

        const { error } = await client.from('clients').delete().eq('id', id)
        if (error) throw error

        logAction('client_deleted', { name: clientToDelete?.name || 'Desconocido', id })

        // Optimistic update
        clients.value = clients.value.filter(c => c.id !== id)
    }

    return {
        clients,
        loading,
        fetchClients,
        addClient,
        updateClient,
        deleteClient
    }
}
