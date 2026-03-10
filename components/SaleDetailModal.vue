<template>
  <AppModal :show="true" :title="sale.document_type === 'delivery_note' ? 'Nota de Entrega' : 'Factura Fiscal'" description="Recibo de operación" @close="$emit('close')">
    <div class="space-y-6">
        <!-- Header Info -->
        <div class="flex justify-between items-start border-b border-[var(--color-border-subtle)] pb-4">
            <div>
                <p class="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Cliente</p>
                <p class="text-lg font-bold text-[var(--color-heading)]">{{ sale.client_name || 'Cliente Casual' }}</p>
                <div class="flex items-center gap-2 mt-1">
                     <span :class="[
                        'px-2 py-1 text-xs font-bold rounded-full',
                        sale.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                    ]">
                        {{ sale.status === 'paid' ? 'PAGADO' : 'PENDIENTE' }}
                    </span>
                     <!-- Currency Toggle -->
                    <button @click="toggleCurrency" class="btn btn-xs border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)] flex items-center gap-1">
                         <span class="text-[10px] uppercase font-bold">{{ showInVes ? 'Ver en Dólares' : 'Ver en Bolívares' }}</span>
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    </button>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Fecha</p>
                <p class="font-mono text-[var(--color-heading)]">{{ new Date(sale.created_at || Date.now()).toLocaleString() }}</p>
                <p class="text-xs text-[var(--color-text-secondary)] mt-1">Ref: {{ sale.payment_reference || 'N/A' }}</p>
            </div>
        </div>

        <!-- Items Table -->
        <div class="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
            <table class="min-w-full divide-y divide-[var(--color-border-subtle)]">
                <thead class="bg-[var(--color-bg-subtle)]">
                    <tr>
                        <th class="px-4 py-2 text-center text-xs font-medium text-[var(--color-text-secondary)] uppercase w-16">Cant.</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase w-full">Producto</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase whitespace-nowrap">Precio Unit.</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase whitespace-nowrap">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--color-border-subtle)]">
                    <tr v-for="(item, i) in displayItems" :key="i">
                        <td class="px-4 py-2 text-sm text-[var(--color-text-secondary)] text-center font-mono">{{ item.qty }}</td>
                        <td class="px-4 py-2 text-sm text-[var(--color-heading)]">{{ item.name }}</td>
                        <td class="px-4 py-2 text-sm text-[var(--color-text-secondary)] text-right font-mono whitespace-nowrap">
                            {{ formatMoney(item.price, showInVes ? 'VES' : 'USD') }}
                        </td>
                        <td class="px-4 py-2 text-sm text-[var(--color-heading)] text-right font-mono whitespace-nowrap">
                             {{ formatMoney(item.price * item.qty, showInVes ? 'VES' : 'USD') }}
                        </td>
                    </tr>
                    <tr v-if="displayItems.length === 0">
                        <td colspan="4" class="px-4 py-4 text-center text-sm text-[var(--color-text-secondary)] italic">
                            No hay items registrados
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Financials -->
        <div class="flex justify-end">
            <div class="w-1/2 space-y-2">
                 <!-- Main Display (Toggled) -->
                <div class="border-t border-[var(--color-border-subtle)] pt-2 mt-2">
                    <div class="flex justify-between text-lg font-bold text-[var(--color-heading)]">
                        <span>Total {{ showInVes ? 'Bolívares' : 'USD' }}</span>
                        <!-- If showing VES, use paidVesAmount. If USD, use baseUsdAmount -->
                         <span class="font-mono whitespace-nowrap">
                            {{ formatMoney(showInVes ? paidVesAmount : baseUsdAmount, showInVes ? 'VES' : 'USD') }}
                         </span>
                    </div>
                </div>

                <!-- Context Box -->
                <div class="bg-[var(--color-bg-subtle)] rounded-lg p-3 mt-4 border border-[var(--color-border-subtle)] text-sm">
                     
                     <!-- Mixed Payment Details -->
                     <div v-if="sale.payment_details && ((sale.payment_details.usd_amount || 0) > 0 || (sale.payment_details.ves_amount || 0) > 0)" class="space-y-2">
                        <div class="flex justify-between text-[var(--color-heading)] font-bold mb-2 border-b border-[var(--color-border-subtle)] pb-1">
                            <span>Desglose de Pago (Mixto)</span>
                        </div>
                        <div v-if="(sale.payment_details.usd_amount || 0) > 0" class="flex justify-between text-[var(--color-text-secondary)]">
                            <span>Pagado en Divisa</span>
                            <span class="font-mono text-emerald-500 whitespace-nowrap">${{ Number(sale.payment_details.usd_amount).toFixed(2) }}</span>
                        </div>
                        <div v-if="(sale.payment_details.ves_amount || 0) > 0" class="flex justify-between text-[var(--color-text-secondary)]">
                            <span>Pagado en Bolívares</span>
                            <div class="text-right">
                                <span class="font-mono text-[var(--color-accent-blue)] block whitespace-nowrap">Bs. {{ Number(sale.payment_details.ves_amount).toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}</span>
                            </div>
                        </div>
                         <div v-if="(sale.tax_igtf || 0) > 0" class="flex justify-between text-[var(--color-text-secondary)] text-xs mt-1 pt-1 border-t border-[var(--color-border-subtle)] dashed">
                            <span>Base IGTF (Divisa)</span>
                            <span class="font-mono whitespace-nowrap">${{ Number(sale.payment_details.igtf_base || sale.payment_details.usd_amount).toFixed(2) }}</span>
                        </div>
                     </div>

                     <!-- Standard Single Method Details -->
                     <div v-else>
                        <div class="flex justify-between text-[var(--color-text-secondary)] mb-1">
                            <span>Método de Pago</span>
                            <span class="capitalize font-medium text-[var(--color-heading)]">{{ displayPaymentMethod(sale.payment_method) }}</span>
                        </div>
                        <div class="flex justify-between text-[var(--color-text-secondary)] mb-1">
                            <span>Tasa de Cambio</span>
                            <span class="font-mono whitespace-nowrap">{{ Number(sale.exchange_rate).toFixed(2) }} Bs/$</span>
                        </div>
                        
                        <div class="border-t border-[var(--color-border-subtle)] my-2"></div>
                        
                        <!-- Reference Values -->
                        <div v-if="showInVes" class="flex justify-between font-medium text-emerald-500">
                            <span>Equivalente en Divisa</span>
                            <span class="font-mono whitespace-nowrap">{{ formatMoney(baseUsdAmount, 'USD') }}</span>
                        </div>
                        <div v-else class="flex justify-between font-medium text-[var(--color-accent-blue)]">
                            <span>Equivalente en Bolívares</span>
                            <span class="font-mono whitespace-nowrap">{{ formatMoney(paidVesAmount, 'VES') }}</span>
                        </div>
                     </div>

                     <!-- Common Reference -->
                     <div v-if="sale.payment_reference" class="mt-2 pt-2 border-t border-[var(--color-border-subtle)]">
                        <div class="flex justify-between text-[var(--color-text-secondary)]">
                            <span>Referencia</span>
                            <span class="font-mono whitespace-nowrap">{{ sale.payment_reference }}</span>
                        </div>
                    </div>

                    <!-- Retenciones Fiscales (B2B) -->
                    <div v-if="sale.document_type === 'invoice' && ((sale.tax_general_amount || 0) > 0 || (sale.tax_reduced_amount || 0) > 0)" class="mt-4 pt-4 border-t-2 border-dashed border-[var(--color-border-subtle)]">
                        <div class="flex justify-between items-center mb-2">
                             <span class="font-bold text-sm text-[var(--color-heading)]">Retención de IVA (B2B)</span>
                        </div>
                        
                        <!-- Mostrando Retención Existente -->
                        <div v-if="retention" class="bg-status-success/10 border border-status-success/20 rounded-md p-2 text-xs">
                             <div class="flex justify-between text-status-success font-bold mb-1">
                                 <span>Retenido ({{ retention.percentage }}%)</span>
                                 <span class="font-mono">{{ formatMoney(retention.amount_retained, 'USD') }}</span>
                             </div>
                             <div class="flex justify-between text-status-success/80">
                                 <span>Comprobante:</span>
                                 <span class="font-mono">{{ retention.retention_number }}</span>
                             </div>
                        </div>

                        <!-- Formulario para agregar -->
                        <div v-else-if="showRetentionForm" class="space-y-2 mt-2 bg-[var(--color-bg-subtle)] p-2 rounded-md border border-[var(--color-border-subtle)]">
                             <div>
                                 <label class="block text-[10px] uppercase text-[var(--color-text-secondary)] font-bold mb-1">Porcentaje</label>
                                  <div class="flex gap-2">
                                     <button @click="retentionForm.percentage = 75" :class="['flex-1 py-1 rounded text-xs font-bold border', retentionForm.percentage === 75 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]']">75%</button>
                                     <button @click="retentionForm.percentage = 100" :class="['flex-1 py-1 rounded text-xs font-bold border', retentionForm.percentage === 100 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]']">100%</button>
                                  </div>
                             </div>
                             <div>
                                 <label class="block text-[10px] uppercase text-[var(--color-text-secondary)] font-bold mb-1">Nro Comprobante</label>
                                 <input v-model="retentionForm.retention_number" type="text" class="w-full text-xs p-1.5 border border-[var(--color-border-subtle)] rounded bg-[var(--color-surface)] text-[var(--color-heading)] focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Ej. 202405000012">
                             </div>
                             <div class="flex gap-2 pt-1">
                                  <button @click="saveRetention" :disabled="savingRetention || !retentionForm.retention_number" class="flex-1 bg-primary-600 text-white rounded py-1.5 text-xs font-bold disabled:opacity-50">Guardar</button>
                                  <button @click="showRetentionForm = false" class="px-3 border border-[var(--color-border-subtle)] rounded text-[var(--color-text-secondary)] text-xs font-bold">Cancelar</button>
                             </div>
                        </div>
                        
                        <!-- Boton Activar Toggle -->
                        <button v-else-if="!retention" @click="showRetentionForm = true" class="w-full py-1.5 mt-1 border border-dashed border-primary-300 text-primary-600 hover:bg-primary-50 rounded-md text-xs font-bold transition-colors">
                            + Cargar Comprobante Retención
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="fixed top-[-9999px] left-[-9999px]">
        <InvoiceA4 id="invoice-a4-document" :sale="sale" :organization="organization" />
    </div>

    <template #actions>
        <button v-if="sale.document_type === 'invoice'" @click="issueCreditNote" :disabled="isGeneratingCreditNote" class="btn bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors flex items-center gap-2 mr-auto disabled:opacity-50">
            <svg class="w-4 h-4" :class="{'animate-spin': isGeneratingCreditNote}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!isGeneratingCreditNote" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Anular (Nota Crédito)
        </button>

        <button v-if="canShare" @click="shareInvoice" class="btn bg-surface-ground text-text-heading border border-surface-border hover:bg-surface-subtle transition-colors flex items-center gap-2 mr-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Compartir
        </button>
        <button @click="downloadPDF" :disabled="generating" class="btn bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors flex items-center gap-2 mr-2 disabled:opacity-50">
            <svg class="w-4 h-4" :class="{'animate-spin': generating}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!generating" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            PDF A4
        </button>
        <button @click="printInvoice" class="btn bg-[var(--color-bg-subtle)] text-[var(--color-heading)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)] transition-colors flex items-center gap-2 mr-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Imprimir
        </button>
        <button v-if="fiscalAgentOnline" @click="printFiscal" :disabled="printingFiscal" class="btn bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors flex items-center gap-2 mr-2 disabled:opacity-50">
            <svg class="w-4 h-4" :class="{'animate-spin': printingFiscal}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!printingFiscal" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Imprimir Fiscal
        </button>
        <button @click="$emit('close')" class="w-full btn btn-primary">
            Cerrar
        </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, ref, type PropType, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useOrganization } from '~/composables/useOrganization'
