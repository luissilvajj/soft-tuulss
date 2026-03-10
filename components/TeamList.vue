<template>
  <div class="space-y-6">
    <!-- Header & Invite -->
    <div class="flex justify-between items-center bg-[var(--color-bg-subtle)] p-4 rounded-xl border border-[var(--color-border-subtle)]">
        <div>
            <h3 class="font-bold text-[var(--color-heading)]">Miembros del Equipo</h3>
            <p class="text-sm text-[var(--color-text-secondary)]">Gestiona el acceso a tu organización.</p>
        </div>
        <button @click="showInviteModal = true" class="btn btn-primary text-sm px-4 py-2">
            Invitar Miembro
        </button>
    </div>

    <!-- Members List -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
             <tbody class="bg-white divide-y divide-gray-200">
                 <tr v-if="loading" ><td colspan="3" class="p-8 text-center text-sm text-gray-500">Cargando miembros...</td></tr>
                 <tr v-else-if="members.length === 0">
                    <td colspan="3" class="py-12 text-center text-gray-400">
                        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                             <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <p class="text-sm font-medium text-gray-500">No hay miembros</p>
                        <p class="text-xs text-gray-400 mt-1">Invita a tu equipo para colaborar</p>
                    </td>
                 </tr>
                 
                 <tr v-for="member in members" :key="member.user_id" class="group hover:bg-gray-50 transition-colors">
                     <td class="px-6 py-4 whitespace-nowrap">
                         <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs ring-1 ring-primary-100">
                                {{ (member.profiles?.full_name || 'U').charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ member.profiles?.full_name || 'Miembro del Equipo' }}</p>
                                <p v-if="member.user_id === user?.id" class="text-xs text-primary-600 font-bold">Tú</p>
                            </div>
                         </div>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap">
                         <span :class="[
                             'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                             member.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                         ]">
                             {{ member.role === 'owner' ? 'Dueño' : 'Cajero' }}
                         </span>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button 
                            v-if="canManage(member)" 
                            @click="removeMember(member.user_id)"
                            class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Eliminar miembro"
                        >
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                         </button>
                     </td>
                 </tr>
             </tbody>
        </table>
    </div>

    <!-- Invite Modal -->
    <AppModal :show="showInviteModal" title="Invitar Miembro" @close="showInviteModal = false">
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">Email</label>
                <input v-model="inviteForm.email" type="email" class="input-std" placeholder="correo@ejemplo.com">
            </div>
            <div>
                <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-1">Rol</label>
                <select v-model="inviteForm.role" class="input-std bg-[var(--color-bg-dark)]">
                    <option value="cashier">Cajero (Ventas e Inventario)</option>
                    <option value="owner">Dueño (Acceso Total)</option>
                </select>
            </div>
        </div>
        <template #actions>
            <button @click="sendInvite" class="btn btn-primary" :disabled="inviting">
                {{ inviting ? 'Enviando...' : 'Enviar Invitación' }}
            </button>
        </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from "vue-toastification"

const { organization } = useOrganization()
const client = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const showInviteModal = ref(false)
const inviting = ref(false)
const loading = ref(true)
const members = ref<any[]>([])

const inviteForm = ref({ email: '', role: 'cashier' })

// --- Fetch Members ---
const fetchMembers = async () => {
    if (!organization.value?.id) return
    loading.value = true
    try {
        const { data, error } = await client
            .from('organization_members')
            .select(`
                user_id, 
                role,
                profiles:user_id ( full_name ) 
            `)
            .eq('organization_id', organization.value.id)
        
        if (error) throw error
        members.value = data
    } catch (e: any) {
        console.error('Error fetching members', e)
        // toast.error('Error cargando miembros')
    } finally {
        loading.value = false
    }
}

// --- Permissions ---
const canManage = (member: any) => {
    const myRole = organization.value?.role
    // Only owners can delete. Can't delete yourself.
    if (myRole !== 'owner') return false
    if (member.user_id === user.value?.id) return false
    return true
}

// --- Actions ---
const sendInvite = async () => {
    if (!inviteForm.value.email) return
    inviting.value = true
    try {
        const { data, error } = await client.functions.invoke('invite-member', {
            body: { 
                email: inviteForm.value.email, 
                role: inviteForm.value.role,
                organization_id: organization.value?.id
            }
        })
        
        if (error) throw error
        if (data.error) throw new Error(data.error)

        toast.success(`Invitación enviada a ${inviteForm.value.email}`)
        showInviteModal.value = false
        inviteForm.value = { email: '', role: 'cashier' }
        fetchMembers() // Refresh
    } catch (e: any) {
        toast.error(e.message)
    } finally {
        inviting.value = false
    }
}

const removeMember = async (userId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este miembro? Perderá acceso inmediato.')) return
    try {
        const { error } = await client
            .from('organization_members')
            .delete()
            .eq('organization_id', organization.value?.id)
            .eq('user_id', userId)
        
        if (error) throw error
        toast.success('Miembro eliminado')
        fetchMembers()
    } catch (e: any) {
        toast.error(e.message)
    }
}

onMounted(() => {
    fetchMembers()
})
</script>

<style scoped>
.input-std {
    @apply w-full px-4 py-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-blue)] outline-none transition-all;
}
</style>
