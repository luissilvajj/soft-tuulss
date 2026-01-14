<template>
  <div class="min-h-screen bg-[var(--color-bg-dark)] flex font-sans transition-colors duration-300">
    <SubscriptionWarning />
    
    <!-- Mobile Header -->
    <div class="md:hidden fixed top-0 w-full z-30 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--color-border-subtle)] h-16 flex items-center justify-between px-4">
        <span class="text-lg font-bold text-[var(--color-white)] flex items-center gap-2">
          <div class="w-5 h-5 rounded bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)]"></div>
          Soft Tuuls
        </span>
        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-[var(--color-text-secondary)] hover:text-[var(--color-white)]">
            <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    </div>

    <!-- Mobile Overlay -->
    <div 
        v-if="isMobileMenuOpen" 
        class="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
        @click="isMobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside 
        :class="[
            'w-64 bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--color-border-subtle)] flex flex-col fixed h-full z-40 transition-transform duration-300 md:translate-x-0',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
    >
      <div class="h-16 flex items-center px-4 border-b border-[var(--color-border-subtle)] md:flex hidden relative z-50">
        <OrgSwitcher />
      </div>
      
      <!-- Mobile Logo in Menu (Optional or just spacer) -->
       <div class="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)] md:hidden">
         <span class="text-lg font-bold text-[var(--color-white)]">Menú</span>
       </div>

      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NuxtLink id="tour-dashboard-link" @click="isMobileMenuOpen = false" to="/app" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path === '/app' ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          Dashboard
        </NuxtLink>
        <NuxtLink id="tour-inventory-link" @click="isMobileMenuOpen = false" to="/app/inventory" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('inventory') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          Inventario
        </NuxtLink>
        <NuxtLink id="tour-sales-link" @click="isMobileMenuOpen = false" to="/app/sales" class="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('sales') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Ventas
        </NuxtLink>
        <NuxtLink id="tour-transactions-link" @click="isMobileMenuOpen = false" to="/app/transactions" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('transactions') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Movimientos
        </NuxtLink>
        <NuxtLink id="tour-clients-link" @click="isMobileMenuOpen = false" to="/app/clients" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('clients') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          Clientes
        </NuxtLink>

        <!-- Reportes -->
        <NuxtLink id="tour-reports-link" @click="isMobileMenuOpen = false" to="/app/reports" :class="[$route.path === '/app/reports' ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]', 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200']">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
           Reportes
        </NuxtLink>

        <!-- AI Analyst -->
        <NuxtLink to="/app/reports/ai-analyst" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden" active-class="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-[var(--color-white)] border border-emerald-500/20" :class="$route.path.includes('ai-analyst') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
           <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
           <span class="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 font-extrabold group-hover:text-white transition-colors">AI Analyst</span>
           <span class="absolute right-2 top-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </NuxtLink>

        <NuxtLink id="tour-settings-link" @click="isMobileMenuOpen = false" to="/app/settings" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('settings') && !$route.path.includes('audit') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
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

    <!-- Main Content (Added padding-bottom for mobile nav) -->
    <main class="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 transition-colors duration-300">
      <slot />
    </main>

    <!-- Mobile Bottom Navigation (Fixed) -->
    <div class="md:hidden fixed bottom-0 left-0 w-full bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--color-border-subtle)] z-50 pb-safe">
        <div class="grid grid-cols-5 h-16 items-center">
            <!-- Alert: Using grid-cols-5 to include 'AI' in the center or 'More' at end -->
            
            <NuxtLink to="/app" active-class="text-[var(--color-accent-blue)]" class="flex flex-col items-center justify-center gap-1 text-[var(--color-text-secondary)]">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span class="text-[10px] font-bold">Inicio</span>
            </NuxtLink>

            <NuxtLink to="/app/sales" active-class="text-[var(--color-accent-blue)]" class="flex flex-col items-center justify-center gap-1 text-[var(--color-text-secondary)]">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="text-[10px] font-bold">Ventas</span>
            </NuxtLink>

            <!-- Center Action Button (New Sale) -->
            <div class="relative -top-5">
                 <NuxtLink to="/app/sales/new" class="flex items-center justify-center w-14 h-14 bg-[var(--color-accent-blue)] rounded-full shadow-lg shadow-blue-500/40 text-white transform hover:scale-105 transition-all">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                 </NuxtLink>
            </div>

            <NuxtLink to="/app/inventory" active-class="text-[var(--color-accent-blue)]" class="flex flex-col items-center justify-center gap-1 text-[var(--color-text-secondary)]">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                <span class="text-[10px] font-bold">Stock</span>
            </NuxtLink>

            <!-- Menu / More (Triggers Sidebar) -->
            <button @click="isMobileMenuOpen = true" class="flex flex-col items-center justify-center gap-1 text-[var(--color-text-secondary)]">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                 <span class="text-[10px] font-bold">Menú</span>
            </button>
        </div>
    </div>
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
const isMobileMenuOpen = ref(false)

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
    // console.log('Dashboard: Attempting Global State Recovery...')
    
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
            // console.log('Dashboard: Organization Recovered', orgData.organization)
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
          // console.log('Dashboard: Profile Recovered', profile)
          userName.value = profile.full_name || 'Usuario'
      }
    }
}

// Ensure org is loaded
onMounted(async () => {
    // 1. Get Session directly
    const { data: { session } } = await client.auth.getSession()
    if (!session?.user) return // Let middleware handle redirect if needed

    const userId = session.user.id
    await ensureGlobalState(userId)

    if (!organization.value) await fetchOrganization()
})

const logout = async () => {
  try {
    await client.auth.signOut()
  } catch (e) {
    console.warn('Logout warning:', e)
  } finally {
    window.location.href = '/login'
  }
}
</script>

<style scoped>
/* Safe Area for iPhones with Home Bar */
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
