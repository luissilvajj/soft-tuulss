<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gradient">Clientes</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Gestiona tu base de datos de clientes.</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div class="flex bg-[var(--color-bg-subtle)] p-1 rounded-lg border border-[var(--color-border-subtle)]">
            <button 
                @click="viewMode = 'grid'"
                :class="[
                    'p-2 rounded-md transition-all',
                    viewMode === 'grid' ? 'bg-[var(--color-bg-dark)] shadow text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                ]"
                title="Vista Cuadrícula"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </button>
            <button 
                @click="viewMode = 'list'"
                :class="[
                    'p-2 rounded-md transition-all',
                    viewMode === 'list' ? 'bg-[var(--color-bg-dark)] shadow text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                ]"
                title="Vista Lista"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>

        <button @click="openModal" class="btn btn-primary shadow-lg hover:shadow-xl transform transition-all duration-300">
            <span class="relative flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            Nuevo Cliente
            </span>
        </button>
      </div>
    </div>

    <!-- Stats Review -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       <div class="glass-panel p-6 flex items-center gap-4 group">
          <div class="p-3 bg-[var(--color-accent-blue)]/10 rounded-xl text-[var(--color-accent-blue)]">
             <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-[var(--color-text-secondary)]">Total Clientes</p>
            <p class="mt-1 text-3xl font-extrabold text-[var(--color-white)]">{{ clients.length }}</p>
          </div>
       </div>
    </div>

    <!-- View Content -->
    <div v-if="clients.length > 0">
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="client in clients" :key="client.id" class="glass-panel p-6 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg class="w-24 h-24 text-[var(--color-accent-blue)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>

                <div class="flex items-center gap-4 mb-4 relative z-10">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
                        {{ client.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-[var(--color-white)] truncate">{{ client.name }}</h3>
                        <p class="text-xs text-[var(--color-accent-blue)] font-bold uppercase tracking-wider">Cliente</p>
                    </div>
                </div>
                
                <div class="space-y-3 relative z-10">
                    <div class="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                        <div class="w-8 h-8 rounded-lg bg-[var(--color-bg-dark)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border-subtle)]">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <span class="truncate">{{ client.email || 'Sin email' }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                        <div class="w-8 h-8 rounded-lg bg-[var(--color-bg-dark)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border-subtle)]">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </div>
                        <span class="truncate">{{ client.phone || 'Sin teléfono' }}</span>
                    </div>

                    <!-- Grid Actions -->
                     <div class="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-subtle)] mt-2">
                         <button 
                            v-if="client.phone"
                            @click="openWhatsapp(client)"
                            class="p-1.5 text-green-500 hover:bg-green-50/10 rounded-lg transition-colors"
                            title="WhatsApp"
                        >
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </button>
                        <button 
                            @click="openModal(client)"
                            class="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
                            title="Editar"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button 
                            @click="deleteClient(client.id)"
                            class="p-1.5 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50/10 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- List View -->
        <div v-else class="glass-panel overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border-subtle)]">
                    <tr>
                        <th class="p-4 font-semibold text-[var(--color-text-secondary)] text-xs uppercase">Cliente</th>
                        <th class="p-4 font-semibold text-[var(--color-text-secondary)] text-xs uppercase">Documento</th>
                        <th class="p-4 font-semibold text-[var(--color-text-secondary)] text-xs uppercase">Contacto</th>
                        <th class="p-4 font-semibold text-[var(--color-text-secondary)] text-xs uppercase text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                    <tr v-for="client in clients" :key="client.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors">
                        <td class="p-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                    {{ client.name.charAt(0).toUpperCase() }}
                                </div>
                                <span class="font-medium text-[var(--color-text-primary)]">{{ client.name }}</span>
                            </div>
                        </td>
                        <td class="p-4 font-mono text-[var(--color-text-secondary)]">
                            {{ client.identity_document || '-' }}
                        </td>
                         <td class="p-4 text-[var(--color-text-secondary)]">
                            <div class="flex flex-col gap-0.5">
                                <span>{{ client.email }}</span>
                                <span class="text-xs opacity-70">{{ client.phone }}</span>
                            </div>
                        </td>
                        <td class="p-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button 
                                    v-if="client.phone"
                                    @click="openWhatsapp(client)"
                                    class="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                    title="WhatsApp"
                                >
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                </button>
                                <button 
                                    @click="openModal(client)"
                                    class="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button 
                                    @click="deleteClient(client.id)"
                                    class="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Empty State -->
    <div v-else class="glass-panel p-12 text-center">
         <div class="w-24 h-24 bg-[var(--color-bg-dark)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg class="w-10 h-10 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-[var(--color-white)] mb-2">Aún no hay clientes</h3>
         <p class="text-[var(--color-text-secondary)] max-w-sm mx-auto mb-8">
            Comienza a construir tu base de datos agregando tu primer cliente.
         </p>
         <button @click="openModal()" class="btn btn-primary">
            Agregar Primer Cliente
         </button>
    </div>

    <!-- Modal -->
    <AppModal 
      :show="showModal" 
      :title="editingId ? 'Editar Cliente' : 'Nuevo Cliente'" 
      description="Información de contacto." 
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
           <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Nombre Completo</label>
           <input v-model="newClient.name" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="Ej. Juan Pérez">
        </div>
        <div>
           <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Cédula / RIF</label>
           <input v-model="newClient.identity_document" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="V-12345678">
        </div>
        <div>
           <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Email</label>
           <input v-model="newClient.email" type="email" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="juan@empresa.com">
        </div>
         <div>
           <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Teléfono</label>
           <input v-model="newClient.phone" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="0414 1234567">
        </div>
      </div>

      <template #actions>
        <button @click="saveClient" type="button" class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" :disabled="saving">
         {{ saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar Cliente') }}
       </button>
       <button @click="closeModal" type="button" class="px-6 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-bg-dark)] focus:outline-none transition-colors">
         Cancelar
       </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })
useAuthGuard()
const supabase = useSupabaseClient()
const { organization, fetchOrganization } = useOrganization()

const clients = ref([])
const showModal = ref(false)
const saving = ref(false)
const viewMode = ref('grid')
const editingId = ref(null)
const newClient = ref({ name: '', email: '', phone: '', identity_document: '' })

const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (data) clients.value = data
}

const openModal = (client = null) => {
    if (client) {
        editingId.value = client.id
        newClient.value = { ...client }
    } else {
        editingId.value = null
        newClient.value = { name: '', email: '', phone: '', identity_document: '' }
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingId.value = null
    newClient.value = { name: '', email: '', phone: '', identity_document: '' }
}

const saveClient = async () => {
    if (!newClient.value.name || !organization.value) return
    saving.value = true
    try {
        if (editingId.value) {
             const { error } = await supabase.from('clients')
                .update({ ...newClient.value })
                .eq('id', editingId.value)
             if (error) throw error
        } else {
            const { error } = await supabase.from('clients').insert({
                organization_id: organization.value.id,
                ...newClient.value
            })
            if (error) throw error
        }
        
        await fetchClients()
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
        const { error } = await supabase.from('clients').delete().eq('id', id)
        if (error) throw error
        clients.value = clients.value.filter(c => c.id !== id)
    } catch (e) {
        alert('Error eliminando: ' + e.message)
    }
}

const openWhatsapp = (client) => {
    if (!client.phone) return
    const phone = client.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}`, '_blank')
}

onMounted(async () => {
  await fetchOrganization()
  fetchClients()
})
</script>
