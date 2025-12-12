<template>
  <div v-if="show" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-[var(--color-bg-dark)]/80 transition-opacity backdrop-blur-sm" 
        @click="$emit('close')"
        aria-hidden="true"
      ></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Panel -->
      <div class="inline-block align-bottom bg-[var(--color-bg-subtle)] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[var(--color-border-subtle)] animate-fade-in-up">
        
        <!-- Header -->
        <div class="px-6 pt-6 pb-4">
           <div class="flex justify-between items-start mb-6">
             <div>
                <h3 class="text-xl font-bold text-[var(--color-white)]" id="modal-title">
                  {{ title }}
                </h3>
                <p v-if="description" class="text-sm text-[var(--color-text-secondary)] mt-1">
                  {{ description }}
                </p>
             </div>
             <button @click="$emit('close')" class="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
          </div>
          
          <!-- Content Slot -->
          <div class="mt-2">
            <slot />
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="px-6 py-4 bg-[var(--color-bg-dark)]/50 flex gap-3 flex-row-reverse border-t border-[var(--color-border-subtle)]">
           <slot name="actions">
             <button @click="$emit('close')" type="button" class="px-6 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-bg-dark)] focus:outline-none transition-colors">
               Cerrar
             </button>
           </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Modal'
  },
  description: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
