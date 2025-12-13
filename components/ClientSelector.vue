<template>
  <div class="relative group" ref="container">
    <div class="relative">
      <!-- Search Input -->
      <input 
        ref="timerInput"
        type="text" 
        v-model="searchQuery" 
        @focus="isOpen = true"
        @input="isOpen = true"
        @keydown.down.prevent="selectNext"
        @keydown.up.prevent="selectPrev"
        @keydown.enter.prevent="selectCurrent"
        @keydown.esc="closeDropdown"
        class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-xl py-3 pl-4 pr-10 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none transition-all placeholder-gray-400 font-medium"
        :placeholder="selectedClient ? selectedClient.name : 'Buscar cliente (Nombre o Cédula)...'"
      />
      
      <!-- Icons -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
         <span v-if="loading" class="animate-spin mr-2">⟳</span>
         <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <!-- Selected Badge (if any) -->
      <div v-if="selectedClient && !isOpen" class="absolute inset-y-0 left-0 flex items-center pl-3 pr-2 pointer-events-none bg-white">
          <span class="text-sm font-bold text-black bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[200px]">{{ selectedClient.name }}</span>
      </div>
    </div>

    <!-- Results Dropdown -->
    <div v-if="isOpen && (searchQuery || filteredClients.length > 0)" class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto ring-1 ring-black/5 divide-y divide-gray-50">
        
        <!-- Casul / Clear -->
        <div 
             @click="selectClient(null)"
             :class="['p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors', activeIndex === -1 ? 'bg-blue-50' : '']"
        >
            <span class="text-gray-500 italic">Cliente Casual (Limpiar selección)</span>
        </div>

        <div v-if="filteredClients.length === 0" class="p-4 text-center text-gray-400 text-sm">
            <p>No encontrado.</p>
            <p class="text-xs mt-1">Presiona "Crear nuevo cliente"</p>
        </div>

        <div 
            v-for="(client, index) in filteredClients" 
            :key="client.id"
            @click="selectClient(client)"
            :class="['p-3 cursor-pointer hover:bg-blue-50 flex flex-col transition-colors', activeIndex === index ? 'bg-blue-50' : '']"
        >
            <span class="font-bold text-gray-900">{{ client.name }}</span>
            <span class="text-xs text-gray-400" v-if="client.identity_document || client.email">
                Identidad: {{ client.identity_document || 'N/A' }} • {{ client.email }}
            </span>
        </div>
    </div>
    
    <!-- Link to create new client -->
    <button type="button" class="absolute -bottom-6 right-0 text-xs font-bold text-[var(--color-primary)] hover:underline" @click="$emit('create-client')">
        + Crear nuevo cliente
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseClient } from '#imports'
import { useOrganization } from '~/composables/useOrganization'
import type { Client } from '~/types/models'
import { ref, computed, onMounted, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue', 'create-client'])

const client = useSupabaseClient()
const { organization } = useOrganization()
const clients = ref<Client[]>([])
const loading = ref(false)
const isOpen = ref(false)
const searchQuery = ref('')
const container = ref(null)
const activeIndex = ref(-1)

const filteredClients = computed(() => {
    if (!searchQuery.value) return clients.value.slice(0, 5) // Show top 5 recent
    const q = searchQuery.value.toLowerCase()
    return clients.value.filter(c => 
        c.name?.toLowerCase().includes(q) || 
        c.identity_document?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    ).slice(0, 10)
})

const selectedClient = computed(() => {
    return clients.value.find(c => c.id === props.modelValue)
})

const fetchClients = async () => {
    if (!organization.value?.id) return
    loading.value = true
    try {
        const { data } = await client
            .from('clients')
            .select('*')
            .eq('organization_id', organization.value.id)
            .order('created_at', { ascending: false })
        
        if (data) clients.value = data as any
    } finally { loading.value = false }
}

const selectClient = (client: Client | null) => {
    emit('update:modelValue', client ? client.id : '')
    searchQuery.value = ''
    isOpen.value = false
}

const closeDropdown = () => {
    setTimeout(() => { isOpen.value = false }, 200)
}

onClickOutside(container, () => isOpen.value = false)

// Keyboard Nav
const selectNext = () => {
    if (activeIndex.value < filteredClients.value.length - 1) activeIndex.value++
}
const selectPrev = () => {
    if (activeIndex.value > -1) activeIndex.value--
}
const selectCurrent = () => {
    if (activeIndex.value === -1) selectClient(null)
    else if (filteredClients.value[activeIndex.value]) selectClient(filteredClients.value[activeIndex.value])
}

onMounted(fetchClients)

// If modelValue matches a client, ensure it's loaded (fetchClients handles initial load)
</script>
