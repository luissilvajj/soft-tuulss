<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
       <h1 class="text-2xl font-bold text-text-heading">Cuentas por Cobrar y Pagar</h1>
       <p class="mt-1 text-sm text-text-secondary">Control de facturas pendientes, abonos parciales y liquidación de deudas.</p>
    </div>

    <!-- Stats summary -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-surface-ground p-4 rounded-xl border border-primary-500/20 shadow-sm flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-text-secondary mb-1">Total por Cobrar (CxC)</p>
                <p class="text-2xl font-bold text-primary-600">${{ totalReceivables.toFixed(2) }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
        </div>
        <div class="bg-surface-ground p-4 rounded-xl border border-status-error/20 shadow-sm flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-text-secondary mb-1">Total por Pagar (CxP)</p>
                <p class="text-2xl font-bold text-status-error">${{ totalPayables.toFixed(2) }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center text-status-error">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
        </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-surface-ground p-1 rounded-xl border border-surface-border w-fit">
        <button @click="activeTab = 'receivables'" :class="[activeTab === 'receivables' ? 'bg-primary-600 text-white shadow-sm' : 'text-text-secondary hover:text-text-heading', 'px-4 py-2 rounded-lg text-sm font-bold transition-all']">
            Cuentas por Cobrar
        </button>
        <button @click="activeTab = 'payables'" :class="[activeTab === 'payables' ? 'bg-primary-600 text-white shadow-sm' : 'text-text-secondary hover:text-text-heading', 'px-4 py-2 rounded-lg text-sm font-bold transition-all']">
            Cuentas por Pagar
        </button>
    </div>

    <!-- Data Table -->
    <div class="bg-surface-ground rounded-xl border border-surface-border overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="bg-surface-subtle text-text-secondary font-medium text-xs uppercase border-b border-surface-border">
                    <tr>
                        <th class="px-6 py-4">Fecha</th>
                        <th class="px-6 py-4">Ref. Documento</th>
                        <th class="px-6 py-4">{{ activeTab === 'receivables' ? 'Cliente' : 'Proveedor' }}</th>
                        <th class="px-6 py-4 text-right">Total Inicial</th>
                        <th class="px-6 py-4 text-right">Abonado</th>
                        <th class="px-6 py-4 text-right">Saldo Deudor</th>
                        <th class="px-6 py-4">Estado</th>
                        <th class="px-6 py-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-surface-border">
                    <tr v-if="loading">
                        <td colspan="8" class="px-6 py-8 text-center text-text-secondary">Cargando deudas...</td>
                    </tr>
                    <tr v-else-if="currentDebts.length === 0">
                        <td colspan="8" class="px-6 py-8 text-center text-text-secondary">No hay cuentas pendientes en esta categoría. ¡Todo al día!</td>
                    </tr>
                    <tr v-for="d in currentDebts" :key="d.id" class="hover:bg-surface-subtle transition-colors">
                        <td class="px-6 py-4 font-mono text-xs">{{ new Date(d.date).toLocaleDateString('es-VE') }}</td>
                        <td class="px-6 py-4 font-mono font-bold">{{ d.reference }}</td>
                        <td class="px-6 py-4 font-semibold text-text-heading">{{ d.entity_name }}</td>
                        <td class="px-6 py-4 text-right font-mono">${{ d.total.toFixed(2) }}</td>
                        <td class="px-6 py-4 text-right font-mono text-green-600">${{ d.amount_paid.toFixed(2) }}</td>
                        <td class="px-6 py-4 text-right font-bold text-status-error font-mono">${{ d.balance.toFixed(2) }}</td>
                        <td class="px-6 py-4">
                            <span :class="[
                                'px-2 py-1 text-xs font-bold rounded-full',
                                d.status === 'partial' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            ]">{{ d.status === 'partial' ? 'Abono Parcial' : 'Deuda Total' }}</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button @click="openPaymentModal(d)" class="btn variant-primary px-3 py-1.5 text-xs font-bold w-full whitespace-nowrap">
                                Registrar Pago
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Payment Modal -->
    <AppModal :show="showPaymentModal" title="Registrar Abono" @close="showPaymentModal = false">
        <div v-if="selectedDebt" class="space-y-4">
            <!-- Debt Summary -->
            <div class="bg-surface-subtle p-4 rounded-lg border border-surface-border">
                <div class="flex justify-between mb-2">
                    <span class="text-sm text-text-secondary">Referencia:</span>
                    <span class="font-bold font-mono">{{ selectedDebt.reference }}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-sm text-text-secondary">Total Deuda:</span>
                    <span class="font-bold text-status-error">${{ selectedDebt.balance.toFixed(2) }}</span>
                </div>
            </div>

            <div class="space-y-1">
                <label class="block text-sm font-medium text-text-heading">Monto a Abonar ($)</label>
                <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span class="text-text-secondary sm:text-sm">$</span>
                    </div>
                    <input v-model.number="paymentAmount" type="number" step="0.01" :max="selectedDebt.balance" class="block w-full rounded-md border-surface-border bg-surface-ground text-text-heading pl-7 py-2 focus:border-primary-500 focus:ring-primary-500 sm:text-lg font-bold">
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button @click="paymentAmount = selectedDebt.balance" class="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 px-2 py-1 rounded">Monto Total</button>
                    </div>
                </div>
            </div>

            <div class="space-y-1">
                <label class="block text-sm font-medium text-text-heading">Método de Pago</label>
                <select v-model="paymentMethod" class="block w-full rounded-md border-surface-border bg-surface-ground text-text-heading p-2 shadow-sm sm:text-sm">
                    <option value="transfer">Transferencia / Zelle</option>
                    <option value="cash">Efectivo</option>
                    <option value="mobile_pay">Pago Móvil</option>
                    <option value="card">Punto de Venta</option>
                </select>
            </div>
            
            <div class="space-y-1">
                <label class="block text-sm font-medium text-text-heading">Notas / Referencia</label>
                <input v-model="paymentNotes" type="text" placeholder="Referencia Zelle o Banco..." class="block w-full rounded-md border-surface-border bg-surface-ground text-text-heading p-2 shadow-sm sm:text-sm">
            </div>

        </div>
        <template #actions>
            <button @click="processPayment" :disabled="processing || !paymentAmount || paymentAmount <= 0" class="w-full btn btn-primary disabled:opacity-50">
                {{ processing ? 'Procesando...' : 'Confirmar Abono' }}
            </button>
        </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { definePageMeta } from '#imports'
import { useDebts, type Debt } from '~/composables/useDebts'
import { useToast } from 'vue-toastification'

definePageMeta({ layout: 'authenticated', middleware: 'admin-auth' })

const { receivables, payables, loading, fetchDebts, payDebt } = useDebts()
const toast = useToast()

const activeTab = ref<'receivables' | 'payables'>('receivables')

// Computed
const currentDebts = computed(() => activeTab.value === 'receivables' ? receivables.value : payables.value)
const totalReceivables = computed(() => receivables.value.reduce((sum, d) => sum + d.balance, 0))
const totalPayables = computed(() => payables.value.reduce((sum, d) => sum + d.balance, 0))

// Modal State
const showPaymentModal = ref(false)
const processing = ref(false)
const selectedDebt = ref<Debt | null>(null)
const paymentAmount = ref<number>(0)
const paymentMethod = ref('transfer')
const paymentNotes = ref('')

const openPaymentModal = (debt: Debt) => {
    selectedDebt.value = debt
    paymentAmount.value = debt.balance // default to paying the rest
    paymentMethod.value = 'transfer'
    paymentNotes.value = ''
    showPaymentModal.value = true
}

const processPayment = async () => {
    if (!selectedDebt.value || paymentAmount.value <= 0) return
    if (paymentAmount.value > selectedDebt.value.balance) {
        return toast.error('El monto no puede superar el saldo deudor')
    }

    processing.value = true
    try {
        await payDebt(
            selectedDebt.value.id,
            selectedDebt.value.type,
            paymentAmount.value,
            paymentMethod.value,
            paymentNotes.value
        )
        toast.success(`Abono por $${paymentAmount.value.toFixed(2)} registrado con éxito`)
        showPaymentModal.value = false
    } catch (e: any) {
        toast.error(e.message || 'Error procesando el abono')
    } finally {
        processing.value = false
    }
}

onMounted(() => {
    fetchDebts()
})
</script>
