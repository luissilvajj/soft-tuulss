<template>
  <div class="max-w-5xl mx-auto pb-20">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-text-heading">Configuración</h1>
            <p class="mt-1 text-sm text-text-secondary">Administra los detalles de tu organización.</p>
          </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex items-center space-x-1 border-b border-surface-border mb-8 overflow-x-auto">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id 
                ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                : 'border-transparent text-text-secondary hover:text-text-body hover:border-gray-300'
            ]"
          >
              <div class="flex items-center gap-2">
                  <component :is="tab.icon" class="w-4 h-4" />
                  {{ tab.label }}
              </div>
          </button>
      </div>
      
      <!-- Content Area -->
      <div class="min-h-[400px]">
          <Transition name="fade" mode="out-in">
              <GeneralSettings v-if="activeTab === 'general'" />
              <SubscriptionSettings v-else-if="activeTab === 'subscription'" />
              <TeamSettings v-else-if="activeTab === 'team'" />
          </Transition>
      </div>

  </div>
</template>

<script setup lang="ts">
import { 
    BuildingOfficeIcon, 
    CreditCardIcon, 
    UsersIcon 
} from '@heroicons/vue/24/outline'

// Import Detail Components
// Nuxt auto-imports should work if in components/settings/
// But for explicitness or if auto-import fails::
import GeneralSettings from '~/components/settings/GeneralSettings.vue'
import SubscriptionSettings from '~/components/settings/SubscriptionSettings.vue'
import TeamSettings from '~/components/settings/TeamSettings.vue'

definePageMeta({ layout: 'authenticated', middleware: 'admin-auth' })

const route = useRoute()
const router = useRouter()

// Tabs Configuration
const tabs = [
    { id: 'general', label: 'General', icon: BuildingOfficeIcon },
    { id: 'subscription', label: 'Suscripción y Pagos', icon: CreditCardIcon },
    { id: 'team', label: 'Equipo', icon: UsersIcon },
]

// State management for tabs
// Sync with URL query param ?tab=
const activeTab = computed({
    get: () => (route.query.tab as string) || 'general',
    set: (val) => router.replace({ query: { ...route.query, tab: val } })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
