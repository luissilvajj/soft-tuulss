<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight text-gradient mb-8">Configuración</h1>

    <div class="glass-panel p-0 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
      <!-- Sidebar / Tabs -->
      <div class="w-full md:w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 p-4">
        <nav class="space-y-1">
          <NuxtLink 
            to="/app/settings"
            :class="[
              (!route.path.includes('/billing') && (!route.query.tab || route.query.tab === 'general'))
                ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] font-bold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-white)]',
              'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all'
            ]"
          >
            <component :is="tabs[0].icon" class="w-5 h-5" />
            General
          </NuxtLink>
           <button 
             @click="router.push('/app/settings?tab=team')"
             :class="[
               route.query.tab === 'team'
                ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] font-bold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-white)]',
               'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all'
             ]"
           >
            <component :is="tabs[1].icon" class="w-5 h-5" />
            Equipo
          </button>
          <NuxtLink 
            to="/app/settings/billing"
            class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-white)] transition-all"
            active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] font-bold !text-[var(--color-accent-blue)]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Facturación
          </NuxtLink>
        </nav>
      </div>

      <!-- Content -->
      <div class="flex-1 p-4 md:p-8">
        <!-- GENERAL TAB -->
        <div v-if="currentTab === 'general'" class="max-w-xl">
          <h2 class="text-xl font-bold text-[var(--color-white)] mb-1">General</h2>
          <p class="text-sm text-[var(--color-text-secondary)] mb-6">Información básica de tu organización.</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Nombre de la Organización</label>
              <input v-model="generalForm.name" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] outline-none" placeholder="Velo Code">
            </div>
            
            <div class="pt-4 flex items-center gap-4">
               <button @click="updateOrgName" :disabled="loadingGeneral || !currentOrgId" class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center">
                 {{ loadingGeneral ? 'Guardando...' : 'Guardar Cambios' }}
               </button>
               <span v-if="!currentOrgId" class="text-xs text-yellow-500 flex items-center gap-1">
                  <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Cargando ID...
               </span>
            </div>
          </div>
        </div>

        <!-- TEAM TAB -->
        <div v-if="currentTab === 'team'">
           <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 class="text-xl font-bold text-[var(--color-white)] mb-1">Equipo</h2>
                <p class="text-sm text-[var(--color-text-secondary)]">Gestiona quien tiene acceso.</p>
              </div>
              <button @click="showInviteModal = true" class="btn btn-secondary text-xs px-3 py-2 w-full md:w-auto justify-center">
                 + Invitar Miembro
              </button>
           </div>

           <!-- Mobile Card View -->
           <div class="block md:hidden space-y-4">
              <div v-for="member in members" :key="member.user_id" class="bg-[var(--color-bg-subtle)] p-4 rounded-xl border border-[var(--color-border-subtle)] space-y-3">
                  <div class="flex items-center gap-3">
                     <div class="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white uppercase shadow-md">
                        {{ member.email?.charAt(0) || 'U' }}
                     </div>
                     <div class="flex-1 overflow-hidden">
                        <p class="text-sm font-medium text-[var(--color-white)] truncate">{{ member.email }}</p>
                        <span :class="[
                             member.role === 'owner' ? 'bg-purple-500/10 text-purple-400' : 
                             member.role === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400',
                             'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded'
                          ]">
                             {{ member.role }}
                        </span>
                     </div>
                  </div>
                  
                  <div v-if="canManageTeam && member.role !== 'owner'" class="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end">
                      <button 
                         @click="promoteUser(member)"
                         class="text-[var(--color-accent-blue)] text-xs font-bold px-3 py-1.5 bg-[var(--color-accent-blue)]/10 rounded-lg hover:bg-[var(--color-accent-blue)]/20 transition-colors"
                      >
                         {{ member.role === 'admin' ? 'Degradar a Miembro' : 'Promover a Admin' }}
                      </button>
                  </div>
              </div>
           </div>

           <!-- Desktop Table View -->
           <div class="hidden md:block overflow-hidden rounded-xl border border-[var(--color-border-subtle)]">
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
const user = useSupabaseUser()
const { organization, fetchOrganization } = useOrganization()
const { canManageTeam } = usePermissions()

const route = useRoute()
const router = useRouter()

// TABS 
// Sync Query Param to Tab state
const currentTab = ref('general')

watch(() => route.query.tab, (newTab) => {
    if (newTab === 'team') currentTab.value = 'team'
    else currentTab.value = 'general'
}, { immediate: true })

const tabs = [
  { id: 'general', name: 'General', icon: BuildingOfficeIcon },
  { id: 'team', name: 'Equipo', icon: UsersIcon }
]

// GENERAL
const generalForm = reactive({ name: '' })
const currentOrgId = ref(null) // Cache ID to avoid null errors if state flickers
const loadingGeneral = ref(false)

// Ensure we fetch org when user is ready (fixes hard reload issue)
watch(user, async (u) => {
    if (u) await fetchOrganization()
}, { immediate: true })

watch(() => organization.value, (newOrg) => {
   if (newOrg) {
      generalForm.name = newOrg.name
      currentOrgId.value = newOrg.id
   }
}, { immediate: true })

