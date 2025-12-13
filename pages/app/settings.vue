<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight text-gradient mb-8">Configuración</h1>

    <div class="glass-panel p-0 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
      <!-- Sidebar / Tabs -->
      <div class="w-full md:w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 p-4">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="[
              currentTab === tab.id
                ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] font-bold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-white)]',
              'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all'
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="flex-1 p-8">
        <!-- GENERAL TAB -->
        <div v-if="currentTab === 'general'" class="max-w-xl">
          <h2 class="text-xl font-bold text-[var(--color-white)] mb-1">General</h2>
          <p class="text-sm text-[var(--color-text-secondary)] mb-6">Información básica de tu organización.</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Nombre de la Organización</label>
              <input v-model="generalForm.name" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] outline-none" placeholder="Velo Code">
            </div>
            
            <div class="pt-4">
               <button @click="updateOrgName" :disabled="loadingGeneral" class="btn btn-primary">
                 {{ loadingGeneral ? 'Guardando...' : 'Guardar Cambios' }}
               </button>
            </div>
          </div>
        </div>

        <!-- TEAM TAB -->
        <div v-if="currentTab === 'team'">
           <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-[var(--color-white)] mb-1">Equipo</h2>
                <p class="text-sm text-[var(--color-text-secondary)]">Gestiona quien tiene acceso.</p>
              </div>
              <button @click="showInviteModal = true" class="btn btn-secondary text-xs px-3 py-2">
                 + Invitar Miembro
              </button>
           </div>

           <div class="overflow-hidden rounded-xl border border-[var(--color-border-subtle)]">
              <table class="min-w-full divide-y divide-[var(--color-border-subtle)]">
                <thead class="bg-[var(--color-bg-dark)]">
                   <tr>
                      <th class="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase">Usuario</th>
                      <th class="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase">Rol</th>
                      <th class="px-6 py-3 text-right text-xs font-bold text-[var(--color-text-secondary)] uppercase">Acciones</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)] bg-[var(--glass-bg)]">
                   <tr v-for="member in members" :key="member.user_id" class="hover:bg-[var(--color-bg-subtle)]/50">
                      <td class="px-6 py-4 whitespace-nowrap">
                         <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                               {{ member.email?.charAt(0) || 'U' }}
                            </div>
                            <div class="ml-3">
                               <p class="text-sm font-medium text-[var(--color-white)]">{{ member.email }}</p>
                            </div>
                         </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                         <span :class="[
                            member.role === 'owner' ? 'bg-purple-500/10 text-purple-400' : 
                            member.role === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400',
                            'px-2 py-1 text-xs font-bold rounded-md uppercase'
                         ]">
                            {{ member.role }}
                         </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                         <!-- Only show edit if not self and (I am owner OR I am admin editing member) -->
                         <button 
                            v-if="canManageTeam && member.role !== 'owner'" 
                            @click="promoteUser(member)"
                            class="text-[var(--color-accent-blue)] hover:underline text-xs"
                         >
                            {{ member.role === 'admin' ? 'Degradar a Miembro' : 'Hacer Admin' }}
                         </button>
                      </td>
                   </tr>
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <AppModal :show="showInviteModal" @close="showInviteModal = false" title="Invitar Miembro" description="El usuario debe estar registrado en la app previamente.">
        <div class="space-y-4">
           <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Correo Electrónico</label>
              <input v-model="inviteEmail" type="email" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] outline-none" placeholder="usuario@ejemplo.com">
           </div>
           
           <div class="flex justify-end gap-3 pt-4">
              <button @click="showInviteModal = false" class="btn btn-secondary">Cancelar</button>
              <button @click="inviteUser" :disabled="inviting" class="btn btn-primary">
                 {{ inviting ? 'Enviando...' : 'Enviar Invitación' }}
              </button>
           </div>
        </div>
    </AppModal>
  </div>
</template>

<script setup>
// Simple Icon Components to update
const BuildingOfficeIcon = h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011 1v4a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h2' })
])
const UsersIcon = h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 2 }, [
   h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])

import { usePermissions } from '~/composables/usePermissions'

definePageMeta({
  layout: 'dashboard'
})

const client = useSupabaseClient()
const { organization, fetchOrganization } = useOrganization()
const { canManageTeam } = usePermissions()

// TABS
const currentTab = ref('general')
const tabs = [
  { id: 'general', name: 'General', icon: BuildingOfficeIcon },
  { id: 'team', name: 'Equipo', icon: UsersIcon }
]

// GENERAL
const generalForm = reactive({ name: '' })
const loadingGeneral = ref(false)

watch(() => organization.value, (newOrg) => {
   if (newOrg) generalForm.name = newOrg.name
}, { immediate: true })

const updateOrgName = async () => {
   loadingGeneral.value = true
   try {
      const { error } = await client.from('organizations')
         .update({ name: generalForm.name })
         .eq('id', organization.value.id)
      
      if (error) throw error
      await fetchOrganization(true) // Force refresh
      alert('Información guardada')
   } catch (e) {
      alert(e.message)
   } finally {
      loadingGeneral.value = false
   }
}

// TEAM
const members = ref([])
const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviting = ref(false)

const fetchMembers = async () => {
   if (!organization.value) return
   // We need to join with profiles or auth.users?
   // Since auth.users is not accessible directly from client easily without a view, 
   // we heavily rely on the fact that if we use the 'profiles' table it would work
   // BUT earlier in `db/schema.sql` I saw `profiles` table. Let's use it.
   // Wait, `organization_members` has `user_id`.
   
   const { data, error } = await client.from('organization_members')
      .select(`
         user_id,
         role,
         profile:profiles ( email, full_name )
      `)
      .eq('organization_id', organization.value.id)
   
   if (data) {
      members.value = data.map(m => ({
         user_id: m.user_id,
         role: m.role,
         email: m.profile?.email || 'Unknown' // Assuming profiles has email synced or we use a view
      }))
   }
}

const inviteUser = async () => {
   inviting.value = true
   try {
      const { data, error } = await client.rpc('add_team_member', {
         p_org_id: organization.value.id,
         p_email: inviteEmail.value
      })
      if (error) throw error
      alert('Usuario agregado correctamente!')
      showInviteModal.value = false
      inviteEmail.value = ''
      fetchMembers()
   } catch (e) {
      alert('Error: ' + e.message)
   } finally {
      inviting.value = false
   }
}

const promoteUser = async (member) => {
   if (!confirm('¿Estás seguro de cambiar el rol de este usuario?')) return
   
   const newRole = member.role === 'admin' ? 'member' : 'admin'
   try {
        const { error } = await client.from('organization_members')
            .update({ role: newRole })
            .eq('organization_id', organization.value.id)
            .eq('user_id', member.user_id)

        if (error) throw error
        fetchMembers()
   } catch (e) {
        alert(e.message)
   }
}

onMounted(() => {
    fetchOrganization()
    fetchMembers()
})
</script>
