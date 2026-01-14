<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center bg-[var(--color-bg-subtle)]/30 rounded-2xl border-2 border-dashed border-[var(--color-border-subtle)]">
    <div class="w-20 h-20 bg-[var(--color-bg-dark)] rounded-full flex items-center justify-center mb-6 shadow-sm">
        <slot name="icon">
             <!-- Default Icon -->
             <svg class="w-10 h-10 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </slot>
    </div>
    
    <h3 class="text-xl font-bold text-[var(--color-heading)] mb-2">{{ title }}</h3>
    
    <p class="text-[var(--color-text-secondary)] max-w-sm mb-8 text-sm leading-relaxed">
        {{ description }}
    </p>
    
    <button 
        v-if="actionLabel"
        @click="$emit('action')" 
        :id="actionId"
        class="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
    >
        <span>{{ actionLabel }}</span>
        <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string
    description: string
    actionLabel?: string
    actionId?: string // Important for Driver.js targeting
}>()

defineEmits(['action'])
</script>
