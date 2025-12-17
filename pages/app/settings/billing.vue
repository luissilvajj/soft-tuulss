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
         <div class="max-w-5xl">
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
            </div> <!-- Close grid-cols-2 -->

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <!-- Plan Basic -->
                <div class="border border-[var(--color-border-subtle)] rounded-xl p-6 bg-[var(--color-bg-subtle)] flex flex-col justify-between hover:border-[var(--color-text-secondary)] transition-colors">
                   <div>
                       <span class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Start</span>
                       <h2 class="text-2xl font-bold text-[var(--color-text-primary)] mt-2">Básico</h2>
                       <div class="mt-2 flex items-baseline gap-1">
                           <span class="text-3xl font-bold text-[var(--color-text-primary)]">$0</span>
                           <span class="text-sm text-[var(--color-text-secondary)]">/mes</span>
                       </div>
                       <ul class="mt-6 space-y-3">
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                             <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             3 Usuarios
                          </li>
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                             <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Control de Inventario
                          </li>
                       </ul>
                   </div>
                   <button class="mt-6 w-full btn btn-secondary opacity-50 cursor-not-allowed">Plan Actual</button>
                </div>

                <!-- Plan Pro -->
                <div class="relative border-2 border-[var(--color-accent-blue)] rounded-xl p-6 bg-[var(--color-bg-subtle)] flex flex-col justify-between shadow-xl shadow-blue-500/10 transform scale-105 z-10">
                   <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--color-accent-blue)] text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                       Más Popular
                   </div>
                   <div>
                       <span class="text-xs font-bold text-[var(--color-accent-blue)] uppercase tracking-wider">Growth</span>
                       <h2 class="text-2xl font-bold text-[var(--color-text-primary)] mt-2">Pro</h2>
                       <div class="mt-2 flex items-baseline gap-1">
                           <span class="text-3xl font-bold text-[var(--color-text-primary)]">$29</span>
                           <span class="text-sm text-[var(--color-text-secondary)]">/mes</span>
                       </div>
                       <ul class="mt-6 space-y-3">
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-primary)] font-medium">
                             <svg class="w-4 h-4 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Usuarios Ilimitados
                          </li>
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-primary)] font-medium">
                             <svg class="w-4 h-4 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Facturación PDF
                          </li>
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-primary)] font-medium">
                             <svg class="w-4 h-4 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Soporte Prioritario
                          </li>
                       </ul>
                   </div>
                   <button @click="openPaymentModal('pro', 29)" class="mt-6 w-full btn btn-primary justify-center shadow-lg shadow-blue-500/20">
                       Elegir Pro
                   </button>
                </div>

                <!-- Plan Enterprise -->
                <div class="border border-[var(--color-border-subtle)] rounded-xl p-6 bg-[var(--color-bg-subtle)] flex flex-col justify-between hover:border-[var(--color-text-secondary)] transition-colors">
                   <div>
                       <span class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Business</span>
                       <h2 class="text-2xl font-bold text-[var(--color-text-primary)] mt-2">Enterprise</h2>
                       <div class="mt-2 flex items-baseline gap-1">
                           <span class="text-3xl font-bold text-[var(--color-text-primary)]">$99</span>
                           <span class="text-sm text-[var(--color-text-secondary)]">/mes</span>
                       </div>
                       <ul class="mt-6 space-y-3">
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                             <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             API Access
                          </li>
                          <li class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                             <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                             Dedicated Success Manager
                          </li>
                       </ul>
                   </div>
                   <button @click="openPaymentModal('enterprise', 99)" class="mt-6 w-full btn btn-outline justify-center">
                       Contáctanos
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
    
    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showPaymentModal = false"></div>
        <div class="relative w-full max-w-4xl bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl border border-[var(--color-border-subtle)] overflow-hidden flex flex-col md:flex-row">
            
            <!-- Left: Bank Details -->
            <div class="w-full md:w-1/2 p-8 bg-[var(--color-bg-subtle)] border-r border-[var(--color-border-subtle)]">
                <h3 class="text-xl font-bold text-[var(--color-text-primary)] mb-6">Datos para Pago Móvil</h3>
                
                <div class="space-y-6">
                        <p class="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-1">Banco</p>
                        <p class="text-lg font-bold text-[var(--color-text-primary)]">Banco Plaza (0138)</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                         <div class="p-4 bg-white/5 rounded-xl border border-[var(--color-border-subtle)]">
                            <p class="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-1">Teléfono</p>
                            <p class="text-lg font-bold text-[var(--color-text-primary)]">0424-167-2737</p>
                        </div>
                         <div class="p-4 bg-white/5 rounded-xl border border-[var(--color-border-subtle)]">
                            <p class="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-1">Cédula / RIF</p>
                            <p class="text-lg font-bold text-[var(--color-text-primary)]">J-501476906</p>
                        </div>
                    </div>

                    <div class="mt-8 pt-8 border-t border-[var(--color-border-subtle)]">
                        <p class="text-sm font-bold text-[var(--color-text-secondary)] mb-4">Total a Pagar (Tasa BCV)</p>
                        <div class="flex items-baseline gap-2">
                             <span class="text-4xl font-bold text-[var(--color-accent-blue)]">Bs. {{ totalBs }}</span>
                             <span class="text-sm text-[var(--color-text-secondary)]">Ref: ${{ selectedPrice }} @ {{ bcvRate }}</span>
                        </div>
                        <p class="text-xs text-[var(--color-text-secondary)] mt-2 opacity-70">
                           Tasa calculada automáticamente según BCV del día.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Right: Report Form -->
            <div class="w-full md:w-1/2 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-[var(--color-text-primary)]">Reportar Pago</h3>
                    <button @click="showPaymentModal = false" class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form @submit.prevent="submitPayment" class="space-y-4">
                    <!-- Payment Type Selector -->
                    <div>
                        <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Método de Pago</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" 
                                @click="paymentForm.type = 'pago_movil'"
                                :class="[
                                    'px-4 py-2 text-sm font-bold rounded-lg border transition-all text-center',
                                    paymentForm.type === 'pago_movil' 
                                    ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white' 
                                    : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)]'
                                ]"
                            >
                                Pago Móvil
                            </button>
                            <button type="button" 
                                @click="paymentForm.type = 'transferencia'"
                                :class="[
                                    'px-4 py-2 text-sm font-bold rounded-lg border transition-all text-center',
                                    paymentForm.type === 'transferencia' 
                                    ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white' 
                                    : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)]'
                                ]"
                            >
                                Transferencia
                            </button>
                        </div>
                    </div>

                    <!-- Dynamic Fields -->
                    <div v-if="paymentForm.type === 'pago_movil'">
                        <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Teléfono Origen</label>
                        <input v-model="paymentForm.phone" type="text" placeholder="04141234567" class="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] outline-none transition-all" required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Número de Referencia ({{ paymentForm.type === 'pago_movil' ? 'Ultimos dígitos' : 'Completo' }})</label>
                        <input v-model="paymentForm.reference" type="text" placeholder="Ej: 123456" class="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] outline-none transition-all" required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Fecha de Pago</label>
                        <input v-model="paymentForm.date" type="date" class="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] outline-none transition-all" required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Monto Pagado (Bs)</label>
                        <input v-model="paymentForm.amount" type="number" step="0.01" class="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] outline-none transition-all" required>
                    </div>

                    <div class="pt-4">
                        <button type="submit" :disabled="submittingPayment" class="w-full py-3 px-4 bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ submittingPayment ? 'Verificando con el Banco...' : 'Validar Pago Ahora' }}
                        </button>
                        <p class="text-xs text-center text-[var(--color-text-secondary)] mt-4">
                             Validación automática en tiempo real con Banco Plaza.
                        </p>
                        <p v-if="successMessage" class="text-sm text-center text-green-500 font-bold mt-2 animate-bounce">{{ successMessage }}</p>
                    </div>
                </form>
            </div>
        </div>
    </div>

     <!-- Debug Section (Temporary) -->
     <div class="mt-8 p-4 bg-black text-green-400 font-mono text-xs rounded-xl overflow-auto hidden">
        <p class="font-bold text-white mb-2">DEBUG INFO</p>
        <p>User Email: {{ user?.email }}</p>
        <p>Loading: {{ loading }}</p>
     </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const { organization, fetchOrganization, loading } = useOrganization()

