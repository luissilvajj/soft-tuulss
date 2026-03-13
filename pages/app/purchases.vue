<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
       <h1 class="text-2xl font-bold text-text-heading">Compras y Proveedores</h1>
       <p class="mt-1 text-sm text-text-secondary">Registra compras a proveedores para el Libro de Compras del SENIAT.</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-surface-ground p-1 rounded-xl border border-surface-border w-fit">
        <button @click="activeTab = 'purchases'" :class="[activeTab === 'purchases' ? 'bg-primary-600 text-white shadow-sm' : 'text-text-secondary hover:text-text-heading', 'px-4 py-2 rounded-lg text-sm font-bold transition-all']">
            Compras
        </button>
        <button @click="activeTab = 'suppliers'" :class="[activeTab === 'suppliers' ? 'bg-primary-600 text-white shadow-sm' : 'text-text-secondary hover:text-text-heading', 'px-4 py-2 rounded-lg text-sm font-bold transition-all']">
            Proveedores
        </button>
    </div>

    <!-- ═══ SUPPLIERS TAB ═══ -->
    <div v-if="activeTab === 'suppliers'">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-text-heading">Listado de Proveedores</h2>
            <button @click="openSupplierModal()" class="btn btn-primary flex items-center gap-2 px-4 py-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Nuevo Proveedor
            </button>
        </div>

        <UiDataList
            :items="suppliers"
            :columns="supplierColumns"
            :loading="loadingSuppliers"
            title-key="name"
            v-model:limit="limitSuppliers"
            :total="totalSuppliers"
            @sort="handleSortSuppliers"
        >
            <template #col-name="{ item }">
                <span class="font-semibold text-text-heading">{{ item.name }}</span>
            </template>
            <template #col-rif="{ item }">
                <span class="font-mono">{{ item.rif || '-' }}</span>
            </template>
            <template #col-phone="{ item }">
                <span>{{ item.phone || '-' }}</span>
            </template>
            <template #col-contact="{ item }">
                 <span>{{ item.contact_person || '-' }}</span>
            </template>
            <template #col-actions="{ item }">
                <div class="flex justify-end gap-2 text-right">
                    <button @click="openSupplierModal(item)" class="text-primary-600 hover:text-primary-800 text-sm font-bold mr-3">Editar</button>
                    <button @click="deleteSupplier(item.id)" class="text-status-error hover:text-red-700 text-sm font-bold">Borrar</button>
                </div>
            </template>
            <template #mobile-actions="{ item }">
                <button @click="openSupplierModal(item)" class="text-primary-600 font-bold text-sm">Editar</button>
            </template>
        </UiDataList>
    </div>

    <!-- ═══ PURCHASES TAB ═══ -->
    <div v-if="activeTab === 'purchases'">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-text-heading">Registro de Compras</h2>
            <button @click="openPurchaseModal()" class="btn btn-primary flex items-center gap-2 px-4 py-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Nueva Compra
            </button>
        </div>

        <UiDataList
            :items="purchases"
            :columns="purchaseColumns"
            :loading="loadingPurchases"
            title-key="supplier"
            subtitle-key="total"
            v-model:limit="limitPurchases"
            :total="totalPurchases"
            @sort="handleSortPurchases"
        >
            <template #card-subtitle="{ item }">
               <span class="text-text-heading font-bold">${{ Number(item.total).toFixed(2) }}</span>
            </template>
            <template #col-date="{ item }">
                <span class="font-mono">{{ new Date(item.date).toLocaleDateString('es-VE') }}</span>
            </template>
            <template #col-supplier="{ item }">
                 <span class="font-semibold text-text-heading">{{ item.supplier?.name || 'Sin proveedor' }}</span>
            </template>
            <template #col-invoice="{ item }">
                 <span class="font-mono">{{ item.invoice_number || '-' }}</span>
            </template>
            <template #col-subtotal="{ item }">
                 <span class="font-mono">${{ Number(item.subtotal).toFixed(2) }}</span>
            </template>
            <template #col-iva="{ item }">
                 <span class="font-mono">${{ Number(item.tax_amount).toFixed(2) }}</span>
            </template>
             <template #col-total="{ item }">
                 <span class="font-bold text-text-heading">${{ Number(item.total).toFixed(2) }}</span>
            </template>
            <template #col-status="{ item }">
                <span :class="[
                    'px-2 py-1 text-xs font-bold rounded-full',
                    item.status === 'paid' ? 'bg-status-success/10 text-status-success' :
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                ]">{{ item.status === 'paid' ? 'Pagado' : item.status === 'pending' ? 'Pendiente' : 'Parcial' }}</span>
            </template>
        </UiDataList>
    </div>

    <!-- ═══ SUPPLIER MODAL ═══ -->
    <AppModal :show="showSupplierModal" :title="editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'" @close="showSupplierModal = false">
        <div class="space-y-4">
            <BaseInput v-model="supplierForm.name" label="Nombre / Razón Social" placeholder="Distribuidora XYZ" />
            <div class="grid grid-cols-2 gap-4">
                <BaseInput v-model="supplierForm.rif" label="RIF" placeholder="J-12345678-0" />
                <BaseInput v-model="supplierForm.phone" label="Teléfono" placeholder="0412-1234567" />
            </div>
            <BaseInput v-model="supplierForm.email" label="Email" placeholder="proveedor@email.com" />
            <BaseInput v-model="supplierForm.contact_person" label="Persona de Contacto" placeholder="Juan Pérez" />
            <BaseInput v-model="supplierForm.address" label="Dirección" placeholder="Av. Principal..." />
        </div>
        <template #actions>
            <button @click="saveSupplier" :disabled="savingSupplier" class="w-full btn btn-primary disabled:opacity-50">
                {{ savingSupplier ? 'Guardando...' : 'Guardar Proveedor' }}
            </button>
        </template>
    </AppModal>

    <!-- ═══ PURCHASE MODAL ═══ -->
    <AppModal :show="showPurchaseModal" title="Registrar Compra" @close="showPurchaseModal = false">
        <div class="space-y-4">
            <div class="space-y-1">
                <label class="block text-sm font-medium text-text-heading">Proveedor</label>
                <select v-model="purchaseForm.supplier_id" class="block w-full rounded-md border-surface-border bg-surface-ground text-text-heading shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Seleccionar proveedor...</option>
                    <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }} ({{ s.rif || 'Sin RIF' }})</option>
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <BaseInput v-model="purchaseForm.invoice_number" label="Nro. Factura Proveedor" placeholder="001-00123" />
                <BaseInput v-model="purchaseForm.date" type="date" label="Fecha" />
            </div>
            <div class="grid grid-cols-2 gap-4">
                <BaseInput v-model.number="purchaseForm.subtotal" type="number" step="0.01" label="Subtotal (sin IVA)" placeholder="0.00" />
                <BaseInput v-model.number="purchaseForm.exempt_amount" type="number" step="0.01" label="Monto Exento" placeholder="0.00" />
            </div>
            <div class="grid grid-cols-2 gap-4">
                <BaseInput v-model.number="purchaseForm.tax_base" type="number" step="0.01" label="Base Imponible (16%)" placeholder="0.00" />
                <BaseInput v-model.number="purchaseForm.tax_amount" type="number" step="0.01" label="IVA Cargado" placeholder="0.00" />
            </div>
            <BaseInput v-model.number="purchaseForm.total" type="number" step="0.01" label="Total Factura" placeholder="0.00" />
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="block text-sm font-medium text-text-heading">Método de Pago</label>
                    <select v-model="purchaseForm.payment_method" class="block w-full rounded-md border-surface-border bg-surface-ground text-text-heading shadow-sm sm:text-sm">
                        <option value="transfer">Transferencia</option>
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="block text-sm font-medium text-text-heading">Estado</label>
                    <select v-model="purchaseForm.status" class="block w-full rounded-md border-surface-border bg-surface-ground text-text-heading shadow-sm sm:text-sm">
                        <option value="paid">Pagado</option>
                        <option value="pending">Pendiente</option>
                        <option value="partial">Parcial</option>
                    </select>
                </div>
            </div>
            <BaseInput v-model="purchaseForm.notes" label="Notas" placeholder="Descripción de la compra..." />
        </div>
        <template #actions>
            <button @click="savePurchase" :disabled="savingPurchase" class="w-full btn btn-primary disabled:opacity-50">
                {{ savingPurchase ? 'Guardando...' : 'Registrar Compra' }}
            </button>
        </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSupabaseClient, definePageMeta } from '#imports'
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from 'vue-toastification'
import BaseInput from '~/components/base/BaseInput.vue'
import UiDataList from '~/components/ui/DataList.vue'

