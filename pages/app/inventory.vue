<template>
  <div>
    <!-- Standard Page Header -->
    <!-- Page Header -->
    <div class="mb-6">
       <h1 class="text-2xl font-bold text-text-heading">Inventario</h1>
       <p class="mt-1 text-sm text-text-secondary">Gestiona tus productos y existencias.</p>
    </div>

    <!-- Toolbar -->
    <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <!-- Left: Search -->
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
        
        <!-- Right: Actions -->
        <div class="flex gap-3 w-full md:w-auto justify-end">
             <BaseButton 
                variant="secondary" 
                @click="showImportModal = true"
             >
                Importar
             </BaseButton>
             <BaseButton 
                variant="primary" 
                @click="openModal"
             >
                <template #icon>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </template>
                Nuevo Producto
             </BaseButton>
        </div>
    </div>

    <!-- Data List -->
    <UiDataList 
        :items="products" 
        :columns="columns" 
        :loading="loading"
        title-key="name"
    >
        <!-- Custom Columns -->
        <template #col-product="{ item }">
            <div>
                <div class="text-sm font-medium text-text-heading">{{ item.name }}</div>
                <div class="text-xs text-text-secondary font-mono">{{ item.sku }}</div>
            </div>
        </template>

        <template #col-stock="{ item }">
             <span :class="[
                'px-2 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1',
                item.stock <= (item.min_stock || 5) ? 'bg-status-error/10 text-status-error animate-pulse' : 'bg-status-success/10 text-status-success'
            ]">
                <svg v-if="item.stock <= (item.min_stock || 5)" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                {{ item.stock }}
            </span>
        </template>

        <template #col-price="{ item }">
            <span class="font-mono text-text-heading">${{ item.price.toFixed(2) }}</span>
        </template>

        <template #col-cost="{ item }">
            <span class="font-mono text-text-secondary">${{ (item.cost || 0).toFixed(4) }}</span>
        </template>



        <!-- Mobile Card Customization -->
        <template #card-subtitle="{ item }">
            <span class="text-lg font-bold text-text-heading">${{ item.price.toFixed(2) }}</span>
        </template>

        <template #card-badge="{ item }">
            <span :class="[
                'px-2 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1',
                item.stock <= (item.min_stock || 5) ? 'bg-status-error/10 text-status-error animate-pulse' : 'bg-status-success/10 text-status-success'
            ]">
                <svg v-if="item.stock <= (item.min_stock || 5)" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                {{ item.stock }} Unid.
            </span>
        </template>
        
        <template #col-actions="{ item }">
            <div class="flex justify-end gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <button @click="openRestockModal(item)" class="p-1.5 text-primary-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors border border-transparent hover:border-primary-200" title="Añadir Stock">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
                <button @click="openEditModal(item)" class="p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors border border-transparent hover:border-emerald-200" title="Editar Producto">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button @click="openKardexModal(item)" class="p-1.5 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors border border-transparent hover:border-purple-200" title="Ver Auditoría Kardex">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </button>
                <button @click="handleDelete(item)" class="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Eliminar Producto">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </template>

        <template #mobile-actions="{ item }">
             <span class="text-xs text-text-secondary font-mono">{{ item.sku }}</span>
             <div class="flex gap-3">
                 <button @click="openKardexModal(item)" class="text-purple-600 font-bold text-sm hover:text-purple-700"><svg class="w-4 h-4 inline-block -mt-1 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Kardex</button>
                 <button @click="openRestockModal(item)" class="text-primary-600 font-bold text-sm">Reponer</button>
                 <button @click="openEditModal(item)" class="text-emerald-600 font-bold text-sm">Editar</button>
             </div>
        </template>
    </UiDataList>

    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center bg-surface-ground p-4 rounded-xl border border-surface-border">
            <span class="text-sm text-text-secondary">Página {{ page }} de {{ totalPages || 1 }}</span>
            <div class="flex gap-2">
                <BaseButton 
                    variant="ghost"
                    size="sm"
                    @click="page--" 
                    :disabled="page <= 1"
                >Anterior</BaseButton>
                <BaseButton 
                    variant="ghost"
                    size="sm"
                    @click="page++" 
                    :disabled="page >= (totalPages || 1)"
                >Siguiente</BaseButton>
            </div>
    </div>

    <!-- Modals -->
    <AppImportModal 
        :show="showImportModal" 
        :existing-skus="products.map((p: any) => p.sku)"
        @close="showImportModal = false"
        @import="handleImport" 
    />

    <KardexModal
        :show="showKardexModal"
        :product-id="selectedKardexProductId"
        :product-name="selectedKardexProductName"
        @close="showKardexModal = false"
    />

    <AppModal :show="showModal" :title="isEditing ? 'Editar Producto' : 'Nuevo Producto'" @close="closeModal">
         <div class="space-y-4">
            <BaseInput 
                v-model="form.name" 
                label="Nombre del Producto" 
                placeholder="Ej. iPhone 13 Pro" 
            />
            <BaseInput 
                v-model="form.sku" 
                label="SKU (Código Único)" 
                placeholder="Ej. IP13PRO-128" 
            />
            <div class="grid grid-cols-2 gap-4">
                <BaseInput 
                    v-model.number="form.price" 
                    type="number" 
                    label="Precio de Venta" 
                    placeholder="0.00" 
                    step="0.01"
                />
                <div class="space-y-1">
                    <label class="block text-sm font-medium text-text-heading">Condición Fiscal (IVA)</label>
                    <select v-model="form.tax_condition" class="block w-full rounded-md border-surface-border bg-surface-ground text-text-heading shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        <option value="exempt">Exento (0%)</option>
                        <option value="general">General (16%)</option>
                        <option value="reduced">Reducido (8%)</option>
                    </select>
                </div>
                <!-- Stock/Cost only on create -->
                <BaseInput 
                    v-if="!isEditing"
                    v-model.number="form.stock" 
                    type="number" 
                    label="Stock Inicial" 
                    placeholder="0" 
                />
            </div>
            <BaseInput 
                v-model.number="form.min_stock" 
                type="number" 
                label="Stock Mínimo (Alerta)" 
                placeholder="5" 
                hint="Recibirás una alerta visual cuando el stock baje de este número."
            />
            <BaseInput 
                v-if="!isEditing"
                v-model.number="form.cost" 
                type="number" 
                step="0.01" 
                label="Costo Unitario (Referencial)" 
                placeholder="0.00" 
            />
         </div>
         <template #actions>
            <BaseButton 
                variant="primary" 
                full-width 
                :loading="formSaving" 
                @click="saveProduct"
            >
                {{ formSaving ? 'Guardando...' : 'Guardar Producto' }}
            </BaseButton>
         </template>
    </AppModal>

    <AppModal :show="showRestock" title="Reponer Inventario" @close="showRestock = false">
         <div class="space-y-4 p-1">
            <p class="text-sm text-text-secondary">Producto: <b class="text-text-heading">{{ selectedProduct?.name }}</b></p>
            <BaseInput 
                v-model.number="restock.qty" 
                type="number" 
                label="Cantidad a Agregar" 
                placeholder="0" 
            />
            <BaseInput 
                v-model.number="restock.cost" 
                type="number" 
                step="0.01" 
                label="Nuevo Costo Unitario" 
                placeholder="0.00" 
                hint="El costo promedio se recalculará automáticamente."
            />
         </div>
          <template #actions>
            <BaseButton 
                variant="primary" 
                full-width 
                :loading="restockSaving" 
                @click="submitRestock"
            >
                Confirmar Entrada
            </BaseButton>
         </template>
    </AppModal>

  </div>
