<template>
  <div class="min-h-screen bg-[var(--color-bg-dark)] flex font-sans transition-colors duration-300">
    <!-- Sidebar -->
    <aside class="w-64 bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--color-border-subtle)] flex flex-col fixed h-full z-20 transition-colors duration-300">
      <div class="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)]">
        <span class="text-xl font-bold text-[var(--color-white)] flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)]"></div>
          Soft Tuuls
        </span>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        <NuxtLink to="/app" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path === '/app' ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          Dashboard
        </NuxtLink>
        <NuxtLink to="/app/inventory" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('inventory') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          Inventario
        </NuxtLink>
        <NuxtLink to="/app/sales" class="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('sales') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Ventas
        </NuxtLink>
        <NuxtLink to="/app/clients" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('clients') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          Clientes
        </NuxtLink>
        <NuxtLink to="/app/settings" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('settings') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           Configuración
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-[var(--color-border-subtle)]">
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-accent-blue)] font-bold text-xs border border-[var(--color-border-subtle)] shadow-sm">
            {{ (userName || orgName || 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-[var(--color-white)] truncate">{{ userName || 'Usuario' }}</p>
            <p class="text-xs text-[var(--color-text-secondary)] font-medium truncate tracking-wide">{{ orgName }}</p>
          </div>
        </div>
        <button @click="logout" class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border-subtle)] text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-white)] transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-64 p-8 transition-colors duration-300">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { organization, fetchOrganization } = useOrganization()
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const orgName = ref(organization.value?.name || 'Mi Organización')
const userRole = ref(organization.value?.role || 'Usuario')
const userName = ref(user.value?.user_metadata?.full_name || '')

// Watch for changes if standard hydration works
watch(() => organization.value, (newOrg) => {
    if (newOrg) {
        orgName.value = newOrg.name
        userRole.value = newOrg.role
    }
})

// RECOVERY LOGIC
const ensureGlobalState = async (userId) => {
    if (!userId) {
        console.error('RecoverGlobalState: Missing User ID')
        return
    }
    console.log('Dashboard: Attempting Global State Recovery...')
    
    // 1. Recover Organization
    if (!organization.value) {
        const { data: orgData } = await client
            .from('organization_members')
            .select(`
                organization:organizations ( id, name ),
                role
            `)
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle()
        
        if (orgData && orgData.organization) {
            console.log('Dashboard: Organization Recovered', orgData.organization)
            orgName.value = orgData.organization.name
            userRole.value = orgData.role || 'Usuario'
            // Hydrate global state for others
            organization.value = {
                ...orgData.organization,
                role: orgData.role
            }
        }
    }

    // 2. Recover User Profile (Name)
    // First try metadata (fastest)
    if (!userName.value && user.value?.user_metadata?.full_name) {
       userName.value = user.value.user_metadata.full_name
    }

    // Then try DB if still empty
    if (!userName.value) {
      const { data: profile } = await client
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single()
      
      if (profile) {
          console.log('Dashboard: Profile Recovered', profile)
          userName.value = profile.full_name || 'Usuario'
      }
    }
}

// Ensure org is loaded
onMounted(async () => {
  // 1. Get Session directly (Most robust way)
  const { data: { session } } = await client.auth.getSession()
  
  if (!session?.user) {
      console.warn('Dashboard: No active session. Redirecting.')
      return router.push('/login')
  }

  const userId = session.user.id
  console.log('Dashboard: Session confirmed for user', userId)

  // 2. EXECUTE RECOVERY (Ipso Facto) using confirmed ID
  await ensureGlobalState(userId)

  // 3. Standard Fetch (for redundancy)
  if (!organization.value) {
     await fetchOrganization()
  }
})

const logout = async () => {
  await client.auth.signOut()
  router.push('/login')
}
</script>