const updateOrgName = async () => {
   // Robust check: If we don't have the ID, try to fetch it one last time
   if (!currentOrgId.value) {
      if (organization.value?.id) {
          currentOrgId.value = organization.value.id
      } else {
          // Attempt Force Fetch
          await fetchOrganization(true)
          if (organization.value?.id) {
             currentOrgId.value = organization.value.id
          } else {
             alert('Error: No se ha detectado el ID de la organización. Por favor recarga la página.')
             return
          }
      }
   }

   loadingGeneral.value = true
   try {
      const { error } = await client.from('organizations')
         .update({ name: generalForm.name })
         .eq('id', currentOrgId.value)
      
      if (error) throw error
      await fetchOrganization(true) // Force refresh to update UI
      alert('Información guardada')
   } catch (e) {
      alert(e.message)
   } finally {
      loadingGeneral.value = false
   }
}

const ensureOrgId = async () => {
    // 1. Try Local State
    if (currentOrgId.value) return

    // 2. Try Global State
    if (organization.value?.id) {
        currentOrgId.value = organization.value.id
        generalForm.name = organization.value.name
        return
    }

    // 3. RAW DB FALLBACK (The "Ipso Facto" fix)
    console.log('Orphaned State detected. Executing RAW recovery...')
    const { data, error } = await client
        .from('organization_members')
        .select(`
            organization:organizations ( id, name, subscription_status ),
            role
        `)
        .eq('user_id', user.value?.id)
        .limit(1)
        .maybeSingle()
    
    if (data && data.organization) {
        console.log('Recovery Successful:', data.organization)
        // Update Local
        currentOrgId.value = data.organization.id
        generalForm.name = data.organization.name
        
        // Update Global (optimistic)
        organization.value = {
            ...data.organization,
            role: data.role
        }
    } else {
        console.error('Recovery Failed:', error)
    }
}

// TEAM
const members = ref([])
const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviting = ref(false)

const fetchMembers = async () => {
   const orgId = currentOrgId.value || organization.value?.id
   
   if (!orgId) {
       console.warn('fetchMembers: No ID available yet.')
       return
   }

   console.log('Fetching members for Org:', orgId)
   
   const { data, error } = await client.from('organization_members')
      .select(`
         user_id,
         role,
         profile:profiles ( email, full_name )
      `)
      .eq('organization_id', orgId)
   
   if (error) {
       console.error('Error fetching members:', error)
       return
   }
   
   if (data) {
      members.value = data.map(m => ({
         user_id: m.user_id,
         role: m.role,
         email: m.profile?.email || 'Unknown' 
      }))
   }
}

const inviteUser = async () => {
   inviting.value = true
   try {
      console.log('--- INVITE START ---')
      let orgId = currentOrgId.value || organization.value?.id
      console.log('Initial Org ID check:', orgId)
      
      // FALLBACK: If ID is missing, try to fetch it from server
      if (!orgId) {
         console.warn('ID missing. Attempting force fetch...')
         await fetchOrganization(true)
         orgId = organization.value?.id // Re-check global state
         console.log('Org ID after fetch:', orgId)
         
         // Update local cache if found
         if (orgId) currentOrgId.value = orgId
      }

      // LAST RESORT: Direct Query bypassing useOrganization composable
      if (!orgId && user.value?.id) {
          console.warn('State failed. Attempting RAW query...')
          const { data: rawData, error: rawError } = await client
              .from('organization_members')
              .select('organization_id')
              .eq('user_id', user.value.id)
              .limit(1)
              .maybeSingle()
          
          if (!rawError && rawData) {
              console.log('RAW Query Success:', rawData)
              orgId = rawData.organization_id
              currentOrgId.value = orgId // Cache it
          } else {
              console.error('RAW Query Failed:', rawError)
          }
      }

      if (!orgId) {
         const u = useSupabaseUser()
         console.error('CRITICAL: Organization still missing after ALL attempts.')
         console.error('User:', u.value)
         console.error('Org State:', organization.value)
         throw new Error('No se pudo detectar la organización (Error DB). Por favor contacta soporte.')
      }

      console.log('Sending RPC to p_org_id:', orgId)
      const { data, error } = await client.rpc('add_team_member', {
         p_org_id: orgId,
         p_email: inviteEmail.value
      })
      
      if (error) {
         console.error('RPC Error:', error)
         throw error
      }
      
      console.log('Invite Success')
      alert('Usuario agregado correctamente!')
      showInviteModal.value = false
      inviteEmail.value = ''
      await fetchMembers()
   } catch (e) {
      console.error('Invite Exception:', e)
      alert('Error: ' + e.message)
   } finally {
      inviting.value = false
      console.log('--- INVITE END ---')
   }
}

const promoteUser = async (member) => {
   if (!confirm('¿Estás seguro de cambiar el rol de este usuario?')) return
   
   const newRole = member.role === 'admin' ? 'member' : 'admin'
   try {
        const { error } = await client.from('organization_members')
            .update({ role: newRole })
            .eq('organization_id', currentOrgId.value || organization.value?.id)
            .eq('user_id', member.user_id)

        if (error) throw error
        fetchMembers()
   } catch (e) {
        alert(e.message)
   }
}

onMounted(async () => {
    await ensureOrgId()
    await fetchOrganization()
    fetchMembers()
})

</script>