</template>

<!-- Scoped styles removed in favor of semantic Tailwind classes -->
</style>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { definePageMeta } from '#imports'
import { useOrganization } from '~/composables/useOrganization'
import { useInventory } from '~/composables/useInventory'
import { watchDebounced } from '@vueuse/core'
import { useToast } from "vue-toastification"
import UiDataList from '~/components/ui/DataList.vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import AppImportModal from '~/components/AppImportModal.vue'
import KardexModal from '~/components/KardexModal.vue'

definePageMeta({ layout: 'authenticated' })

const columns = [
  { key: 'product', label: 'Producto', sortable: true },
  { key: 'stock', label: 'Stock', class: 'text-center', sortable: true },
  { key: 'price', label: 'Precio', class: 'text-right', sortable: true },
  { key: 'cost', label: 'Costo (Prom)', class: 'text-right hidden sm:table-cell', sortable: true },
  { key: 'actions', label: '', class: 'text-right' }
]


const { organization } = useOrganization()
const { products, loading, fetchProducts, resetInventoryState, totalProducts, addStock, softDeleteProduct, addProduct: createProd, updateProduct: updateProd } = useInventory()
const toast = useToast()

// Kardex State
const showKardexModal = ref(false)
const selectedKardexProductId = ref('')
const selectedKardexProductName = ref('')

