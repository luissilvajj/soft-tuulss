<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gradient">Inventario</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Gestiona tus productos y existencias desde aquí.</p>
        
        <!-- DEBUG ALERT: View Permissions State -->
        <div v-if="!canEditInventory && !loading" class="mt-2 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded inline-block border border-yellow-500/20">
            <span class="font-bold">⚠️ Modo Visualización:</span> No tienes permisos de Admin o no cargó la empresa.
            <button @click="fetchOrganization(true)" class="underline ml-2 hover:text-yellow-400">Reintentar</button>
        </div>
      </div>
      <button v-if="canEditInventory" @click="openModal" class="btn btn-primary shadow-lg hover:shadow-xl transform transition-all duration-300">
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

    <!-- Product List -->
    <div class="glass-panel overflow-hidden">
        <div v-if="products.length > 0">
           <!-- Mobile Card View -->
           <div class="block md:hidden space-y-4">
              <div v-for="product in products" :key="product.id" class="bg-[var(--color-bg-subtle)] p-4 rounded-xl border border-[var(--color-border-subtle)] space-y-3 relative group">
                   <div class="flex justify-between items-start">
                       <div>
                          <p class="font-bold text-[var(--color-white)]">{{ product.name }}</p>
                          <p class="text-xs text-[var(--color-text-secondary)]">{{ product.category || 'Sin categoría' }}</p>
                       </div>
                       <div class="flex flex-col items-end">
                           <span class="font-bold text-[var(--color-white)] text-lg">${{ product.price.toFixed(2) }}</span>
                           <span v-if="product.cost" class="text-xs text-[var(--color-text-secondary)]">Costo: ${{ product.cost }}</span>
                       </div>
                  </div>
                  <div class="flex justify-between items-center border-t border-[var(--color-border-subtle)] pt-3">
                      <div class="flex items-center gap-2">
                          <span :class="[
                              'px-2 py-1 text-xs font-bold rounded-full border',
                              product.stock <= (product.min_stock || 0) ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          ]">
                              Stock: {{ product.stock }}
                          </span>
                      </div>
                      <div class="flex gap-2" v-if="canEditInventory">
                           <button @click="openRestockModal(product)" class="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Restock">
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           </button>
                           <button @click="openEditModal(product)" class="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                           </button>
                           <button @click="confirmDelete(product)" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                           </button>
                      </div>
                  </div>
              </div>
           </div>

           <!-- Desktop Table View -->
           <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-left align-middle">
                <thead class="bg-[var(--color-bg-dark)]/50">
                    <tr>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Producto</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-center">Stock</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Precio</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Costo</th>
                        <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Valor Total</th>
                         <th class="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                    <tr v-for="product in products" :key="product.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors duration-150 group">
                        <td class="px-6 py-4">
                            <div>
                                <div class="text-sm font-bold text-[var(--color-white)] group-hover:text-[var(--color-accent-blue)] transition-colors">{{ product.name }}</div>
                                <div class="text-xs text-[var(--color-text-secondary)]">{{ product.category || 'General' }}</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span :class="[
                                'px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full border',
                                product.stock <= (product.min_stock || 0) ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            ]">
                                {{ product.stock }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right text-sm font-medium text-[var(--color-white)]">
                            ${{ (product.price || 0).toFixed(2) }}
                        </td>
                         <td class="px-6 py-4 text-right text-sm text-[var(--color-text-secondary)]">
                            ${{ (product.cost || 0).toFixed(2) }}
                        </td>
                        <td class="px-6 py-4 text-right text-sm text-[var(--color-text-secondary)] font-mono">
                            ${{ (product.price * product.stock).toFixed(2) }}
                        </td>
                         <td class="px-6 py-4 text-right text-sm font-medium">
                            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" v-if="canEditInventory">
                                <button @click="openRestockModal(product)" class="text-emerald-500 hover:text-emerald-400 p-1" title="Agregar Stock">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </button>
                                <button @click="openEditModal(product)" class="text-[var(--color-accent-blue)] hover:text-blue-400 p-1">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </button>
                                <button @click="confirmDelete(product)" class="text-red-400 hover:text-red-300 p-1">
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
        <div v-else class="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div class="w-24 h-24 bg-[var(--color-bg-dark)] rounded-full flex items-center justify-center mb-6 shadow-inner">
                 <svg class="w-10 h-10 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-[var(--color-white)] mb-2">Inventario Vacío</h3>
            <p class="text-[var(--color-text-secondary)] max-w-sm mb-8">
                Comienza agregando tus productos o servicios para controlarlos.
            </p>
             <button @click="openModal" class="btn btn-primary">
                Agregar Primer Producto
            </button>
        </div>
    </div>

    <!-- Product Modal -->
    <AppModal
      :show="showModal"
      :title="isEditing ? 'Editar Producto' : 'Nuevo Producto'"
      :description="isEditing ? 'Modifica los detalles del producto.' : 'Ingresa los detalles básicos.'"
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

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Precio ($)</label>
              <input v-model="newProduct.price" type="number" step="0.01" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="0.00">
            </div>
             <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Costo ($)</label>
              <input v-model="newProduct.cost" type="number" step="0.01" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="0.00">
            </div>
            <div>
              <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Stock Inicial</label>
              <input v-model="newProduct.stock" type="number" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none transition-all placeholder-[var(--color-text-secondary)]/50" placeholder="0">
            </div>
          </div>
        </div>

      <template #actions>
        <button @click="handleSaveProduct" type="button" class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" :disabled="saving">
          {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Guardar Producto') }}
        </button>
          <button @click="closeModal" type="button" class="px-6 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-bg-dark)] focus:outline-none transition-colors">
          Cancelar
        </button>
      </template>
    </AppModal>

    <!-- Restock Modal -->
    <AppModal
      :show="showRestockModal"
      title="Agregar Stock"
      description="Ingresa la cantidad a agregar al inventario."
      @close="showRestockModal = false"
    >
        <div class="space-y-5">
             <div class="p-4 bg-[var(--color-bg-subtle)] rounded-lg text-sm">
                <p>Producto: <span class="font-bold text-[var(--color-white)]">{{ restockTarget?.name }}</span></p>
                <p>Stock Actual: <span class="font-mono text-[var(--color-accent-blue)]">{{ restockTarget?.stock }}</span></p>
             </div>
             
             <div>
                <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Cantidad a Agregar</label>
                <input v-model.number="restockForm.quantity" type="number" min="1" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none" placeholder="0">
             </div>

             <div>
                <label class="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">Costo Unitario ($)</label>
                <input v-model.number="restockForm.cost" type="number" min="0" step="0.01" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-dark)] text-[var(--color-white)] focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent outline-none" placeholder="0.00">
             </div>
        </div>

        <template #actions>
             <button @click="handleRestock" type="button" class="btn btn-primary" :disabled="saving || restockForm.quantity <= 0">
                 {{ saving ? 'Procesando...' : 'Agregar Stock' }}
             </button>
             <button @click="showRestockModal = false" type="button" class="px-6 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-bg-dark)] focus:outline-none transition-colors">
               Cancelar
             </button>
        </template>
    </AppModal>
  </div>