definePageMeta({ layout: 'authenticated', middleware: 'admin-auth' })

const client = useSupabaseClient()
const { organization } = useOrganization()
const toast = useToast()

const activeTab = ref('purchases')

const supplierColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'rif', label: 'RIF' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'contact', label: 'Contacto' },
    { key: 'actions', label: '', class: 'text-right' }
]

const purchaseColumns = [
    { key: 'date', label: 'Fecha' },
    { key: 'supplier', label: 'Proveedor' },
    { key: 'invoice', label: 'Factura' },
    { key: 'subtotal', label: 'Subtotal', class: 'text-right hidden sm:table-cell' },
    { key: 'iva', label: 'IVA', class: 'text-right hidden sm:table-cell' },
    { key: 'total', label: 'Total', class: 'text-right' },
    { key: 'status', label: 'Estado' }
]

// ─── Suppliers ─────────────────────
const suppliers = ref<any[]>([])
const loadingSuppliers = ref(false)
const showSupplierModal = ref(false)
const editingSupplier = ref(false)
const savingSupplier = ref(false)
const supplierForm = ref({ id: '', name: '', rif: '', phone: '', email: '', contact_person: '', address: '' })

const limitSuppliers = ref(20)
const totalSuppliers = ref(0)
const sortColSuppliers = ref('name')
const sortAscSuppliers = ref(true)

