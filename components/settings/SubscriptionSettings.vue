<template>
  <div class="space-y-8">
      <!-- Status Banner -->
      <div v-if="trialDaysLeft >= 0 && trialDaysLeft <= 14" class="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-3">
           <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <div>
             <h3 class="text-sm font-bold text-yellow-700">Prueba Gratuita Activa</h3>
             <p class="text-sm text-yellow-800/80">Te quedan <span class="font-bold text-yellow-900">{{ trialDaysLeft }} días</span> de prueba. Actualiza a Pro para no perder acceso.</p>
           </div>
      </div>
 
      <div v-if="trialDaysLeft < 0 && organization?.subscription_status !== 'active'" class="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
           <div class="flex items-start gap-3">
               <svg class="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               <div>
                 <h3 class="text-sm font-bold text-red-700">Suscripción Vencida</h3>
                 <p class="text-sm text-red-800/80">Tu cuenta está limitada. Por favor renueva tu suscripción.</p>
               </div>
           </div>
           <BaseButton variant="danger" :loading="fixing" @click="fixAccount">
               🔓 Reparar Acceso
           </BaseButton>
      </div>

      <!-- Current Plan Card -->
      <BaseCard title="Tu Plan Actual">
          <template #icon>
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </template>
          
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                   <span :class="[
                       'px-2 py-1 rounded text-xs font-bold uppercase border',
                       organization?.subscription_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                   ]">
                       {{ organization?.subscription_status === 'active' ? 'Activo' : 'Inactivo / Prueba' }}
                   </span>
                   <h2 class="text-3xl font-bold text-text-heading mt-2 capitalize">{{ currentPlanName }}</h2>
                   <p class="text-text-secondary mt-1" v-if="nextBillingDate">
                       Próxima facturación: <span class="font-bold text-text-body">{{ nextBillingDate }}</span>
                   </p>
              </div>
              <div class="text-right">
                  <p class="text-sm text-text-secondary mb-2">Precio estimado</p>
                  <p class="text-2xl font-bold text-text-heading">$30 <span class="text-sm font-normal text-text-secondary">/mes</span></p> 
              </div>
          </div>
      </BaseCard>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Pricing Cards -->
          <!-- Start -->
          <BaseCard class="border-2 hover:border-surface-border transition-all">
               <div class="p-2">
                   <h3 class="text-lg font-bold text-text-heading">Emprendedor</h3>
                   <p class="text-3xl font-bold mt-2">$20 <span class="text-sm font-normal text-text-secondary">/mes</span></p>
                   <ul class="mt-4 space-y-2 text-sm text-text-secondary">
                       <li>✓ 2 Usuarios</li>
                       <li>✓ Inventario Ilimitado</li>
                       <li>✓ POS Básico</li>
                   </ul>
               </div>
               <template #footer>
                   <BaseButton variant="secondary" full-width @click="openPaymentModal('start', 20)">Elegir Plan</BaseButton>
               </template>
          </BaseCard>

           <!-- Growth -->
          <BaseCard class="border-2 border-primary-500 relative overflow-visible transform scale-105 z-10 shadow-xl">
               <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-3 py-1 text-xs font-bold rounded-full uppercase">Recomendado</div>
               <div class="p-2">
                   <h3 class="text-lg font-bold text-primary-700">Negocio</h3>
                   <p class="text-3xl font-bold mt-2 text-text-heading">$30 <span class="text-sm font-normal text-text-secondary">/mes</span></p>
                   <ul class="mt-4 space-y-2 text-text-body font-medium">
                       <li>✓ Hasta 5 Usuarios</li>
                       <li>✓ Facturación PDF</li>
                       <li>✓ Reportes Avanzados</li>
                   </ul>
               </div>
               <template #footer>
                   <BaseButton variant="primary" full-width @click="openPaymentModal('growth', 30)">Elegir Plan</BaseButton>
               </template>
          </BaseCard>

           <!-- Scale -->
          <BaseCard class="border-2 hover:border-surface-border transition-all">
               <div class="p-2">
                   <h3 class="text-lg font-bold text-text-heading">Empresarial</h3>
                   <p class="text-3xl font-bold mt-2">$60 <span class="text-sm font-normal text-text-secondary">/mes</span></p>
                   <ul class="mt-4 space-y-2 text-sm text-text-secondary">
                       <li>✓ Usuarios Ilimitados</li>
                       <li>✓ API de Pagos</li>
                       <li>✓ Soporte Prioritario</li>
                   </ul>
               </div>
               <template #footer>
                   <BaseButton variant="ghost" full-width @click="openPaymentModal('scale', 60)">Contactar</BaseButton>
               </template>
          </BaseCard>
      </div>

     <!-- Payment Modal (Portal) -->
     <BaseModal :show="showPaymentModal" title="Reportar Pago" max-width="2xl" @close="showPaymentModal = false">
         <div class="space-y-6">
             <!-- Plan Summary -->
             <div class="bg-primary-50 p-4 rounded-lg border border-primary-100 flex justify-between items-center">
                 <div>
                     <p class="text-sm text-primary-700 font-bold">Plan Seleccionado</p>
                     <p class="text-xl font-bold text-primary-900 capitalize">{{ selectedPlan === 'start' ? 'Emprendedor' : selectedPlan === 'growth' ? 'Negocio' : 'Empresarial' }}</p>
                 </div>
                 <div class="text-right">
                     <p class="text-sm text-primary-700">Monto</p>
                     <p class="text-xl font-bold text-primary-900">${{ selectedPrice }}</p>
                 </div>
             </div>

             <!-- Bank Info -->
             <div class="bg-surface-section p-4 rounded-lg border border-surface-border">
                 <h4 class="font-bold text-text-heading mb-4">Datos Bancarios (Pago Móvil)</h4>
                 <div class="grid grid-cols-2 gap-4 text-sm">
                     <div class="group relative">
                         <p class="text-text-secondary">Banco</p>
                         <div class="flex items-center gap-2">
                            <p class="font-bold text-text-body">Banplus (0174)</p>
                            <button @click="copyToClipboard('0174')" class="text-primary-600 hover:text-primary-700 opacity-0 group-hover:opacity-100 transition-opacity" title="Copiar Banco">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            </button>
                         </div>
                     </div>
                      <div class="group relative">
                         <p class="text-text-secondary">Teléfono</p>
                         <div class="flex items-center gap-2">
                             <p class="font-bold text-text-body">0424-167-2737</p>
                             <button @click="copyToClipboard('04241672737')" class="text-primary-600 hover:text-primary-700 opacity-0 group-hover:opacity-100 transition-opacity" title="Copiar Teléfono">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                             </button>
                         </div>
                     </div>
                      <div class="group relative">
                         <p class="text-text-secondary">Cédula / RIF</p>
                         <div class="flex items-center gap-2">
                             <p class="font-bold text-text-body">J-501476906</p>
                             <button @click="copyToClipboard('J501476906')" class="text-primary-600 hover:text-primary-700 opacity-0 group-hover:opacity-100 transition-opacity" title="Copiar RIF">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                             </button>
                         </div>
                     </div>
                      <div>
                         <p class="text-text-secondary">Tasa BCV</p>
                         <p class="font-bold text-text-body">{{ bcvRate }} Bs/$</p>
                     </div>
                 </div>
                 <div class="mt-4 pt-4 border-t border-surface-border">
                     <p class="text-lg font-bold text-primary-600">Total a Pagar: Bs. {{ totalBs }}</p>
                     <p class="text-xs text-text-secondary mt-1">Por favor paga el monto exacto para validación automática.</p>
                 </div>
             </div>

             <!-- Form -->
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <BaseInput v-model="paymentForm.phone" label="Teléfono Origen" placeholder="0412..." />
                 <BaseInput v-model="paymentForm.reference" label="Últimos 4 dígitos (Referencia)" placeholder="1234" />
                 <BaseInput v-model="paymentForm.date" type="date" label="Fecha" :max="todayStr" />
                 <div class="opacity-75 relative">
                     <BaseInput v-model="paymentForm.amount" type="number" step="0.01" label="Monto Reportado (Bs)" readonly />
                     <div class="absolute inset-0 z-10 cursor-not-allowed" title="El monto es calculado automáticamente"></div>
                 </div>
             </div>
         </div>

         <template #footer>
             <BaseButton variant="ghost" @click="showPaymentModal = false">Cancelar</BaseButton>
             <BaseButton variant="primary" :loading="submittingPayment" @click="submitPayment">Reportar Pago</BaseButton>
         </template>
     </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from "vue-toastification"
