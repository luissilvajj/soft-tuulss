<template>
  <div class="space-y-6">
    <!-- Header & Invite -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-ground p-6 rounded-2xl border border-surface-border shadow-sm gap-4">
        <div>
            <h3 class="text-xl font-extrabold text-text-heading tracking-tight">Miembros del Equipo</h3>
            <p class="text-sm text-text-secondary mt-1">Gestiona el acceso y los permisos a tu organización.</p>
        </div>
        <button @click="showInviteModal = true" class="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-colors">
            Invitar Miembro
        </button>
    </div>

    <!-- Members List -->
    <div class="bg-surface-ground border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-surface-border">
            <thead class="bg-surface-subtle">
                <tr>
                    <th class="px-6 py-4 text-left text-xs font-extrabold text-text-secondary uppercase tracking-widest">Usuario</th>
                    <th class="px-6 py-4 text-left text-xs font-extrabold text-text-secondary uppercase tracking-widest">Rol</th>
                    <th class="px-6 py-4 text-right text-xs font-extrabold text-text-secondary uppercase tracking-widest">Acciones</th>
                </tr>
            </thead>
             <tbody class="divide-y divide-surface-border">
                 <tr v-if="loading" ><td colspan="3" class="p-8 text-center text-sm text-text-secondary italic">Cargando miembros...</td></tr>
                 <tr v-else-if="members.length === 0">
                    <td colspan="3" class="py-12 text-center text-text-secondary">
                        <div class="w-16 h-16 bg-surface-subtle rounded-full flex items-center justify-center mx-auto mb-4 border border-surface-border">
                             <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <p class="text-sm font-bold text-text-heading">No hay miembros</p>
                        <p class="text-xs mt-1">Invita a tu equipo para colaborar</p>
                    </td>
                 </tr>
                 
                 <tr v-for="member in members" :key="member.user_id" class="group hover:bg-surface-subtle/50 transition-colors">
                     <td class="px-6 py-4 whitespace-nowrap">
                         <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold shadow-inner">
                                {{ (member.profiles?.full_name || 'U').charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-text-heading">{{ member.profiles?.full_name || 'Miembro del Equipo' }}</p>
                                <p v-if="member.user_id === user?.id" class="text-[10px] text-primary-500 font-extrabold uppercase mt-0.5 tracking-widest">Tú</p>
                            </div>
                         </div>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap">
                         <span :class="[
                             'inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold shadow-sm',
                             member.role === 'owner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                         ]">
                             {{ member.role === 'owner' ? 'Dueño' : 'Cajero' }}
                         </span>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button 
                            v-if="canManage(member)" 
                            @click="removeMember(member.user_id)"
                            class="text-text-secondary hover:text-status-error transition-colors p-2 rounded-xl hover:bg-status-error/10"
                            title="Eliminar miembro"
                        >
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                         </button>
                     </td>
                 </tr>
             </tbody>
        </table>
    </div>

    <!-- Invite Modal -->
    <AppModal :show="showInviteModal" title="Invitar Miembro" description="Agrega un colaborador a tu equipo." @close="showInviteModal = false">
        <div class="space-y-4">
            <div>
                <label class="block text-xs uppercase tracking-widest font-extrabold text-text-secondary mb-2">Email del Usuario</label>
                <input v-model="inviteForm.email" type="email" class="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-ground text-text-heading focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="correo@ejemplo.com">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-widest font-extrabold text-text-secondary mb-2">Rol de Acceso</label>
                <select v-model="inviteForm.role" class="w-full px-4 py-3 rounded-xl border border-surface-border bg-surface-ground text-text-heading focus:ring-2 focus:ring-primary-500 outline-none transition-all">
                    <option value="cashier">Cajero (Ventas e Inventario)</option>
                    <option value="owner">Dueño (Acceso Total)</option>
                </select>
            </div>
        </div>
        <template #actions>
            <button @click="sendInvite" class="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :disabled="inviting">
                {{ inviting ? 'Enviando...' : 'Enviar Invitación' }}
            </button>
        </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from "vue-toastification"
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { ref, onMounted } from 'vue'

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
        const response = await $fetch('/api/invite', {
            method: 'POST',
            body: { 
                email: inviteForm.value.email, 
                role: inviteForm.value.role,
                orgId: organization.value?.id
            }
        })
        
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
/* Elimina input-std ya que ahora se aplican utility classes */
</style>