import { useReceipt } from '~/composables/useReceipt'
import { useSupabaseClient } from '#imports'
import InvoiceA4 from '~/components/InvoiceA4.vue'
// Using local type representation if 'Sale' from models is missing items_snapshot
interface ExtendedSale {
    id: string;
    client_name?: string;
    status: string;
    currency: string;
    amount: number;
    exchange_rate: number;
    payment_method: string;
    payment_reference?: string;
    document_type?: 'invoice' | 'delivery_note' | 'credit_note' | 'debit_note';
    control_number?: string;
    organization_id?: string;
    created_at?: string;
    tax_base?: number;
    tax_general_amount?: number;
    tax_reduced_amount?: number;
    tax_igtf?: number;
    payment_details?: any;
    items?: any[];
    items_snapshot?: any;
}

const props = defineProps<{
  sale: ExtendedSale
}>()

const router = useRouter()
const supabase = useSupabaseClient()
const toast = useToast()

const { organization } = useOrganization()
const { generateReceiptPDF, generating, checkFiscalAgent, printToFiscalPrinter, fiscalAgentOnline, printingFiscal } = useReceipt()

// Check if fiscal agent is running when modal opens
onMounted(() => {
    checkFiscalAgent()
})

const printFiscal = async () => {
    await printToFiscalPrinter({
        ...props.sale,
        client_name: props.sale.client_name || 'Consumidor Final',
        client_rif: props.sale.items?.[0]?.client_rif || ''
    })
}

