<template>
  <div class="relative group">
    <button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors w-full">
      <div v-if="organization" class="w-6 h-6 rounded bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
          {{ organization?.name?.charAt(0).toUpperCase() }}
      </div>
       <div v-else class="w-6 h-6 rounded bg-gray-500 animate-pulse"></div>

      <div class="flex-1 text-left min-w-0">
        <div class="font-bold text-[var(--color-white)] truncate text-sm">
            {{ organization?.name || 'Cargando...' }}
        </div>
        <div class="text-[10px] text-[var(--color-text-secondary)] truncate">
             {{ userOrganizations.length > 1 ? 'Cambiar Organización' : 'Plan ' + (organization?.subscription_plan || 'Free') }}
        </div>
      </div>

      <svg class="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>

    <!-- Dropdown -->
    <div class="absolute top-full left-0 w-full mt-2 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--color-border-subtle)] rounded-xl shadow-2xl overflow-hidden hidden group-hover:block z-50 min-w-[240px]">
        <div class="p-2 space-y-1">
            <div class="px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Mis Organizaciones
            </div>
            
            <button 
                v-for="org in userOrganizations" 
                :key="org.id"
                @click="switchOrganization(org.id)"
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors text-left"
                :class="organization?.id === org.id ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]' : 'text-[var(--color-white)]'"
            >
                <div class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                     :class="organization?.id === org.id ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-gray-700 text-gray-300'">
                    {{ org.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 truncate text-sm font-medium">
                    {{ org.name }}
                </div>
                <svg v-if="organization?.id === org.id" class="w-4 h-4 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </button>
        </div>

        <div class="border-t border-[var(--color-border-subtle)] p-2">
            <NuxtLink to="/onboarding" class="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)] rounded-lg transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Crear Nueva Organización
            </NuxtLink>
        </div>
    </div>
  </div>
</template>

<script setup>
const { organization, userOrganizations, switchOrganization } = useOrganization()
</script>
