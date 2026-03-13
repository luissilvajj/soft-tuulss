<template>
  <div>
    <!-- Standard Page Header -->
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-text-heading">Clientes</h1>
        <p class="mt-1 text-sm text-text-secondary">Gestiona tu base de datos de clientes.</p>
    </div>
    
    <!-- Toolbar -->
    <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
         <!-- Search -->
        <div class="relative w-full md:w-64">
            <BaseInput
                v-model="searchQuery" 
                placeholder="Buscar..." 
                type="text"
            >
                 <template #prefix>
                    <span class="text-gray-400">🔍</span>
                </template>
            </BaseInput>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
             <!-- View Toggle -->
             <div class="flex bg-surface-subtle p-1 rounded-lg border border-surface-border">
                <button 
                    @click="viewMode = 'grid'"
                    :class="[
                        'p-2 rounded-md transition-all',
                        viewMode === 'grid' ? 'bg-surface-ground shadow text-primary-600' : 'text-text-secondary hover:text-text-heading'
                    ]"
                    title="Vista Cuadrícula"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                </button>
                <button 
                    @click="viewMode = 'list'"
                    :class="[
                        'p-2 rounded-md transition-all',
                        viewMode === 'list' ? 'bg-surface-ground shadow text-primary-600' : 'text-text-secondary hover:text-text-heading'
                    ]"
                    title="Vista Lista"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>

            <BaseButton 
                variant="primary"
                @click="openModal()"
            >
                <template #icon>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                </template>
                Nuevo Cliente
            </BaseButton>
        </div>
    </div>

    <!-- Stats Review -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       <div class="bg-surface-ground rounded-xl border border-surface-border p-6 shadow-sm flex items-center gap-4 group">
          <div class="p-3 bg-primary-500/10 rounded-xl text-primary-600 dark:text-primary-400">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
             </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-text-secondary">Total Clientes</p>
            <p class="mt-1 text-3xl font-extrabold text-text-heading">{{ clients.length }}</p>
          </div>
       </div>
    </div>

    <!-- Result Area -->
    <UiDataList
        v-if="loading || clients.length > 0"
        :items="clients"
        :columns="columns"
        :loading="loading"
        title-key="name"
        v-model:limit="limit"
        :total="totalClients"
        @sort="handleSort"
    >
        <template #col-client="{ item }">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 border border-primary-500/20">
                    {{ item.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                    <div class="font-bold text-text-heading text-sm flex items-center gap-2">
                        {{ item.name }}
                        <span v-if="item.is_special_taxpayer" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-700 border border-primary-200" title="Contribuyente Especial">CE</span>
                    </div>
                    <div class="text-xs text-text-secondary">{{ item.email || 'Sin email' }}</div>
                </div>
            </div>
        </template>

        <template #col-contact="{ item }">
            <span class="font-mono text-sm text-text-secondary">{{ item.phone || 'N/A' }}</span>
        </template>

        <template #col-identity="{ item }">
             <span class="font-mono text-sm text-text-secondary">{{ item.identity_document || 'N/A' }}</span>
        </template>
        
        <template #col-location="{ item }">
            <span class="text-sm text-text-secondary">{{ item.address ? 'Registrada' : 'N/A' }}</span>
        </template>

        <template #col-actions="{ item }">
             <div class="flex justify-end gap-2 text-right">
                <button v-if="item.phone" @click="openWhatsapp(item)" class="text-status-success hover:text-green-700 text-sm font-bold transition-colors">WhatsApp</button>
                <button @click="openModal(item)" class="text-primary-600 hover:text-primary-800 text-sm font-bold transition-colors">Editar</button>
                <button @click="deleteClient(item.id)" class="text-status-error hover:text-red-700 text-sm font-bold transition-colors">Borrar</button>
            </div>
        </template>

        <!-- Mobile Card Extras -->
        <template #card-subtitle="{ item }">
            <span class="text-xs font-mono text-text-secondary">{{ item.identity_document }}</span>
        </template>

        <template #mobile-actions="{ item }">
             <div class="flex items-center gap-1 text-sm text-text-secondary">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                {{ item.phone }}
             </div>
             <div class="flex gap-3">
                 <button @click="openModal(item)" class="text-primary-600 font-bold text-sm">Editar</button>
             </div>
        </template>
    </UiDataList>

    <!-- Empty State -->
    <div v-else-if="!loading && clients.length === 0" class="glass-panel p-12 text-center border-dashed border-2 border-surface-border rounded-xl">
         <div class="w-24 h-24 bg-surface-subtle rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg class="w-10 h-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-text-heading mb-2">Aún no hay clientes</h3>
         <p class="text-text-secondary max-w-sm mx-auto mb-8">
            Comienza a construir tu base de datos agregando tu primer cliente.
         </p>
         <BaseButton @click="openModal()" variant="primary">
            Agregar Primer Cliente
         </BaseButton>
    </div>

    <!-- Modal -->
    <AppModal 
      :show="showModal" 
      :title="editingId ? 'Editar Cliente' : 'Nuevo Cliente'" 
      description="Información de contacto." 
      @close="closeModal"
    >
      <div class="space-y-4">
           <BaseInput 
                v-model="newClient.name" 
                label="Nombre Completo" 
                placeholder="Ej. Juan Pérez" 
           />
           <BaseInput 
                v-model="newClient.identity_document" 
                label="Cédula / RIF" 
                placeholder="V-12345678" 
           />
           <BaseInput 
                v-model="newClient.email" 
                label="Email" 
                placeholder="juan@empresa.com" 
                type="email"
           />
           <BaseInput 
                v-model="newClient.phone" 
                label="Teléfono" 
                placeholder="0414 1234567" 
           />
           <div class="flex items-center gap-2 pt-2">
                <input 
                    type="checkbox" 
                    id="is_special_taxpayer" 
                    v-model="newClient.is_special_taxpayer" 
                    class="w-4 h-4 text-primary-600 bg-surface-subtle border-surface-border rounded focus:ring-primary-500 focus:ring-2"
                >
                <label for="is_special_taxpayer" class="text-sm font-medium text-text-heading cursor-pointer">
                    Contribuyente Especial (Retenciones IVA)
                </label>
           </div>
      </div>

      <template #actions>
       <BaseButton 
            full-width
            variant="primary"
            :loading="saving"
            @click="saveClient"
       >
         {{ saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar Cliente') }}
       </BaseButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import UiDataList from '~/components/ui/DataList.vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import { useClients } from '~/composables/useClients'

definePageMeta({ layout: 'authenticated' })

const columns = [
  { key: 'client', label: 'Cliente', sortable: true },
  { key: 'contact', label: 'Contacto' },
  { key: 'identity', label: 'Identidad', sortable: true },
  { key: 'location', label: 'Ubicación' },
  { key: 'actions', label: '', class: 'text-right' }
]
useAuthGuard()
const supabase = useSupabaseClient()
const { organization, fetchOrganization } = useOrganization()
// Use Composable
const { clients, totalClients, loading, fetchClients, addClient, updateClient, deleteClient: removeClient, resetClientsState } = useClients()

const showModal = ref(false)
const saving = ref(false)
const viewMode = ref('list')
const editingId = ref(null)
const newClient = ref({ name: '', email: '', phone: '', identity_document: '', address: '', is_special_taxpayer: false })

// Search & Pagination Server-Side Logic
const searchQuery = ref('')
const page = ref(1)
const limit = ref(20)
const sortCol = ref('created_at')
const sortAsc = ref(false)

const totalPages = computed(() => {
    return Math.ceil(totalClients.value / limit.value)
})

const handleSort = (sortData) => {
    const dbKeyMap = {
        'client': 'name',
        'identity': 'identity_document'
    }
    sortCol.value = dbKeyMap[sortData.key] || 'created_at'
    sortAsc.value = sortData.asc
    page.value = 1
    fetchClients({ page: page.value, limit: limit.value, search: searchQuery.value, sortBy: sortCol.value, sortDesc: !sortAsc.value })
}

import { watchDebounced } from '@vueuse/core'

watchDebounced(searchQuery, () => {
    page.value = 1
    if (organization.value?.id) {
        fetchClients({ page: page.value, limit: limit.value, search: searchQuery.value, sortBy: sortCol.value, sortDesc: !sortAsc.value })
    }
}, { debounce: 500 })

watch([page, limit], () => {
    if (organization.value?.id) {
        fetchClients({ page: page.value, limit: limit.value, search: searchQuery.value, sortBy: sortCol.value, sortDesc: !sortAsc.value })
    }
})

const openModal = (client = null) => {
    if (client) {
        editingId.value = client.id
        newClient.value = { ...client, is_special_taxpayer: !!client.is_special_taxpayer }
    } else {
        editingId.value = null
        newClient.value = { name: '', email: '', phone: '', identity_document: '', address: '', is_special_taxpayer: false }
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingId.value = null
    newClient.value = { name: '', email: '', phone: '', identity_document: '', address: '', is_special_taxpayer: false }
}

const saveClient = async () => {
    if (!newClient.value.name || !organization.value) return
    saving.value = true
    try {
        const payload = { ...newClient.value }
        if (editingId.value) {
             await updateClient(editingId.value, payload)
        } else {
             await addClient(payload)
        }
        closeModal()
    } catch (e) {
        alert(e.message)
    } finally {
        saving.value = false
    }
}

const deleteClient = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return
    try {
        await removeClient(id)
    } catch (e) {
        alert('Error eliminando: ' + e.message)
    }
}

const openWhatsapp = (client) => {
    if (!client.phone) return
    const phone = client.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}`, '_blank')
}

watch(() => organization.value?.id, (newId) => {
   if(newId) {
       page.value = 1
       fetchClients({ page: page.value, limit: limit.value })
   }
}, { immediate: false })

onMounted(async () => {
  if(!organization.value?.id) await fetchOrganization()
  if(organization.value?.id && clients.value.length === 0) {
      fetchClients({ page: page.value, limit: limit.value })
  }
})

onUnmounted(() => {
    resetClientsState()
})
</script>
