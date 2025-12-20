<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)] transition-colors duration-300 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    
    <!-- Background Ambience -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-accent-blue)]/20 rounded-full blur-[120px] -z-10"></div>
    <div class="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--color-accent-violet)]/10 rounded-full blur-[100px] -z-10"></div>

    <div class="max-w-md w-full space-y-8 relative z-10 animate-fade-in-up">
      <!-- Header -->
      <div class="text-center">
         <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-8 transform hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
         </div>
        <h2 class="text-4xl font-extrabold text-gradient tracking-tight">Crea tu Organización</h2>
        <p class="mt-4 text-[var(--color-text-secondary)]">
          Dale un nombre a tu espacio de trabajo para empezar a gestionar.
        </p>
      </div>

      <!-- Card -->
      <div class="glass-panel p-8 shadow-2xl relative overflow-hidden">
        <form class="space-y-6" @submit.prevent="createOrganization">
          <div>
            <label for="orgName" class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Nombre de la Organización</label>
            <div class="relative">
              <input id="orgName" v-model="orgName" name="orgName" type="text" required placeholder="Ej. Startup Innovadora" class="appearance-none block w-full px-4 py-4 border border-[var(--color-border-subtle)] rounded-xl shadow-sm placeholder-[var(--color-text-secondary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent bg-[var(--color-bg-subtle)]/50 text-[var(--color-white)] font-medium transition-all" />
            </div>
            <p class="mt-3 text-xs text-[var(--color-text-secondary)]">
               Podrás cambiarlo o crear más organizaciones después.
            </p>
          </div>

          <div>
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] hover:from-indigo-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]">
               <span v-if="loading" class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Configurando...
               </span>
               <span v-else>Crear Espacio de Trabajo</span>
            </button>
          </div>
        </form>
        
        <div v-if="errorMsg" class="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-pulse">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-bold text-red-500">{{ errorMsg }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Section Removed -->
  </div>
</template>

<script setup>
definePageMeta({
  layout: false // Full screen
})
useAuthGuard()

const client = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()
const { fetchOrganization, organization } = useOrganization()

const orgName = ref('')
const loading = ref(false)
const errorMsg = ref('')

const forceBypass = async () => {
    // Attempt to hydrate user first
    const { data } = await client.auth.getSession()
    if (data.session) {
        user.value = data.session.user
    }
    
    organization.value = { id: 'override', name: 'Emergency Access', role: 'owner' }
    router.push('/app')
}

onMounted(async () => {
   loading.value = true
   try {
      // 0. FORCE SESSION HYDRATION
      console.log('Onboarding: Hydrating Session...')
      const { data } = await client.auth.getSession()
      
      if (!data.session) {
          console.log('No session found. Redirecting to login.')
          return router.push('/login')
      }

      // Manually update the composable state if empty
      if (!user.value) {
          console.log('User composable was empty. Updating from session.')
          user.value = data.session.user
      }

      console.log('User ID:', user.value.id)

      // 1. Try to CLAIM invites
      console.log('Onboarding: Checking invites...')
      const { error: claimError } = await client.rpc('claim_invites')
      if (claimError) console.error('Error claiming invites:', claimError)

      // 2. Fetch Organization
      console.log('Onboarding: Fetching Org...')
      await fetchOrganization(true)
      console.log('Onboarding: Org Result:', organization.value)

      // 3. If User has an Org, Redirect to App
      if (organization.value) {
         console.log('Redirecting to app...')
         router.push('/app')
      }
   } catch (e) {
      console.error('Onboarding Exception:', e)
      errorMsg.value = e.message
   } finally {
      loading.value = false
   }
})

const createOrganization = async () => {
  if (!orgName.value.trim()) return

  try {
    loading.value = true
    errorMsg.value = ''
    
    // Call the database function we created in schema.sql
    const { data, error } = await client.rpc('create_org_for_user', {
      org_name: orgName.value
    })

    if (error) throw error

    // Success - Redirect to Dashboard
    const newOrgId = data // RPC returns the UUID

    // Force fetch to ensure state is updated
    await fetchOrganization(true)
    
    // Small delay to ensure DB propagation
    await new Promise(r => setTimeout(r, 500))

    if (organization.value) {
        router.push('/app')
    } else {
        throw new Error('La organización se creó pero no se pudo cargar. Intenta recargar.')
    }
  } catch (error) {
    console.error(error)
    errorMsg.value = error.message || 'Error al crear la organización'
  } finally {
    loading.value = false
  }
}
</script>