import BaseCard from '~/components/base/BaseCard.vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import BaseModal from '~/components/base/BaseModal.vue'

const { organization, fetchOrganization } = useOrganization()
const toast = useToast()

const showPaymentModal = ref(false)
const selectedPrice = ref(0)
const selectedPlan = ref('')
const bcvRate = ref(60) // Fallback
const submittingPayment = ref(false)
const fixing = ref(false)

const paymentForm = ref({
    type: 'pago_movil',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    phone: ''
})

const totalBs = computed(() => (selectedPrice.value * bcvRate.value).toFixed(2))

const trialDaysLeft = computed(() => {
    if (!organization.value?.trial_ends_at) return 0
    const end = new Date(organization.value.trial_ends_at)
    const now = new Date()
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
})

const currentPlanName = computed(() => organization.value?.subscription_plan || 'Pro')

const nextBillingDate = computed(() => {
    let dateStr = organization.value?.current_period_end || organization.value?.trial_ends_at
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
})

const openPaymentModal = async (plan: string, price: number) => {
    selectedPlan.value = plan
    selectedPrice.value = price
    showPaymentModal.value = true
    
    // Fetch BCV
    try {
        const data = await $fetch<any>('/api/bcv-rate')
        if (data?.rate) {
            bcvRate.value = data.rate
            paymentForm.value.amount = (price * data.rate).toFixed(2)
        }
    } catch (e) { console.error(e) }
}

const submitPayment = async () => {
    submittingPayment.value = true
    try {
         await $fetch('/api/payments/verify', {
            method: 'POST',
            body: {
                ...paymentForm.value,
                plan: selectedPlan.value,
                organization_id: organization.value?.id
            }
        })
        toast.success('¡Pago validado exitosamente!')
        showPaymentModal.value = false
        await fetchOrganization(true)
    } catch (e: any) {
        toast.error('Error: ' + (e.data?.statusMessage || e.message))
    } finally {
        submittingPayment.value = false
    }
}

const fixAccount = async () => {
    fixing.value = true
     try {
        await $fetch('/api/fix-account', { method: 'POST' })
        toast.success('Cuenta reparada')
        setTimeout(() => window.location.reload(), 1000)
    } catch (e: any) {
        toast.error('Error: ' + e.message)
    } finally {
        fixing.value = false
    }
}
const todayStr = computed(() => new Date().toISOString().split('T')[0])

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.info('Copiado al portapapeles', { timeout: 1500 })
}
</script>
