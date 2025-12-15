<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight text-gradient mb-8">Facturación & Plan</h1>

    <div class="glass-panel p-0 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
      <!-- Sidebar / Tabs (Reused Style) -->
      <div class="w-full md:w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 p-4">
        <nav class="space-y-1">
          <NuxtLink to="/app/settings" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-white)] transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011 1v4a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h2"></path></svg>
            General
          </NuxtLink>
           <NuxtLink to="/app/settings?tab=team" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-white)] transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Equipo
          </NuxtLink>
          <div class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Facturación
          </div>
        </nav>
      </div>

      <!-- Content -->
      <div class="flex-1 p-4 md:p-8">
         <div class="max-w-2xl">
            <!-- Alert: Trial Status -->
            <div v-if="trialDaysLeft >= 0 && trialDaysLeft <= 14" class="mb-8 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-3">
               <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <div>
                 <h3 class="text-sm font-bold text-yellow-700">Prueba Gratuita Activa</h3>
                 <p class="text-sm text-yellow-800/80">Te quedan <span class="font-bold text-yellow-900">{{ trialDaysLeft }} días</span> de prueba. Actualiza a Pro para no perder acceso.</p>
               </div>
            </div>

            <!-- Blocked Status -->
            <div v-if="trialDaysLeft < 0 && organization?.subscription_status !== 'active'" class="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col md:flex-row items-start gap-4">
               <div class="flex items-start gap-3">
                   <svg class="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                   <div>
                     <h3 class="text-sm font-bold text-red-700">Suscripción Vencida o Error de Acceso</h3>
                     <p class="text-sm text-red-800/80 mb-3">Si crees que esto es un error o acabas de resetear tu cuenta, pulsa el botón para reparar tu acceso.</p>
                   </div>
               </div>
               <button @click="fixAccount" :disabled="fixing" class="whitespace-nowrap px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-lg transition-all">
                   {{ fixing ? 'Reparando...' : '🔓 Reparar Mi Cuenta' }}
               </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Current Plan -->
                <div class="border border-[var(--color-border-subtle)] rounded-xl p-6 bg-[var(--color-bg-subtle)] flex flex-col justify-between">
                   <div>
                       <span class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Plan Actual</span>
                       <h2 class="text-2xl font-bold text-[var(--color-text-primary)] mt-2 capitalize">{{ currentPlanName }}</h2>
                       <p class="text-sm text-[var(--color-text-secondary)] mt-2">
                         {{ organization?.subscription_status === 'active' ? 'Renovación automática' : 'Modo Prueba' }}
                       </p>
                   </div>
                   <div class="mt-6 pt-6 border-t border-[var(--color-border-subtle)] space-y-3">
                       <div class="flex justify-between items-center">
                           <span class="text-xs text-[var(--color-text-secondary)]">Estado: </span>
                           <span :class="[
                              'px-2 py-0.5 rounded text-xs font-bold uppercase',
                              organization?.subscription_status === 'active' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                           ]">
                              {{ organization?.subscription_status || 'Trial' }}
                           </span>
                       </div>
                       <div class="flex justify-between items-center" v-if="nextBillingDate">
                           <span class="text-xs text-[var(--color-text-secondary)] font-bold">📅 Próxima Facturación: </span>
                           <span class="text-sm font-mono text-[var(--color-text-primary)] font-bold">
                              {{ nextBillingDate }}
                           </span>
                       </div>
                   </div>
                </div>

                <!-- Upgrade Card -->
                <div class="relative border border-[var(--color-accent-blue)] rounded-xl p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[var(--color-bg-dark)] dark:to-blue-900/20 flex flex-col justify-between overflow-hidden group shadow-lg dark:shadow-none">
                   <div class="absolute -right-10 -top-10 w-32 h-32 bg-[var(--color-accent-blue)]/10 blur-3xl group-hover:bg-[var(--color-accent-blue)]/20 transition-all"></div>
                   
                   <div class="relative z-10">
                       <div class="flex justify-between items-start">
                           <span class="text-xs font-bold text-[var(--color-accent-blue)] uppercase tracking-wider">Recomendado</span>
                           <span class="text-2xl font-bold text-[var(--color-text-primary)]">$29<span class="text-sm text-[var(--color-text-secondary)] font-medium">/mes</span></span>
                       </div>
                       <h2 class="text-xl font-bold text-[var(--color-text-primary)] mt-2">Plan Pro</h2>
                       <ul class="mt-4 space-y-2">
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                             <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Usuarios Ilimitados
                          </li>
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                             <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Facturación PDF
                          </li>
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                             <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Soporte Prioritario
                          </li>
                       </ul>
                   </div>

                   <button disabled class="relative z-10 mt-6 w-full btn btn-primary justify-center opacity-70 cursor-not-allowed">
                       Conectar Stripe (Pronto)
                   </button>
                </div>
            </div>

            <!-- Invoice History (Placeholder) -->
            <div class="mt-12">
                <h3 class="text-lg font-bold text-[var(--color-text-primary)] mb-4">Historial de Pagos</h3>
                <div class="text-center py-8 border border-dashed border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-secondary)]">
                    No hay facturas disponibles aún.
                </div>
            </div>
         </div>
      </div>
    </div>
     <!-- Debug Section (Temporary) -->
     <div class="mt-8 p-4 bg-black text-green-400 font-mono text-xs rounded-xl overflow-auto">
        <p class="font-bold text-white mb-2">DEBUG INFO (Take Screenshot)</p>
        <p>User Email: {{ user?.email }}</p>
        <p>User ID: {{ user?.id }}</p>
        <p>Org State (Composable): {{ organization }}</p>
        <p>Direct API Result: {{ debugResult }}</p>
        <p class="text-red-400" v-if="debugError">API Error: {{ debugError }}</p>
        <p>Loading: {{ loading }}</p>
     </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const { organization, fetchOrganization, loading } = useOrganization()