const downloadPDF = async () => {
    const safeRef = String(props.sale.control_number || props.sale.id || '').slice(0, 8)
    const filename = props.sale.document_type === 'delivery_note' 
        ? `Nota_Entrega_${safeRef}.pdf` 
        : `Factura_${safeRef}.pdf`
        
    await generateReceiptPDF('invoice-a4-document', filename)
}

const isGeneratingCreditNote = ref(false)
const emit = defineEmits(['close', 'refresh'])

const issueCreditNote = async () => {
    if (!confirm('¿Está seguro de que desea anular esta factura? Se generará una Nota de Crédito, los productos regresarán al inventario y el monto será deducido de las ventas.')) {
        return
    }

    isGeneratingCreditNote.value = true
    try {
        const response = await $fetch('/api/sales/credit-note', {
            method: 'POST',
            body: {
                transactionId: props.sale.id,
                organizationId: organization.value?.id
            }
        })
        
        toast.success(`Nota de Crédito generada con éxito (Ref: ${response.creditNote.control_number || 'OK'})`)
        emit('close')
        emit('refresh') // Assuming parent handles refresh
    } catch (error: any) {
        console.error('Error emitiendo nota de crédito:', error)
        toast.error(error.data?.statusMessage || 'Error al emitir Nota de Crédito. Asegúrese de que no esté ya anulada.')
    } finally {
        isGeneratingCreditNote.value = false
    }
}

