<template>
    <button 
        @click="nextTheme"
        class="p-2 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 flex items-center justify-center shrink-0"
        :title="`Modo: ${themeLabels[currentTheme]}`"
    >
        <ClientOnly>
            <!-- LIGHT ICON -->
            <svg v-if="currentTheme === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            
            <!-- DARK ICON -->
            <svg v-else-if="currentTheme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            
            <!-- SYSTEM ICON -->
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            
            <template #fallback>
                 <div class="w-5 h-5 border-2 border-surface-border animate-pulse rounded-full"></div>
            </template>
        </ClientOnly>
    </button>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { currentTheme, nextTheme } = useTheme()

const themeLabels: Record<string, string> = {
    'light': 'Claro',
    'dark': 'Oscuro',
    'system': 'Automático (Sistema)'
}
</script>
