<template>
  <div class="relative">
    <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Cliente</label>
    <div class="relative">
        <select 
            :value="modelValue" 
            @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
            class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-lg p-3 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none appearance-none"
        >
            <option value="">Cliente Casual (Sin registro)</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
            </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg class="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </div>
    <!-- Link to create new client (Future feature) -->
    <p class="text-xs text-[var(--color-primary)] mt-1 cursor-pointer hover:underline text-right" @click="$emit('create-client')">
        + Crear nuevo cliente
    </p>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { useOrganization } from '~/composables/useOrganization'
import type { Client } from '~/types/models'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue', 'create-client'])

const client = useSupabaseClient()
const { organization } = useOrganization()
const clients = ref<Client[]>([])

const fetchClients = async () => {
    if (!organization.value?.id) return
    const { data } = await client
        .from('clients')
        .select('*')
        .eq('organization_id', organization.value.id)
    
    if (data) clients.value = data as any
}

onMounted(fetchClients)
</script>
