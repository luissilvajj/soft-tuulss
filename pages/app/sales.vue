<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Movimientos / Ventas</h1>
      <button @click="openModal" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
        Nueva Transacción
      </button>
    </div>

    <!-- Transactions List -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200" v-if="transactions.length > 0">
        <li v-for="trx in transactions" :key="trx.id">
          <div class="px-4 py-4 sm:px-6 flex items-center justify-between">
            <div class="flex items-center">
              <span :class="[trx.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase mr-3']">
                {{ trx.type === 'sale' ? 'Venta' : 'Gasto' }}
              </span>
              <p class="text-sm font-medium text-gray-900">
                 {{ formatDate(trx.date) }}
              </p>
            </div>
            <div class="flex items-center">
              <span class="text-sm font-bold text-gray-900">${{ trx.amount }}</span>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="p-4 text-center text-gray-500">
        No hay movimientos registrados.
      </div>
    </div>

    <!-- New Transaction Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="closeModal"></div>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Registrar Movimiento</h3>
          
          <div class="space-y-4">
            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Tipo</label>
              <select v-model="newTrx.type" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="sale">Venta (Salida)</option>
                <option value="expense">Compra / Gasto (Entrada)</option>
              </select>
            </div>

            <!-- Product Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Producto</label>
              <select v-model="selectedProductId" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="" disabled>Seleccionar producto</option>
                <option v-for="p in products" :key="p.id" :value="p.id">
                  {{ p.name }} (Stock: {{ p.stock }}) - ${{ p.price }}
                </option>
              </select>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Cantidad</label>
              <input v-model.number="quantity" type="number" min="1" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>

            <!-- Total Preview -->
            <div class="text-right text-lg font-bold">
              Total: ${{ computedTotal }}
            </div>
          </div>

          <div class="mt-5 sm:mt-6 flex gap-3">
             <button @click="saveTransaction" type="button" class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:text-sm" :disabled="saving">
              {{ saving ? 'Procesando...' : 'Registrar' }}
            </button>
            <button @click="closeModal" type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">
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

const transactions = ref([])
const products = ref([])
const showModal = ref(false)
const saving = ref(false)

const newTrx = ref({ type: 'sale' })
const selectedProductId = ref('')
const quantity = ref(1)

const fetchTransactions = async () => {
    const { data } = await client.from('transactions').select('*').order('date', { ascending: false })
    if (data) transactions.value = data
}

const fetchProducts = async () => {
    const { data } = await client.from('products').select('*')
    if (data) products.value = data
}

const computedTotal = computed(() => {
    const p = products.value.find(x => x.id === selectedProductId.value)
    return p ? (p.price * quantity.value).toFixed(2) : '0.00'
})

const openModal = async () => {
    await fetchProducts()
    showModal.value = true
}
const closeModal = () => showModal.value = false

const saveTransaction = async () => {
    if (!selectedProductId.value || !organization.value) return

    saving.value = true
    try {
        const product = products.value.find(x => x.id === selectedProductId.value)
        const total = product.price * quantity.value

        // Call our Postgres Function for atomicity
        const { error } = await client.rpc('register_transaction', {
            p_organization_id: organization.value.id,
            p_type: newTrx.value.type,
            p_amount: total,
            p_client_id: null, 
            p_items: [{
                product_id: product.id,
                quantity: quantity.value,
                price: product.price
            }]
        })

        if (error) throw error

        await fetchTransactions()
        closeModal()
        quantity.value = 1
        selectedProductId.value = ''
    } catch (e) {
        alert('Error: ' + e.message)
    } finally {
        saving.value = false
    }
}

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString()
}

onMounted(() => {
    fetchTransactions()
})
</script>