definePageMeta({ layout: 'dashboard' })

// Payment Logic
const showPaymentModal = ref(false)
const selectedPrice = ref(0)
const selectedPlan = ref('')
const bcvRate = ref(0)
const submittingPayment = ref(false)
const successMessage = ref('')

const paymentForm = ref({
    type: 'pago_movil', // 'pago_movil' | 'transferencia'
    reference: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    phone: ''
})

const totalBs = computed(() => {
    return (selectedPrice.value * bcvRate.value).toFixed(2)
})

const openPaymentModal = async (plan: string, price: number) => {
    selectedPlan.value = plan
    selectedPrice.value = price
    showPaymentModal.value = true
    successMessage.value = ''
    paymentForm.value.type = 'pago_movil' // Reset default
    
    // Fetch BCV Rate
    try {
        const data = await $fetch<any>('/api/bcv-rate')
        if (data && data.rate) {
            bcvRate.value = data.rate
            paymentForm.value.amount = (price * data.rate).toFixed(2)
        }
    } catch (e) {
        console.error('Error fetching BCV rate', e)
        bcvRate.value = 60 // Fallback
    }
}

const submitPayment = async () => {
    submittingPayment.value = true
    successMessage.value = '' // Clear previous msgs
    
    try {
        const response = await $fetch<any>('/api/payments/verify', {
            method: 'POST',
            body: {
                type: paymentForm.value.type,
                reference: paymentForm.value.reference,
                date: paymentForm.value.date,
                amount: paymentForm.value.amount,
                phone: paymentForm.value.phone,
                plan: selectedPlan.value,
                organization_id: organization.value?.id
            }
        })
        
        successMessage.value = '¡Pago Aprobado! Tu suscripción se ha extendido.'
        
        // Refresh org data to see new dates
        await fetchOrganization(true)
        
        setTimeout(() => {
            showPaymentModal.value = false
        }, 3000)
    } catch (e: any) {
        // Parse error message carefully
        const msg = e.data?.statusMessage || e.message || 'Error desconocido'
        if (msg.includes('No Encontrado')) {
             alert('❌ Pago no encontrado. Por favor verifica la referencia y el monto exacto.')
        } else {
             alert('Error: ' + msg)
        }
    } finally {
        submittingPayment.value = false
    }
}

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
