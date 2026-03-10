<template>
  <div class="bg-surface-ground shadow-sm rounded-2xl border border-surface-border p-6 relative overflow-hidden">
    <div v-if="$slots.header || title" class="mb-6 pb-4 border-b border-surface-border flex items-center justify-between">
        <div>
             <h3 v-if="title" class="text-lg font-bold text-text-heading flex items-center gap-2">
                <slot name="icon">
                    <span v-if="icon">{{ icon }}</span>
                </slot>
                {{ title }}
            </h3>
             <p v-if="subtitle" class="text-sm text-text-secondary mt-1">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.actions">
            <slot name="actions"></slot>
        </div>
    </div>
    
    <slot></slot>
    
    <div v-if="$slots.footer" class="mt-8 pt-6 border-t border-surface-border flex items-center justify-end">
        <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
    title?: string
    subtitle?: string
    icon?: string
    noPadding?: boolean
}>()
</script>