const canShare = computed(() => {
    return typeof navigator !== 'undefined' && !!navigator.share
})

const shareInvoice = async () => {
    try {
        const url = router.resolve(`/app/sales/print/${props.sale.id}`).href
        const fullUrl = window.location.origin + url
        await navigator.share({
            title: props.sale.document_type === 'delivery_note' ? `Nota de Entrega #${props.sale.id.slice(0, 8)}` : `Factura Softtuuls #${props.sale.control_number || props.sale.id.slice(0, 8)}`,
            text: `Aquí tienes tu comprobante digital. Total: ${formatMoney(showInVes.value ? paidVesAmount.value : baseUsdAmount.value, showInVes.value ? 'VES' : 'USD')}`,
            url: fullUrl
        })
    } catch (err) {
        console.error('Error sharing:', err)
    }
}

const printInvoice = () => {
    // Navigate to print page
    const url = router.resolve(`/app/sales/print/${props.sale.id}`).href
    window.open(url, '_blank')
}

// State for the toggle (User asked for a button)
const showInVes = ref(props.sale.currency === 'VES')

// Computed logic to handle legacy vs new data types
const isOriginalCurrencyVes = computed(() => props.sale.currency === 'VES')

// The Base Amount in USD (Accountable truth)
const baseUsdAmount = computed(() => {
    return Number(props.sale.amount)
})

