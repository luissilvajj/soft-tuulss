<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Inventario</h1>
      <button @click="openModal" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
        Nuevo Producto
      </button>
    </div>

    <!-- Product List -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200" v-if="products.length > 0">
        <li v-for="product in products" :key="product.id">
          <div class="px-4 py-4 sm:px-6 flex items-center justify-between">
            <div class="flex items-center truncate">
              <div class="ml-2 flex-shrink-0 flex flex-col">
                <p class="text-sm font-medium text-indigo-600 truncate">{{ product.name }}</p>
                <p class="text-xs text-gray-500">{{ product.sku }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
               <div class="text-sm text-gray-900 font-bold">${{ product.price }}</div>
               <div :class="[product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                 {{ product.stock }} un.
               </div>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="p-4 text-center text-gray-500">
        No hay productos registrados.
      </div>
    </div>

    <!-- Add Product Modal (Simple implementation) -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Agregar Producto</h3>
            <div class="mt-4 space-y-4">
              <input v-model="newProduct.name" type="text" placeholder="Nombre del Producto" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
              <input v-model="newProduct.sku" type="text" placeholder="SKU / Código" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
              <div class="flex gap-2">
                <input v-model="newProduct.price" type="number" placeholder="Precio" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
                <input v-model="newProduct.stock" type="number" placeholder="Stock Inicial" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 flex gap-3">
            <button @click="addProduct" type="button" class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
             <button @click="closeModal" type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useSupabaseClient()
const { organization } = useOrganization()

const products = ref([])
const showModal = ref(false)
const saving = ref(false)

const newProduct = ref({
  name: '',
  sku: '',
  price: '',
  stock: ''
})

const fetchProducts = async () => {
    // RLS handles filtering by org automatically, but we can explicit if needed.
    // relying on RLS requires policies to be correct (using get_auth_org_ids()).
    // If not, we get empty or error.
    const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else products.value = data
}

const openModal = () => showModal.value = true
const closeModal = () => showModal.value = false

const addProduct = async () => {
  if (!newProduct.value.name || !organization.value) return

  saving.value = true
  try {
    const { error } = await client.from('products').insert({
      organization_id: organization.value.id,
      name: newProduct.value.name,
      sku: newProduct.value.sku,
      price: parseFloat(newProduct.value.price) || 0,
      stock: parseInt(newProduct.value.stock) || 0
    })

    if (error) throw error
    
    await fetchProducts()
    closeModal()
    newProduct.value = { name: '', sku: '', price: '', stock: '' }
  } catch (e) {
    alert('Error al guardar: ' + e.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