const fetchSuppliers = async () => {
    if (!organization.value?.id) return
    loadingSuppliers.value = true
    const { data, count } = await client.from('suppliers')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.value.id)
        .order(sortColSuppliers.value, { ascending: sortAscSuppliers.value })
        .limit(limitSuppliers.value)

    suppliers.value = data || []
    if (count !== null) totalSuppliers.value = count
    loadingSuppliers.value = false
}

const handleSortSuppliers = (sortData: any) => {
    sortColSuppliers.value = sortData.key
    sortAscSuppliers.value = sortData.asc
    fetchSuppliers()
}

watch(limitSuppliers, fetchSuppliers)

const openSupplierModal = (s?: any) => {
    if (s) {
        editingSupplier.value = true
        supplierForm.value = { ...s }
    } else {
        editingSupplier.value = false
        supplierForm.value = { id: '', name: '', rif: '', phone: '', email: '', contact_person: '', address: '' }
    }
    showSupplierModal.value = true
}

const saveSupplier = async () => {
    if (!supplierForm.value.name) return toast.error('El nombre es obligatorio')
    savingSupplier.value = true
    try {
        if (editingSupplier.value) {
            const { id, ...rest } = supplierForm.value
            await client.from('suppliers').update(rest).eq('id', id)
        } else {
            const { id, ...rest } = supplierForm.value
            await client.from('suppliers').insert({ ...rest, organization_id: organization.value!.id })
        }
        toast.success('Proveedor guardado')
        showSupplierModal.value = false
        fetchSuppliers()
    } catch (e: any) { toast.error(e.message) }
    finally { savingSupplier.value = false }
}

const deleteSupplier = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await client.from('suppliers').delete().eq('id', id)
    toast.success('Proveedor eliminado')
    fetchSuppliers()
}

// ─── Purchases ─────────────────────
const purchases = ref<any[]>([])
const loadingPurchases = ref(false)
const showPurchaseModal = ref(false)
const savingPurchase = ref(false)
const purchaseForm = ref({
    supplier_id: '', invoice_number: '', date: new Date().toISOString().split('T')[0],
    subtotal: 0, exempt_amount: 0, tax_base: 0, tax_amount: 0, total: 0,
    payment_method: 'transfer', status: 'paid', notes: ''
})

const limitPurchases = ref(20)
const totalPurchases = ref(0)
const sortColPurchases = ref('date')
const sortAscPurchases = ref(false)

const fetchPurchases = async () => {
    if (!organization.value?.id) return
    loadingPurchases.value = true
    const { data, count } = await client.from('purchases')
        .select('*, supplier:suppliers(name, rif)', { count: 'exact' })
        .eq('organization_id', organization.value.id)
        .order(sortColPurchases.value, { ascending: sortAscPurchases.value })
        .limit(limitPurchases.value)
        
    purchases.value = data || []
    if (count !== null) totalPurchases.value = count
    loadingPurchases.value = false
}

const handleSortPurchases = (sortData: any) => {
    sortColPurchases.value = sortData.key
    sortAscPurchases.value = sortData.asc
    fetchPurchases()
}

watch(limitPurchases, fetchPurchases)

const openPurchaseModal = () => {
    purchaseForm.value = {
        supplier_id: '', invoice_number: '', date: new Date().toISOString().split('T')[0],
        subtotal: 0, exempt_amount: 0, tax_base: 0, tax_amount: 0, total: 0,
        payment_method: 'transfer', status: 'paid', notes: ''
    }
    showPurchaseModal.value = true
}

const savePurchase = async () => {
    if (!purchaseForm.value.total) return toast.error('El total es obligatorio')
    savingPurchase.value = true
    try {
        const payload = {
            ...purchaseForm.value,
            amount_paid: purchaseForm.value.status === 'paid' ? purchaseForm.value.total : 0,
            supplier_id: purchaseForm.value.supplier_id || null,
            organization_id: organization.value!.id
        }
        await client.from('purchases').insert(payload)
        toast.success('Compra registrada')
        showPurchaseModal.value = false
        fetchPurchases()
    } catch (e: any) { toast.error(e.message) }
    finally { savingPurchase.value = false }
}

// ─── Init ─────────────────────
onMounted(() => {
    fetchSuppliers()
    fetchPurchases()
})
</script>
