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
        class="w-full bg-surface-subtle border border-surface-border rounded-xl py-3 pl-4 pr-10 text-text-heading focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder-text-secondary/50 font-medium truncate"
        placeholder="Buscar por nombre, cédula o RIF..."
      />
      
      <!-- Icons (Loading or Clear or Search) -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" @click="iconClick">
         <span v-if="loading" class="animate-spin text-gray-400">⟳</span>
         <span v-else-if="selectedClient || searchQuery" class="text-gray-400 hover:text-red-500 transition-colors" title="Limpiar">&times;</span>
         <svg v-else class="w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
    </div>

    <!-- Results Dropdown -->
    <div v-if="isOpen && (searchQuery || filteredClients.length > 0)" class="absolute top-full left-0 right-0 mt-2 bg-surface-section border border-surface-border rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50 ring-1 ring-black/5 dark:ring-white/10 divide-y divide-surface-border">
        
        <div v-if="filteredClients.length === 0" class="p-4 text-center text-text-secondary text-sm flex flex-col items-center gap-2">
            <p>No encontrado.</p>
            <button 
                type="button"
                class="px-4 py-2 bg-surface-subtle text-text-heading rounded-lg font-bold hover:bg-surface-section transition-colors w-full"
                @click="$emit('create-client')"
            >
                + Crear "{{ searchQuery }}"
            </button>
        </div>

        <div 
            v-for="(client, index) in filteredClients" 
            :key="client.id"
            @click="selectClient(client)"
            :class="['p-3 cursor-pointer hover:bg-surface-subtle flex flex-col transition-colors', activeIndex === index ? 'bg-surface-subtle' : '']"
        >
            <span class="font-bold text-text-heading">{{ client.name }}</span>
            <span class="text-xs text-text-secondary" v-if="client.identity_document || client.email">
                Identidad: {{ client.identity_document || 'N/A' }} • {{ client.email }}
            </span>
        </div>
    </div>
    
    <!-- Link to create new client -->
    <button v-if="!hideCreateButton" type="button" class="absolute -bottom-6 right-0 text-xs font-bold text-[var(--color-primary)] hover:underline" @click="$emit('create-client')">
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
  modelValue?: string,
  hideCreateButton?: boolean
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

// Normaliza strings de cédula/RIF para búsqueda flexible
// V-26.899.123 -> 26899123, J-40123456-7 -> 401234567
const normalizeIdentity = (str: string) => {
    if (!str) return ''
    return str.replace(/[VJEGP\-\.\s]/gi, '').toLowerCase()
}

const filteredClients = computed(() => {
    if (!clients.value) return []
    // Si la barra está vacía, no mostrar ninguna lista desplegable
    if (!searchQuery.value) return [] 
    
    const rawQuery = searchQuery.value.trim()
    const q = rawQuery.toLowerCase()
    const qNormalized = normalizeIdentity(rawQuery)
    
    const scoredClients = clients.value.map(c => {
        let score = 0
        const nameLc = (c.name || '').toLowerCase()
        const emailLc = (c.email || '').toLowerCase()
        const doc = (c.identity_document || '').toLowerCase()
        const docNormalized = normalizeIdentity(doc)

        // Exact Matches
        if (doc === q || (qNormalized && docNormalized === qNormalized)) score += 100
        else if (nameLc === q) score += 100
        
        // Starts with (Prefix Matches)
        if (doc.startsWith(q) || (qNormalized && docNormalized.startsWith(qNormalized))) score += 80
        if (nameLc.startsWith(q)) score += 70
        else if (nameLc.split(' ').some(word => word.startsWith(q))) score += 60
        
        if (emailLc.startsWith(q)) score += 50

        // Substring Matches
        if (score === 0) {
            if ((qNormalized && docNormalized.includes(qNormalized)) || doc.includes(q)) score += 40
            if (nameLc.includes(q)) score += 30
            if (emailLc.includes(q)) score += 10
        }

        return { client: c, score }
    })

    return scoredClients
        .filter(item => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            // Alphabetical tie-breaker
            return a.client.name.localeCompare(b.client.name)
        })
        .map(item => item.client)
        .slice(0, 10)
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
    if (clients.value.length === 0) fetchClients()
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
    if (!organization.value?.id) {
        console.warn('ClientSelector: No Organization ID yet.')
        return
    }
    loading.value = true
    try {
        console.log('ClientSelector: Fetching clients for org', organization.value.id)
        const { data, error } = await client
            .from('clients')
            .select('id, organization_id, name, email, phone, identity_document, is_special_taxpayer, created_at')
            .eq('organization_id', organization.value.id)
            .order('created_at', { ascending: false })
        
        if (error) throw error
        if (data) {
            clients.value = data as any
            console.log('ClientSelector: Loaded', data.length, 'clients')
        }
    } catch (e) {
        console.error('ClientSelector Error:', e)
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



// onMountedremoved to avoid double fetch with immediate watch

watch(() => organization.value?.id, (newId) => {
    if (newId && clients.value.length === 0) fetchClients()
}, { immediate: true })

// If modelValue matches a client, ensure it's loaded (fetchClients handles initial load)
</script>