// The Paid Amount in VES ( Transaction truth)
const paidVesAmount = computed(() => {
    return Number(props.sale.amount) * (Number(props.sale.exchange_rate) || 1)
})

const displayItems = computed(() => {
    let items = []
    
    // 1. Try relational data
    if (props.sale.items && Array.isArray(props.sale.items) && props.sale.items.length > 0) {
        items = props.sale.items.map((i: any) => ({
            qty: i.quantity,
            name: i.product?.name || 'Producto Desconocido',
            price: i.price_at_transaction || 0
        }))
    }
    // 2. Try Snapshot
    else if (props.sale.items_snapshot) {
        const raw = typeof props.sale.items_snapshot === 'string' 
            ? JSON.parse(props.sale.items_snapshot) 
            : props.sale.items_snapshot
        items = Array.isArray(raw) ? raw : []
    }

    // Normalize prices based on the toggle view
    return items.map(item => {
        let price = Number(item.price)
        // If the item price comes from DB, it's usually USD (unless legacy snapshot was VES).
        // Assuming database item prices are USD base.
        
        if (showInVes.value) {
             return { ...item, price: price * (Number(props.sale.exchange_rate) || 1) }
        }
        return { ...item, price }
    })
})

const displayPaymentMethod = (method: string) => {
    const map: Record<string, string> = {
        'mobile_pay': 'Pago Móvil',
        'transfer': 'Transferencia',
        'cash': 'Efectivo',
        'zelle': 'Zelle',
        'card': 'Tarjeta',
        'other': 'Otro'
    }
    return map[method] || method
}

// Helpers
const toggleCurrency = () => {
    showInVes.value = !showInVes.value
}

const formatMoney = (amount: number, currency: 'USD' | 'VES') => {
    if (currency === 'VES') {
        return `Bs. ${Number(amount || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else {
        return `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
}

// === Retenciones Fiscales Logic ===
const retention = ref<any>(null)
const showRetentionForm = ref(false)
const savingRetention = ref(false)
const retentionForm = ref({ percentage: 75, retention_number: '' })

const fetchRetention = async () => {
    if (props.sale.document_type !== 'invoice') return
    try {
        const { data, error } = await supabase
            .from('fiscal_retentions')
            .select('*')
            .eq('transaction_id', props.sale.id)
            .maybeSingle()
        if (data) retention.value = data
    } catch (e) {
        console.error('Error fetching retentions:', e)
    }
}

const saveRetention = async () => {
    if (!props.sale.organization_id || !retentionForm.value.retention_number) return
    savingRetention.value = true
    try {
        // Calcular el IVA retenido matemáticamente en base de USD
        const totalIvaUsd = (Number(props.sale.tax_general_amount) || 0) + (Number(props.sale.tax_reduced_amount) || 0)
        const amountRetained = totalIvaUsd * (retentionForm.value.percentage / 100)
        
        const { data, error } = await supabase.from('fiscal_retentions').insert({
            organization_id: props.sale.organization_id,
            transaction_id: props.sale.id,
            percentage: retentionForm.value.percentage,
            retention_number: retentionForm.value.retention_number,
            amount_retained: amountRetained
        }).select().single()

        if (error) throw error
        
        toast.success('Retención de IVA cargada correctamente')
        retention.value = data
        showRetentionForm.value = false
    } catch (e: any) {
        toast.error(e.message || 'Error al guardar retención')
    } finally {
        savingRetention.value = false
    }
}

onMounted(() => {
    fetchRetention()
})
</script>
