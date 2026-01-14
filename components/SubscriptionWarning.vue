<template>
  <div v-if="showWarning" class="bg-red-600 text-white px-4 py-2 text-sm font-bold text-center flex items-center justify-center gap-4 shadow-md relative z-50">
      <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          ⚠️ Tu pago ha fallado. Tienes {{ daysLeft }} días antes del bloqueo total.
      </span>
      <NuxtLink to="/app/settings/billing" class="bg-white text-red-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors text-xs uppercase tracking-wider">
          Actualizar Pago
      </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'

const { organization } = useOrganization()

const showWarning = computed(() => {
    if (!organization.value) return false
    return organization.value.subscription_status === 'past_due'
})

const daysLeft = computed(() => {
    if (!organization.value?.last_payment_failure) return 5 // Default max
    const failDate = new Date(organization.value.last_payment_failure)
    const now = new Date()
    const diff = (now.getTime() - failDate.getTime()) / (1000 * 3600 * 24)
    const remaining = 5 - diff
    return Math.max(0, Math.ceil(remaining))
})
</script>
