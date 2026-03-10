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

        <div class="bg-surface-ground rounded-xl border border-surface-border overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-surface-subtle text-text-secondary font-medium text-xs uppercase border-b border-surface-border">
                        <tr>
                            <th class="px-6 py-4">Nombre</th>
                            <th class="px-6 py-4">RIF</th>
                            <th class="px-6 py-4">Teléfono</th>
                            <th class="px-6 py-4">Contacto</th>
                            <th class="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-border">
                        <tr v-if="loadingSuppliers">
                            <td colspan="5" class="px-6 py-8 text-center text-text-secondary">Cargando...</td>
                        </tr>
                        <tr v-else-if="suppliers.length === 0">
                            <td colspan="5" class="px-6 py-8 text-center text-text-secondary">No hay proveedores registrados</td>
                        </tr>
                        <tr v-for="s in suppliers" :key="s.id" class="hover:bg-surface-subtle transition-colors">
                            <td class="px-6 py-4 font-semibold text-text-heading">{{ s.name }}</td>
                            <td class="px-6 py-4 font-mono">{{ s.rif || '-' }}</td>
                            <td class="px-6 py-4">{{ s.phone || '-' }}</td>
                            <td class="px-6 py-4">{{ s.contact_person || '-' }}</td>
                            <td class="px-6 py-4 text-right">
                                <button @click="openSupplierModal(s)" class="text-primary-600 hover:text-primary-800 text-sm font-bold mr-3">Editar</button>
                                <button @click="deleteSupplier(s.id)" class="text-status-error hover:text-red-700 text-sm font-bold">Borrar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
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

        <div class="bg-surface-ground rounded-xl border border-surface-border overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-surface-subtle text-text-secondary font-medium text-xs uppercase border-b border-surface-border">
                        <tr>
                            <th class="px-6 py-4">Fecha</th>
                            <th class="px-6 py-4">Proveedor</th>
                            <th class="px-6 py-4">Factura</th>
                            <th class="px-6 py-4 text-right">Subtotal</th>
                            <th class="px-6 py-4 text-right">IVA</th>
                            <th class="px-6 py-4 text-right">Total</th>
                            <th class="px-6 py-4">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-border">
                        <tr v-if="loadingPurchases">
                            <td colspan="7" class="px-6 py-8 text-center text-text-secondary">Cargando...</td>
                        </tr>
                        <tr v-else-if="purchases.length === 0">
                            <td colspan="7" class="px-6 py-8 text-center text-text-secondary">No hay compras registradas</td>
                        </tr>
                        <tr v-for="p in purchases" :key="p.id" class="hover:bg-surface-subtle transition-colors">
                            <td class="px-6 py-4 font-mono">{{ new Date(p.date).toLocaleDateString('es-VE') }}</td>
                            <td class="px-6 py-4 font-semibold text-text-heading">{{ p.supplier?.name || 'Sin proveedor' }}</td>
                            <td class="px-6 py-4 font-mono">{{ p.invoice_number || '-' }}</td>
                            <td class="px-6 py-4 text-right font-mono">${{ Number(p.subtotal).toFixed(2) }}</td>
                            <td class="px-6 py-4 text-right font-mono">${{ Number(p.tax_amount).toFixed(2) }}</td>
                            <td class="px-6 py-4 text-right font-bold text-text-heading">${{ Number(p.total).toFixed(2) }}</td>
                            <td class="px-6 py-4">
                                <span :class="[
                                    'px-2 py-1 text-xs font-bold rounded-full',
                                    p.status === 'paid' ? 'bg-status-success/10 text-status-success' :
                                    p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                ]">{{ p.status === 'paid' ? 'Pagado' : p.status === 'pending' ? 'Pendiente' : 'Parcial' }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
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
import { ref, onMounted } from 'vue'
import { useSupabaseClient, definePageMeta } from '#imports'
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from 'vue-toastification'
import BaseInput from '~/components/base/BaseInput.vue'

definePageMeta({ layout: 'authenticated', middleware: 'admin-auth' })

const client = useSupabaseClient()
const { organization } = useOrganization()
const toast = useToast()

const activeTab = ref('purchases')

// ─── Suppliers ─────────────────────
const suppliers = ref<any[]>([])
const loadingSuppliers = ref(false)
const showSupplierModal = ref(false)
const editingSupplier = ref(false)
const savingSupplier = ref(false)
const supplierForm = ref({ id: '', name: '', rif: '', phone: '', email: '', contact_person: '', address: '' })

const fetchSuppliers = async () => {
    if (!organization.value?.id) return
    loadingSuppliers.value = true
    const { data } = await client.from('suppliers').select('*').eq('organization_id', organization.value.id).order('name')
    suppliers.value = data || []
    loadingSuppliers.value = false
}

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

const fetchPurchases = async () => {
    if (!organization.value?.id) return
    loadingPurchases.value = true
    const { data } = await client.from('purchases')
        .select('*, supplier:suppliers(name, rif)')
        .eq('organization_id', organization.value.id)
        .order('date', { ascending: false })
        .limit(50)
    purchases.value = data || []
    loadingPurchases.value = false
}

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
