<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Clientes</h1>
      <button @click="openModal" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
        Nuevo Cliente
      </button>
    </div>

    <!-- Clients List -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200" v-if="clients.length > 0">
        <li v-for="client in clients" :key="client.id">
          <div class="px-4 py-4 sm:px-6 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-indigo-600">{{ client.name }}</p>
              <p class="text-xs text-gray-500">{{ client.email }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-900">{{ client.phone }}</p>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="p-4 text-center text-gray-500">
        No hay clientes registrados.
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="closeModal"></div>
         <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Agregar Cliente</h3>
          <div class="space-y-4">
            <input v-model="newClient.name" type="text" placeholder="Nombre" class="block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <input v-model="newClient.email" type="email" placeholder="Email" class="block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <input v-model="newClient.phone" type="text" placeholder="Teléfono" class="block w-full border border-gray-300 rounded-md shadow-sm p-2">
          </div>
          <div class="mt-5 sm:mt-6 flex gap-3">
             <button @click="saveClient" type="button" class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:text-sm" :disabled="saving">Guardar</button>
            <button @click="closeModal" type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const supabase = useSupabaseClient()
const { organization } = useOrganization()

const clients = ref([])
const showModal = ref(false)
const saving = ref(false)
const newClient = ref({ name: '', email: '', phone: '' })

const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*')
    if (data) clients.value = data
}

const openModal = () => showModal.value = true
const closeModal = () => showModal.value = false

const saveClient = async () => {
    if (!newClient.value.name || !organization.value) return
    saving.value = true
    try {
        const { error } = await supabase.from('clients').insert({
            organization_id: organization.value.id,
            ...newClient.value
        })
        if (error) throw error
        await fetchClients()
        closeModal()
        newClient.value = { name: '', email: '', phone: '' }
    } catch (e) {
        alert(e.message)
    } finally {
        saving.value = false
    }
}

onMounted(fetchClients)
</script>
