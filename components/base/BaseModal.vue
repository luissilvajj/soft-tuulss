<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 overflow-y-auto" 
        role="dialog" 
        aria-modal="true"
        :aria-labelledby="id + '-title'"
      >
        <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Backdrop -->
          <div 
            class="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" 
            aria-hidden="true"
            @click="closeOnBackdrop ? $emit('close') : null"
          ></div>
  
          <!-- Spacer for centering -->
          <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
  
          <!-- Panel -->
          <div 
            :class="[
              'relative inline-block transform overflow-hidden rounded-2xl bg-surface-ground text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:align-middle border border-surface-border',
              maxWidthClass
            ]"
          >
            <!-- Header -->
            <div class="border-b border-surface-border bg-surface-section/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 v-if="title" class="text-lg font-bold text-text-heading" :id="id + '-title'">
                  {{ title }}
                </h3>
                <p v-if="description" class="mt-1 text-sm text-text-secondary">
                  {{ description }}
                </p>
              </div>
              <button 
                type="button" 
                class="rounded-lg p-1 text-text-secondary hover:bg-surface-subtle hover:text-text-heading transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                @click="$emit('close')"
              >
                <span class="sr-only">Cerrar</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <!-- Content -->
            <div class="px-6 py-6">
              <slot />
            </div>
  
            <!-- Footer Actions -->
            <div v-if="$slots.actions" class="bg-surface-section/30 px-6 py-4 border-t border-surface-border flex flex-row-reverse gap-3">
              <slot name="actions" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
  
<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  show: boolean
  title?: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  closeOnBackdrop?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: '',
  description: '',
  maxWidth: 'lg',
  closeOnBackdrop: true,
  id: () => `modal-${Math.random().toString(36).substring(2, 9)}`
})

const emit = defineEmits(['close'])

const maxWidthClass = computed(() => {
  const map = {
    'sm': 'sm:max-w-sm',
    'md': 'sm:max-w-md',
    'lg': 'sm:max-w-lg',
    'xl': 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
  }
  return map[props.maxWidth] || 'sm:max-w-lg'
})

// Body Scroll Lock
watch(() => props.show, (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})
</script>
  
<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .transform,
.modal-fade-leave-active .transform {
  transition: transform 0.2s ease-out;
}

.modal-fade-enter-from .transform, 
.modal-fade-leave-to .transform {
  transform: translateY(10px) scale(0.95);
}
</style>
