import type { Client } from '~/types/models'
import type { Database } from '~/types/database.types'
import { useSupabaseClient, useState } from '#imports'
import { useOrganization } from './useOrganization'
import { useAuditLogs } from './useAuditLogs'

export interface ClientFilter {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortDesc?: boolean
}

export const useClients = () => {
    const client = useSupabaseClient<Database>()
    const { organization } = useOrganization()

    const loading = useState('clients_loading', () => false)
    const clients = useState<Client[]>('clients_list', () => [])
    const totalClients = useState('clients_total', () => 0)

    const fetchClients = async (filters: ClientFilter = {}) => {
        if (!organization.value?.id) return

        const page = filters.page || 1
        const limit = filters.limit || 20
        const search = filters.search || ''

        const from = (page - 1) * limit
        const to = from + limit - 1

        loading.value = true

        try {
            let query = client
                .from('clients')
                .select('*', { count: 'exact' })
                .eq('organization_id', organization.value.id)

            if (filters.sortBy) {
                 query = query.order(filters.sortBy, { ascending: !filters.sortDesc })
            } else {
                 query = query.order('created_at', { ascending: false })
            }
                
            query = query.range(from, to)

            if (search && search.length >= 2) {
                 query = query.or(`name.ilike.%${search}%,identity_document.ilike.%${search}%,email.ilike.%${search}%`)
            }

            const { data, count, error } = await query

            if (error) throw error
            clients.value = data as unknown as Client[]
            if (count !== null) totalClients.value = count
        } catch (e) {
            console.error('Error fetching clients:', e)
        } finally {
            loading.value = false
        }
    }

    const resetClientsState = () => {
        clients.value = []
        totalClients.value = 0
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

        await fetchClients()
    }

    const updateClient = async (id: string, clientData: Partial<Client>) => {
        const { error } = await client
            .from('clients')
            .update(clientData)
            .eq('id', id)

        if (error) throw error

        logAction('client_updated', { id, changes: clientData })

        await fetchClients()
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
        totalClients,
        loading,
        fetchClients,
        addClient,
        updateClient,
        deleteClient,
        resetClientsState
    }
}
