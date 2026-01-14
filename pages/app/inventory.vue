<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gradient">Inventario</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Gestiona tus productos y existencias.</p>
      </div>
      <div class="flex gap-2">
         <button @click="showImportModal = true" class="btn bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
            Importar
         </button>
         <button @click="openModal" class="btn btn-primary">
            Nuevo Producto
         </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="mb-6 flex gap-4">
        <div class="relative flex-1 max-w-md">
            <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Buscar por Nombre o SKU..." 
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && products.length === 0 && searchQuery === ''" class="py-12">
        <EmptyState 
            title="Tu inventario está vacío" 
            description="Para comenzar a vender, primero necesitas agregar productos a tu inventario. ¡Es muy fácil!"
            actionLabel="Crear Primer Producto"
            actionId="tour-add-product"
            @action="openModal"
        >
            <template #icon>
                <svg class="w-10 h-10 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </template>
        </EmptyState>
    </div>

    <!-- Data Table -->
    <div v-else class="glass-panel overflow-hidden relative min-h-[400px]">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead class="bg-gray-50 dark:bg-slate-900">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                         <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Costo (Prom)</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-slate-950">
                    <tr v-if="!products?.length && !pending">
                        <td colspan="5" class="py-10 text-center text-gray-500">No se encontraron productos.</td>
                    </tr>
                    <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ product.name }}</div>
                            <div class="text-xs text-gray-500">{{ product.sku }}</div>
                        </td>
                        <td class="px-6 py-4 text-center">
                             <span :class="[
                                'px-2 py-1 text-xs font-bold rounded-full',
                                product.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                            ]">
                                {{ product.stock }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right text-sm font-mono">${{ product.price.toFixed(2) }}</td>
                        <td class="px-6 py-4 text-right text-sm text-gray-500 font-mono">${{ (product.cost || 0).toFixed(4) }}</td>
                        <td class="px-6 py-4 text-right space-x-2">
                             <button @click="openRestockModal(product)" class="text-emerald-600 hover:text-emerald-500 text-sm font-medium" title="Reponer Stock">+ Stock</button>
                             <button @click="openEditModal(product)" class="text-blue-600 hover:text-blue-500 text-sm font-medium">Editar</button>
                             <button @click="handleDelete(product)" class="text-red-600 hover:text-red-500 text-sm font-medium">Borrar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
             <span class="text-sm text-gray-500">Página {{ page }} de {{ data?.totalPages || 1 }} (Total: {{ data?.total || 0 }})</span>
             <div class="flex gap-2">
                 <button 
                    @click="page--" 
                    :disabled="page <= 1"
                    class="px-4 py-2 text-sm bg-white dark:bg-slate-800 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700"
                 >Anterior</button>
                 <button 
                    @click="page++" 
                    :disabled="page >= (data?.totalPages || 1)"
                    class="px-4 py-2 text-sm bg-white dark:bg-slate-800 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700"
                 >Siguiente</button>
             </div>
        </div>
    </div>

    <!-- Modals (Simple Re-implementation or Reuse) -->
    <!-- Using existing components logic structure -->
    <AppModal :show="showModal" :title="isEditing ? 'Editar Producto' : 'Nuevo Producto'" @close="closeModal">
         <div class="space-y-4">
            <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nombre del Producto</label>
                <input v-model="form.name" class="input-std" placeholder="Ej. iPhone 13 Pro">
            </div>
            <div>
                 <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">SKU (Código Único)</label>
                 <input v-model="form.sku" class="input-std" placeholder="Ej. IP13PRO-128">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Precio de Venta</label>
                    <input v-model.number="form.price" type="number" step="0.01" class="input-std" placeholder="0.00">
                </div>
                <!-- Stock/Cost only on create -->
                <div v-if="!isEditing">
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Stock Inicial</label>
                    <input v-model.number="form.stock" type="number" class="input-std" placeholder="0">
                </div>
            </div>
            <div v-if="!isEditing">
                 <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Costo Unitario (Referencial)</label>
                 <input v-model.number="form.cost" type="number" step="0.01" class="input-std" placeholder="0.00">
            </div>
         </div>
         <template #actions>
            <button @click="saveProduct" class="btn btn-primary" :disabled="formSaving">
                {{ formSaving ? 'Guardando...' : 'Guardar Producto' }}
            </button>
         </template>
    </AppModal>

    <AppModal :show="showRestock" title="Reponer Inventario" @close="showRestock = false">
         <div class="space-y-4 p-2">
            <p>Producto: <b>{{ selectedProduct?.name }}</b></p>
            <div>
                 <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Cantidad a Agregar</label>
                 <input v-model.number="restock.qty" type="number" class="input-std" placeholder="0">
            </div>
            <div>
                 <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nuevo Costo Unitario</label>
                 <input v-model.number="restock.cost" type="number" step="0.01" class="input-std" placeholder="0.00">
            </div>
            <p class="text-xs text-gray-500">El costo promedio se recalculará automáticamente.</p>
         </div>
          <template #actions>
            <button @click="submitRestock" class="btn btn-primary" :disabled="restockSaving">Confirmar Entrada</button>
         </template>
    </AppModal>

  </div>
</template>

<style scoped>
.input-std {
    @apply w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-blue-500;
}
</style>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { useInventory } from '~/composables/useInventory'
import { watchDebounced } from '@vueuse/core'
import { useToast } from "vue-toastification"

definePageMeta({ layout: 'dashboard' })

const { organization } = useOrganization()
const { addStock, softDeleteProduct, addProduct: createProd, updateProduct: updateProd } = useInventory()
const toast = useToast()

// --- Server Side Pagination ---
const page = ref(1)
const searchQuery = ref('')
const limit = 10

const { data, pending, refresh, error } = await useFetch('/api/products', {
    params: {
        page,
        limit,
        search: searchQuery,
        organization_id: computed(() => organization.value?.id)
    },
    watch: [page, () => organization.value?.id],
    lazy: true,
    server: false // Force client-side fetch to ensure auth/org state is hydrated
})

if (error.value) {
    console.error('Inventory Fetch Error:', error.value)
    toast.error('Error cargando inventario: ' + (error.value.data?.message || error.value.message))
}

const products = computed(() => data.value?.data || [])

// Debounce Search
watchDebounced(
    searchQuery,
    () => { page.value = 1; refresh() },
    { debounce: 500, maxWait: 1000 }
)

// --- Actions ---
const handleDelete = async (p: any) => {
    if (!confirm('¿Eliminar producto?')) return
    try {
        await softDeleteProduct(p.id)
        toast.success('Producto eliminado')
        refresh()
    } catch (e: any) {
        toast.error(e.message)
    }
}

// --- Modals Logic (Simplified) ---
const showModal = ref(false)
const showRestock = ref(false)
const isEditing = ref(false)
const selectedProduct = ref<any>(null)
const formSaving = ref(false)
const restockSaving = ref(false)

const form = ref({ id: '', name: '', sku: '', price: 0, stock: 0, cost: 0 })
const restock = ref({ qty: 0, cost: 0 })

const openModal = () => { isEditing.value = false; form.value = { id:'', name:'', sku:'', price:0, stock:0, cost:0 }; showModal.value = true }
const openEditModal = (p: any) => { isEditing.value = true; form.value = { ...p }; showModal.value = true }
const closeModal = () => showModal.value = false

const saveProduct = async () => {
    formSaving.value = true
    try {
        if (isEditing.value) {
            await updateProd(form.value.id, { name: form.value.name, sku: form.value.sku, price: form.value.price })
        } else {
             // CRITICAL FIX: Ensure 'id' is NOT sent as empty string for new items
             const { id, ...newProduct } = form.value
             await createProd({ ...newProduct, organization_id: organization.value!.id })
        }
        toast.success('Guardado')
        closeModal()
        refresh()
    } catch (e: any) {
        toast.error(e.message)
    } finally {
        formSaving.value = false
    }
}

const openRestockModal = (p: any) => {
    selectedProduct.value = p
    restock.value = { qty: 1, cost: p.cost || 0 }
    showRestock.value = true
}

const submitRestock = async () => {
    restockSaving.value = true
    try {
        await addStock(selectedProduct.value.id, restock.value.qty, restock.value.cost)
        toast.success('Stock actualizado')
        showRestock.value = false
        refresh()
    } catch (e: any) {
        toast.error(e.message)
    } finally {
        restockSaving.value = false
    }
}

// Import Modal logic would be similar, checking skus against DB or simplified
const showImportModal = ref(false)
</script>
