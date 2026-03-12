<template>
  <div v-if="show" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity" 
        @click="$emit('close')"
        aria-hidden="true"
      ></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Panel -->
      <div class="relative z-50 inline-block align-bottom bg-surface-ground rounded-2xl text-left overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 dark:border-white/5 transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full animate-fade-in-up">
        
         <!-- Header -->
         <div class="px-6 pt-6 pb-4 bg-gradient-to-b from-surface-subtle/50 to-transparent border-b border-surface-border">
           <div class="flex justify-between items-start">
             <div>
                <h3 class="text-xl font-bold text-text-heading tracking-tight" id="modal-title">
                  {{ title }}
                </h3>
                <p v-if="description" class="text-sm text-text-secondary mt-1">
                  {{ description }}
                </p>
             </div>
             <button @click="$emit('close')" class="p-2 rounded-full text-text-secondary hover:bg-surface-subtle hover:text-text-heading ring-1 ring-transparent hover:ring-surface-border hover:shadow-sm transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
          </div>
        </div>

        <!-- Content Slot -->
        <div class="px-6 py-6 bg-surface-ground">
          <slot />
        </div>

        <!-- Actions Footer -->
        <div class="px-6 py-4 bg-surface-subtle/30 flex gap-3 flex-row-reverse border-t border-surface-border rounded-b-2xl">
           <slot name="actions">
             <button @click="$emit('close')" type="button" class="btn variant-secondary">
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
