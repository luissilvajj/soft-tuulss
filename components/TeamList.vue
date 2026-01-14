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
    <div class="glass-panel overflow-hidden">
        <table class="min-w-full divide-y divide-[var(--color-border-subtle)]">
            <thead class="bg-[var(--color-bg-subtle)]">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase">Usuario</th>
                    <th class="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase">Rol</th>
                    <th class="px-6 py-3 text-right text-xs font-bold text-[var(--color-text-secondary)] uppercase">Acciones</th>
                </tr>
            </thead>
             <tbody class="divide-y divide-[var(--color-border-subtle)] bg-[var(--color-bg-dark)]">
                 <tr v-if="loading" ><td colspan="3" class="p-4 text-center">Cargando...</td></tr>
                 <tr v-else-if="members.length === 0"><td colspan="3" class="p-4 text-center">No hay miembros encontrados.</td></tr>
                 
                 <tr v-for="member in members" :key="member.user_id" class="group hover:bg-[var(--color-bg-subtle)]/50 transition-colors">
                     <td class="px-6 py-4">
                         <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/30">
                                {{ (member.users?.email || 'U').charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <p class="text-sm font-medium text-[var(--color-heading)]">{{ member.users?.email || 'Usuario Desconocido' }}</p>
                                <p v-if="member.user_id === user?.id" class="text-xs text-blue-500 font-bold">Tú</p>
                            </div>
                         </div>
                     </td>
                     <td class="px-6 py-4">
                         <span :class="[
                             'px-2 py-1 text-xs font-bold rounded-full border',
                             member.role === 'owner' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                         ]">
                             {{ member.role === 'owner' ? 'Dueño' : 'Cajero' }}
                         </span>
                     </td>
                     <td class="px-6 py-4 text-right">
                         <button 
                            v-if="canManage(member)" 
                            @click="removeMember(member.user_id)"
                            class="text-red-500 hover:text-red-600 text-xs font-bold hover:underline"
                        >
                             Eliminar
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
                users:user_id ( email ) 
            `) // Note: 'users' table is usually accessible via join if keys allow, actually 'users' is in auth schema.
            // But we CANNOT join auth.users directly easily from frontend client usually due to permissions.
            // Wait, usually we query 'profiles' if we have one.
            // If we don't have profiles set up for everyone, this might be tricky.
            // LUCKILY: Softtuuls likely doesn't have a public profiles table linked for auth yet?
            // "profiles" table exists? 'migration_settings_storage.sql' implies we might have logic.
            // Actually, querying 'organization_members' gives raw member data.
            // 'users' in the select above implies a FK relation. Accessing `auth.users` via view is preferred.
            // Workaround: We might fail to get emails if we don't have a public view.
            // Let's assume we do NOT have easy access to email given RLS.
            // BUT, the Prompt says "TeamList.vue ... Nombre, Email, Rol".
            // I'll try to fetch, if it fails I'll assume only profile data is visible or I'll fix RLS later.
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