const openKardexModal = (product: any) => {
    selectedKardexProductId.value = product.id
    selectedKardexProductName.value = product.name
    showKardexModal.value = true
}

// --- Server Side Pagination & Sorting ---
const page = ref(1)
const limit = ref(50)
const searchQuery = ref('')
const sortCol = ref('name')
const sortAsc = ref(true)

const totalPages = computed(() => Math.max(1, Math.ceil(totalProducts.value / limit.value)))

// refresh() - Función central para cargar/recargar productos
const refresh = () => {
    if (!organization.value?.id) return
    fetchProducts({ 
        page: page.value, 
        limit: limit.value, 
        search: searchQuery.value,
        sortBy: sortCol.value,
        sortDesc: !sortAsc.value
    })
}

const handleSort = (sortData: { key: string, asc: boolean }) => {
    // Map UI column keys back to DB column names
    const dbKeyMap: Record<string, string> = {
        'product': 'name',
        'stock': 'stock',
        'price': 'price',
        'cost': 'cost'
    }
    sortCol.value = dbKeyMap[sortData.key] || 'name'
    sortAsc.value = sortData.asc
    page.value = 1 // Reset pagination
    refresh()
}

// Debounce Search
watchDebounced(
    searchQuery,
    () => { page.value = 1; refresh() },
    { debounce: 500, maxWait: 1000 }
)

// Cargar datos al montar la página
onMounted(() => {
    if (organization.value?.id) refresh()
})

// Recargar si la organización cambia
watch(() => organization.value?.id, (newId) => {
    if (newId) refresh()
})

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

const form = ref<any>({ id: '', name: '', sku: '', price: 0, stock: 0, cost: 0, tax_condition: 'exempt', min_stock: 5 })
const restock = ref({ qty: 0, cost: 0 })

const openModal = () => { isEditing.value = false; form.value = { id:'', name:'', sku:'', price:0, stock:0, cost:0, tax_condition: 'exempt', min_stock: 5 }; showModal.value = true }
const openEditModal = (p: any) => { isEditing.value = true; form.value = { ...p, tax_condition: p.tax_condition || 'exempt', min_stock: p.min_stock ?? 5 }; showModal.value = true }
const closeModal = () => showModal.value = false

const saveProduct = async () => {
    formSaving.value = true
    try {
        if (isEditing.value) {
            await updateProd(form.value.id, { name: form.value.name, sku: form.value.sku, price: form.value.price, tax_condition: form.value.tax_condition, min_stock: form.value.min_stock })
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

// Import Modal logic
const showImportModal = ref(false)
const handleImport = async (items: any[]) => {
    // Basic implementation for now, just to show connection
    toast.info(`Simulando importación de ${items.length} items`)
    showImportModal.value = false
    refresh()
}
</script>