</template>

<script setup>
import { usePermissions } from '~/composables/usePermissions'
import { useInventory } from '~/composables/useInventory'
import AppModal from '~/components/AppModal.vue'

definePageMeta({
  layout: 'dashboard'
})
useAuthGuard()

const { organization, fetchOrganization } = useOrganization()
const { canEditInventory } = usePermissions()
const { products, loading, fetchProducts, addProduct: createProduct, updateProduct, restockProduct } = useInventory()
const client = useSupabaseClient() // For delete override

// Product Form Logic
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)

const newProduct = ref({
  name: '',
  sku: '',
  price: '',
  cost: '',
  stock: ''
})

const openEditModal = (product) => {
    isEditing.value = true
    editingId.value = product.id
    newProduct.value = {
        name: product.name,
        sku: product.sku,
        price: product.price,
        cost: product.cost || 0,
        stock: product.stock
    }
    showModal.value = true
}

const confirmDelete = async (product) => {
    if(!confirm('¿Eliminar producto "' + product.name + '"?')) return
    try {
        const { error } = await client.from('products').delete().eq('id', product.id)
        if (error) throw error
        if (error) throw error
        
        const { logAction } = useAuditLogs()
        logAction('product_deleted', { name: product.name, sku: product.sku })

        await fetchProducts(true)
    } catch (e) {
        alert('Error al eliminar: ' + e.message)
    }
}

const openModal = () => {
    isEditing.value = false
    editingId.value = null
    newProduct.value = { name: '', sku: '', price: '', cost: '', stock: '' }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    isEditing.value = false
    editingId.value = null
    newProduct.value = { name: '', sku: '', price: '', cost: '', stock: '' }
}

const handleSaveProduct = async () => {
  if (!organization.value) {
    alert('Error: No se ha detectado una organización activa.')
    return
  }
  if (!newProduct.value.name) return

  saving.value = true
  try {
    const payload = {
      name: newProduct.value.name,
      sku: newProduct.value.sku,
      price: parseFloat(newProduct.value.price) || 0,
      cost: parseFloat(newProduct.value.cost) || 0,
      stock: parseInt(newProduct.value.stock) || 0
    }

    if (isEditing.value && editingId.value) {
        await updateProduct(editingId.value, payload)
    } else {
        await createProduct(payload)
    }
    
    closeModal()
  } catch (e) {
    alert('Error al guardar: ' + e.message)
  } finally {
    saving.value = false
  }
}

// Restock Logic
const showRestockModal = ref(false)
const restockTarget = ref(null)
const restockForm = ref({ quantity: 0, cost: 0 })

const openRestockModal = (product) => {
    restockTarget.value = product
    restockForm.value = { quantity: 1, cost: product.cost || 0 }
    showRestockModal.value = true
}

const handleRestock = async () => {
    if (!restockTarget.value) return
    saving.value = true
    try {
        await restockProduct(restockTarget.value.id, restockForm.value.quantity, restockForm.value.cost)
        showRestockModal.value = false
        alert('Stock actualizado')
    } catch (e) {
        alert('Error: ' + e.message)
    } finally {
        saving.value = false
    }
}

// Metrics
const totalInventoryValue = computed(() => {
    return products.value.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const lowStockCount = computed(() => {
    return products.value.filter(p => p.stock <= (p.min_stock || 0)).length
})

watch(() => organization.value?.id, (newId) => {
    if (newId) fetchProducts()
}, { immediate: true })

onMounted(async () => {
  if (!organization.value?.id) await fetchOrganization()
  if (organization.value?.id) fetchProducts()
})
</script>