definePageMeta({ layout: 'dashboard' })

onMounted(async () => {
    // Force refresh to ensure we have the latest subscription status (e.g. after upgrade/DB reset)
    await fetchOrganization(true)
})

const trialDaysLeft = computed(() => {
    if (!organization.value?.trial_ends_at) return 0
    const end = new Date(organization.value.trial_ends_at)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
})

const currentPlanName = computed(() => {
    if (organization.value?.subscription_status === 'active') return organization.value.subscription_plan || 'Pro'
    if (trialDaysLeft.value > 0) return 'Prueba Gratuita'
    return 'Vencido'
})

const nextBillingDate = computed(() => {
    const org = organization.value
    if (!org) return null
    
    // Choose the relevant date
    let dateStr = org.current_period_end || org.trial_ends_at
    if (!dateStr) return null

    // Format options: "15 de Enero de 2026"
    return new Date(dateStr).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })
})

const fixing = ref(false)
const debugResult = ref<any>(null)
const debugError = ref<any>(null)

const fixAccount = async () => {
    fixing.value = true
    try {
        const { error } = await useFetch('/api/fix-account', { method: 'POST' })
        if (error.value) throw error.value
        
        alert('✅ Cuenta Reparada. Recargando...')
        window.location.href = '/app'
    } catch (e) {
        alert('Error reparando: ' + e.message)
    } finally {
        fixing.value = false
    }
}

onMounted(async () => {
    // Force refresh to ensure we have the latest subscription status
    await fetchOrganization(true)

    // DEBUG: Direct API Test
    try {
        debugResult.value = await $fetch('/api/me/organization?t=' + Date.now())
        
        // FORCE UPDATE STATE FROM API
        if (debugResult.value && debugResult.value.subscription_status) {
            organization.value = debugResult.value
        }
    } catch (e) {
        debugError.value = e
    }
})

</script>
