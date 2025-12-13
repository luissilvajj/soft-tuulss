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
        <NuxtLink to="/app/sales" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('sales') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Ventas
        </NuxtLink>
        <NuxtLink to="/app/sales" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('sales') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Movimientos
        </NuxtLink>
        <NuxtLink to="/app/clients" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200" active-class="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(0,113,227,0.15)]" :class="$route.path.includes('clients') ? '' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)]'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          Clientes
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-[var(--color-border-subtle)]">
        <div class="flex items-center gap-3 mb-4 px-2">
          <div class="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-accent-blue)] font-bold text-xs border border-[var(--color-border-subtle)] shadow-sm">
            {{ orgName.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-[var(--color-white)] truncate">{{ orgName }}</p>
            <p class="text-xs text-[var(--color-text-secondary)] font-medium truncate uppercase tracking-wider">{{ userRole }}</p>
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
const router = useRouter()

const orgName = computed(() => organization.value?.name || 'Mi Organización')
const userRole = computed(() => organization.value?.role || 'Usuario')

// Ensure org is loaded
// Ensure org is loaded
onMounted(async () => {
  // Wait for user to be available to avoid race conditions
  // 1. Wait for User Hydration
  const user = useSupabaseUser()
  if (!user.value) {
     let attempts = 0
     while (!user.value && attempts < 20) {
        await new Promise(r => setTimeout(r, 100))
        attempts++
     }
  }

  // 2. Auth Check: If still no user, Session is invalid -> Go to Login
  if (!user.value) {
      console.warn('Dashboard: No user session found. Redirecting to login.')
      return router.push('/login')
  }

  // 3. Org Check
  const org = await fetchOrganization()
  
  // 4. Safe Mode: Do not auto-redirect to onboarding. 
  // Let the UI handle the Empty State (which we already have in inventory.vue, and we can add here if needed).
  if (!org) {
      console.warn('Dashboard: User logged in but no Organization found.')
      // logic handles empty state in the template
  }
})

const logout = async () => {
  await client.auth.signOut()
  router.push('/login')
}
</script>
