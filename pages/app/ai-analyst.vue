<template>
  <div>
    <!-- Standard Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-heading">AI Analyst</h1>
        <p class="mt-1 text-sm text-text-secondary">Tu asistente inteligente para la toma de decisiones.</p>
      </div>
    </div>

    <BaseCard no-padding class="h-[600px] flex flex-col">
        <!-- Chat Area -->
        <div class="flex-1 p-6 overflow-y-auto space-y-4 bg-surface-subtle/30">
            <!-- Welcome Message -->
            <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div class="bg-white p-4 rounded-2xl rounded-tl-none border border-surface-border shadow-sm max-w-lg">
                    <p class="text-text-body font-medium">
                        Hola, soy tu Analista Financiero IA. 🤖
                    </p>
                    <p class="text-sm text-text-secondary mt-2">
                        Puedo ayudarte a entender tus márgenes, identificar productos estancados o proyectar ventas. ¿Qué quieres saber hoy?
                    </p>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-surface-border sticky bottom-0">
             <div class="relative">
                <BaseInput 
                    placeholder="Pregúntale a tu asistente (ej. ¿Cuál fue el producto más vendido?)..." 
                    class="pr-12"
                />
                <button class="absolute right-3 top-3 text-primary-600 hover:text-primary-700 p-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
             </div>
             <p class="text-xs text-center text-text-secondary mt-2">
                AI Analyst puede cometer errores. Verifica la información importante.
             </p>
        </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '~/components/base/BaseCard.vue'
import BaseInput from '~/components/base/BaseInput.vue'

definePageMeta({ layout: 'authenticated' })
</script>
