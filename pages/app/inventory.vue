<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gradient">Inventario</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Gestiona tus productos y existencias desde aquí.</p>
      </div>
      <button @click="openModal" class="btn btn-primary shadow-lg hover:shadow-xl transform transition-all duration-300">
        <span class="relative flex items-center gap-2">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
           Nuevo Producto
        </span>
      </button>
    </div>

    <!-- Stats Review -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       <div class="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-blue)] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20"></div>
          <p class="text-sm font-medium text-[var(--color-text-secondary)]">Total Productos</p>
          <div class="mt-4 flex items-baseline gap-2">
            <p class="text-3xl font-extrabold text-[var(--color-white)]">{{ products.length }}</p>
            <span class="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+12%</span>
          </div>
       </div>
       <div class="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-violet)] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20"></div>
          <p class="text-sm font-medium text-[var(--color-text-secondary)]">Valor en Stock</p>
          <div class="mt-4 flex items-baseline gap-2">
             <p class="text-3xl font-extrabold text-[var(--color-white)]">${{ totalInventoryValue }}</p>
          </div>
       </div>
       <div class="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-green)] opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20"></div>
          <p class="text-sm font-medium text-[var(--color-text-secondary)]">Bajo Stock</p>
           <div class="mt-4 flex items-baseline gap-2">
              <p class="text-3xl font-extrabold text-red-500">{{ lowStockCount }}</p>
              <span v-if="lowStockCount > 0" class="text-xs text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">Atención</span>
           </div>
       </div>
    </div>

    <!-- Product List Table -->
    <div class="glass-panel overflow-hidden">
      <div v-if="products.length > 0">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-left align-middle">
            <thead class="bg-[var(--color-bg-dark)]/50">
              <tr>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Producto</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">SKU</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Precio</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Stock</th>
                <th scope="col" class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border-subtle)]">
              <tr v-for="product in products" :key="product.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors duration-150 group">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                       <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-[var(--color-accent-blue)] font-bold shadow-sm">
                          {{ product.name.charAt(0).toUpperCase() }}
                       </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-bold text-[var(--color-white)] group-hover:text-[var(--color-accent-blue)] transition-colors">{{ product.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-[var(--color-text-secondary)] font-mono bg-[var(--color-bg-dark)] px-2 py-1 rounded-md inline-block border border-[var(--color-border-subtle)]">{{ product.sku || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-[var(--color-white)]">${{ product.price }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                      product.stock > 10 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-red-500/10 text-red-600',
                      'px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border border-current/20'
                    ]">
                    {{ product.stock }} un.
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors p-2 hover:bg-[var(--color-accent-blue)]/10 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    <!-- Empty State / Debug State -->
      <div v-else class="flex flex-col items-center justify-center py-20 px-4 text-center">
         <!-- DIAGNOSTIC BLOCK -->
         <div v-if="!loading && !organization" class="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-lg max-w-lg text-left">
            <h3 class="font-bold text-red-500 mb-2">Modo Diagnóstico (Bucle Detectado)</h3>
            <p class="text-xs text-white mb-2">User ID: {{ user?.id || 'No User' }}</p>
            <p class="text-xs text-white mb-2">Organization State: {{ organization ? 'Loaded' : 'NULL' }}</p>
            <p class="text-xs text-white">Por favor toma una captura de pantalla de esto y envíala.</p>
            <button @click="router.push('/onboarding')" class="mt-4 btn btn-secondary text-xs">Ir a Crear Org (Manual)</button>
             <button @click="logout" class="mt-4 ml-2 btn btn-secondary text-xs">Cerrar Sesión</button>
         </div>

         <div class="w-24 h-24 bg-[var(--color-bg-dark)] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <svg class="w-10 h-10 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-[var(--color-white)] mb-2">No tienes productos aún</h3>
         <p class="text-[var(--color-text-secondary)] max-w-sm mb-8">
            Comienza agregando los productos o servicios que ofreces para llevar el control de stock.
         </p>
         <button @click="openModal" class="btn btn-primary">
            Agregar Primer Producto
         </button>
      </div>
    </div>

    <!-- Modern Modal -->
    <AppModal
      :show="showModal"
      title="Nuevo Producto"
      description="Ingresa los detalles básicos."
      @close="closeModal"
    >
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Nombre del Producto</label>
            <input v-model="newProduct.name" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="Ej. iPhone 13 Pro">
          </div>
          
          <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">SKU / Código</label>
              <input v-model="newProduct.sku" type="text" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="Ej. SKU-001">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Precio ($)</label>
              <input v-model="newProduct.price" type="number" step="0.01" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="0.00">
            </div>
            <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Stock Inicial</label>
              <input v-model="newProduct.stock" type="number" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="0">
            </div>
          </div>
        </div>

      <template #actions>
        <button @click="addProduct" type="button" class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" :disabled="saving">
          {{ saving ? 'Guardando...' : 'Guardar Producto' }}
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

const products = ref([])
const showModal = ref(false)

// ... (omitting lines for brevity in search matching if possible, but replace_file_content requires exact block) 
// Actually I'll match the top and bottom block to be safe.

const saving = ref(false)

const newProduct = ref({
  name: '',
  sku: '',
  price: '',
  stock: ''
})

// Metrics
const totalInventoryValue = computed(() => {
  return products.value.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const lowStockCount = computed(() => {
   return products.value.filter(p => p.stock < 10).length
})

const fetchProducts = async () => {
    try {
        const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false })
        if (error) console.error(error)
        else products.value = data || []
    } catch (e) {
        console.error("Error fetching products", e)
    }
}

const openModal = () => showModal.value = true
const closeModal = () => showModal.value = false

const addProduct = async () => {
  if (!organization.value) {
    alert('Error: No se ha detectado una organización activa. Por favor recarga la página o contacta soporte.')
    return
  }
  if (!newProduct.value.name) return

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

onMounted(async () => {
  await fetchOrganization()
  fetchProducts()
})
</script>
