<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gradient">Movimientos</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Registro histórico de ventas y gastos.</p>
      </div>
      <button @click="openModal" class="btn btn-primary shadow-lg hover:shadow-xl transform transition-all duration-300">
        <span class="relative flex items-center gap-2">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
           Nueva Transacción
        </span>
      </button>
    </div>

    <!-- Financial Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       <div class="glass-panel p-6 flex items-center gap-4 group">
          <div class="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-[var(--color-text-secondary)]">Total Ventas</p>
            <p class="mt-1 text-2xl font-extrabold text-[var(--color-white)]">${{ totalSales }}</p>
          </div>
       </div>
       <div class="glass-panel p-6 flex items-center gap-4 group">
          <div class="p-3 bg-red-500/10 rounded-xl text-red-600">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-[var(--color-text-secondary)]">Total Gastos</p>
            <p class="mt-1 text-2xl font-extrabold text-[var(--color-white)]">${{ totalExpenses }}</p>
          </div>
       </div>
       <div class="p-6 rounded-2xl text-white relative overflow-hidden shadow-lg" style="background: var(--gradient-logo);">
          <div class="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
          <p class="text-sm font-medium text-white/90 relative z-10">Balance Neto</p>
          <p class="mt-2 text-3xl font-extrabold relative z-10">${{ netBalance }}</p>
       </div>
    </div>

    <!-- Transactions List -->
    <div class="glass-panel overflow-hidden">
      <div v-if="transactions.length > 0">
        <div class="overflow-x-auto">
           <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-left align-middle">
            <thead class="bg-[var(--color-bg-dark)]/50">
              <tr>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Tipo</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fecha</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Descripción</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Monto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border-subtle)]">
               <tr v-for="trx in transactions" :key="trx.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap">
                     <span :class="[
                        trx.type === 'sale' 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-red-500/10 text-red-600',
                        'px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wide border border-current/20'
                     ]">
                        {{ trx.type === 'sale' ? 'Venta' : 'Gasto' }}
                     </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                     {{ formatDate(trx.date) }}
                  </td>
                   <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-white)] font-medium">
                     Transacción #{{ trx.id.slice(0, 8) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                     <span :class="[
                        trx.type === 'sale' ? 'text-emerald-600' : 'text-[var(--color-white)]',
                        'text-sm font-bold'
                     ]">
                        {{ trx.type === 'sale' ? '+' : '-' }} ${{ trx.amount }}
                     </span>
                  </td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>
       <div v-else class="flex flex-col items-center justify-center py-20 px-4 text-center">
         <div class="w-24 h-24 bg-[var(--color-bg-dark)] rounded-full flex items-center justify-center mb-6 shadow-inner">
             <svg class="w-10 h-10 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-[var(--color-white)] mb-2">Sin movimientos</h3>
         <p class="text-[var(--color-text-secondary)] max-w-sm mb-8">
            Registra tu primera venta o gasto para empezar a ver métricas financieras.
         </p>
      </div>
    </div>

    <!-- New Transaction Modal -->
    <AppModal
      :show="showModal"
      title="Registrar Movimiento"
      description="Selecciona producto y cantidad."
      @close="closeModal"
    >
        <div class="space-y-5">
        <!-- Type Selector -->
        <div>
          <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Tipo de Transacción</label>
          <div class="grid grid-cols-2 gap-3 p-1 bg-[var(--color-bg-dark)] rounded-xl border border-[var(--color-border-subtle)]">
              <button 
              @click="newTrx.type = 'sale'"
              :class="[
                  newTrx.type === 'sale' 
                  ? 'bg-[var(--color-bg-subtle)] text-[var(--color-white)] shadow-sm' 
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)]',
                  'py-2 px-4 rounded-lg text-sm font-bold transition-all'
              ]">
              Venta (Ingreso)
              </button>
              <button 
              @click="newTrx.type = 'expense'"
              :class="[
                  newTrx.type === 'expense' 
                  ? 'bg-[var(--color-bg-subtle)] text-[var(--color-white)] shadow-sm' 
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-white)]',
                  'py-2 px-4 rounded-lg text-sm font-bold transition-all'
              ]">
              Gasto (Salida)
              </button>
          </div>
        </div>

        <!-- Product Selection -->
        <div>
          <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Producto</label>
          <select v-model="selectedProductId" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all appearance-none cursor-pointer">
            <option value="" disabled selected>Selecciona un producto...</option>
            <option v-for="p in products" :key="p.id" :value="p.id">
              {{ p.name }} (Stock: {{ p.stock }}) - ${{ p.price }}
            </option>
          </select>
        </div>

        <!-- Quantity -->
        <div>
            <div class="flex justify-between">
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Cantidad</label>
              <span class="text-sm font-bold text-[var(--color-accent-blue)]">Total: ${{ computedTotal }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="quantity > 1 ? quantity-- : null" class="p-3 rounded-xl bg-[var(--color-bg-dark)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
              </button>
              <input v-model.number="quantity" type="number" min="1" class="flex-1 text-center px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] font-bold text-lg outline-none focus:border-[var(--color-accent-blue)]">
              <button @click="quantity++" class="p-3 rounded-xl bg-[var(--color-bg-dark)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
            </div>
        </div>
        </div>

      <template #actions>
        <button @click="saveTransaction" type="button" class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" :disabled="saving">
          {{ saving ? 'Procesando...' : 'Confirmar Transacción' }}
        </button>
        <button @click="closeModal" type="button" class="px-6 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-bg-dark)] focus:outline-none transition-colors">
          Cancelar
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard'
})
useAuthGuard()

const client = useSupabaseClient()
const { organization, fetchOrganization } = useOrganization()

const transactions = ref([])
const products = ref([])
const showModal = ref(false)
const saving = ref(false)

const newTrx = ref({ type: 'sale' })
const selectedProductId = ref('')
const quantity = ref(1)

// Metrics
const totalSales = computed(() => {
   return transactions.value
      .filter(t => t.type === 'sale')
      .reduce((acc, t) => acc + t.amount, 0)
      .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const totalExpenses = computed(() => {
   return transactions.value
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
      .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const netBalance = computed(() => {
   const sales = transactions.value.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0)
   const expenses = transactions.value.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
   return (sales - expenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

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

onMounted(async () => {
    await fetchOrganization()
    fetchTransactions()
})
</script>
