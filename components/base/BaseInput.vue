<template>
  <div class="w-full">
    <label 
      v-if="label" 
      :for="id" 
      class="block text-sm font-medium text-text-secondary mb-1"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :disabled="disabled"
        @input="updateValue"
        :class="[
          'block w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
          // Conditional Styles
          error 
            ? 'border-status-error text-status-error placeholder-red-300 focus:border-status-error focus:ring-status-error/20' 
            : 'border-surface-border bg-surface-ground text-text-heading placeholder-text-secondary/50 focus:border-primary-500 focus:ring-primary-500/20 hover:border-slate-300',
           disabled ? 'opacity-50 cursor-not-allowed bg-surface-subtle' : ''
        ]"
      />
      <!-- Error Icon -->
      <div v-if="error" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-status-error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-xs text-status-error animate-pulse">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1 text-xs text-text-secondary">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  id?: string
  type?: string
  error?: string
  hint?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  id: () => `input-${Math.random().toString(36).substring(2, 9)}`,
  type: 'text',
  error: '',
  hint: '',
  disabled: false
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
