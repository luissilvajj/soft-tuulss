<template>
  <div class="relative group" ref="container">
    <div class="relative">
      <!-- Search Input / Display -->
      <input 
        ref="timerInput"
        type="text" 
        :value="isOpen ? searchQuery : (selectedClient ? selectedClient.name : searchQuery)"
        @input="handleInput"
        @focus="handleFocus"
        @keydown.down.prevent="selectNext"
        @keydown.up.prevent="selectPrev"
        @keydown.enter.prevent="selectCurrent"
        @keydown.esc="closeDropdown"
        class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-xl py-3 pl-4 pr-10 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none transition-all placeholder-gray-400 font-medium truncate"
        placeholder="Buscar cliente (Nombre o Cédula)..."
      />
      
      <!-- Icons (Loading or Clear or Search) -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" @click="iconClick">
         <span v-if="loading" class="animate-spin text-gray-400">⟳</span>
         <span v-else-if="selectedClient || searchQuery" class="text-gray-400 hover:text-red-500 transition-colors" title="Limpiar">&times;</span>
         <svg v-else class="w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
    </div>

    <!-- Results Dropdown -->
    <div v-if="isOpen && (searchQuery || filteredClients.length > 0)" class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto ring-1 ring-black/5 divide-y divide-gray-50">
        
        <div v-if="filteredClients.length === 0" class="p-4 text-center text-gray-400 text-sm">
            <p>No encontrado.</p>
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
    if (!searchQuery.value) return clients.value.slice(0, 5) 
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

// Input handling
const handleInput = (e: Event) => {
    searchQuery.value = (e.target as HTMLInputElement).value
    isOpen.value = true
    if (props.modelValue && searchQuery.value !== selectedClient.value?.name) {
         emit('update:modelValue', '') // Clear selection if typing
    }
}

const handleFocus = () => {
    isOpen.value = true
    // Optional: if focused and has selection, maybe clear query to allow search? 
    // Current behavior: keeps name, user must delete to search. acceptable.
}

const iconClick = () => {
    if (selectedClient.value || searchQuery.value) {
        emit('update:modelValue', '')
        searchQuery.value = ''
        isOpen.value = false
        // focus input
    }
}


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

const selectCurrent = () => {
    if (activeIndex.value === -1) selectClient(null)
    else if (filteredClients.value[activeIndex.value]) selectClient(filteredClients.value[activeIndex.value])
}

onMounted(() => {
    if (organization.value?.id) fetchClients()
})

watch(() => organization.value, (newOrg) => {
    if (newOrg?.id) fetchClients()
}, { immediate: true })

// If modelValue matches a client, ensure it's loaded (fetchClients handles initial load)
</script>
