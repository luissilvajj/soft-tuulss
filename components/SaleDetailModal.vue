<template>
  <AppModal :show="true" :title="sale.document_type === 'delivery_note' ? 'Nota de Entrega' : 'Factura Fiscal'" description="Recibo de operación" @close="$emit('close')">
    <div class="space-y-6">
        <!-- Header Info -->
        <div class="flex justify-between items-start border-b border-surface-border pb-4">
            <div>
                <p class="text-xs text-primary-500 uppercase tracking-widest font-extrabold mb-1">Cliente</p>
                <p class="text-xl font-bold text-text-heading">{{ sale.client_name || 'Cliente Casual' }}</p>
                <div class="flex items-center gap-2 mt-2">
                     <span :class="[
                        'px-2 py-1 text-xs font-bold rounded-full',
                        sale.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                    ]">
                        {{ sale.status === 'paid' ? 'PAGADO' : 'PENDIENTE' }}
                    </span>
                     <!-- Currency Toggle -->
                    <button @click="toggleCurrency" class="px-3 py-1 rounded-lg text-xs font-bold border border-surface-border text-text-secondary hover:bg-surface-subtle hover:text-text-heading transition-colors flex items-center gap-1 shadow-sm bg-surface-ground">
                         <span class="uppercase tracking-wider">{{ showInVes ? 'Ver en Dólares' : 'Ver en Bolívares' }}</span>
                         <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    </button>
                </div>
            </div>
            <div class="text-right">
                <p class="text-xs text-primary-500 uppercase tracking-widest font-extrabold mb-1">Fecha</p>
                <p class="font-mono text-sm text-text-heading font-semibold">{{ new Date(sale.created_at || Date.now()).toLocaleString() }}</p>
                <p class="text-[10px] text-text-secondary mt-1 font-mono uppercase tracking-widest">Ref: {{ sale.payment_reference || 'N/A' }}</p>
            </div>
        </div>

        <!-- Items Table -->
        <!-- Items Table -->
        <div class="overflow-hidden rounded-xl border border-surface-border shadow-sm">
            <table class="min-w-full divide-y divide-surface-border">
                <thead class="bg-surface-subtle">
                    <tr>
                        <th class="px-4 py-3 text-center text-[10px] font-extrabold text-text-secondary uppercase tracking-widest w-16">Cant.</th>
                        <th class="px-4 py-3 text-left text-[10px] font-extrabold text-text-secondary uppercase tracking-widest w-full">Producto</th>
                        <th class="px-4 py-3 text-right text-[10px] font-extrabold text-text-secondary uppercase tracking-widest whitespace-nowrap">Precio Unit.</th>
                        <th class="px-4 py-3 text-right text-[10px] font-extrabold text-text-secondary uppercase tracking-widest whitespace-nowrap">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-surface-border bg-surface-ground">
                    <tr v-for="(item, i) in displayItems" :key="i" class="hover:bg-surface-subtle/50 transition-colors">
                        <td class="px-4 py-3 text-sm text-text-secondary text-center font-mono font-bold">{{ item.qty }}</td>
                        <td class="px-4 py-3 text-sm font-semibold text-text-heading">{{ item.name }}</td>
                        <td class="px-4 py-3 text-sm text-text-secondary text-right font-mono whitespace-nowrap">
                            {{ formatMoney(item.price, showInVes ? 'VES' : 'USD') }}
                        </td>
                        <td class="px-4 py-3 text-sm font-bold text-text-heading text-right font-mono whitespace-nowrap">
                             {{ formatMoney(item.price * item.qty, showInVes ? 'VES' : 'USD') }}
                        </td>
                    </tr>
                    <tr v-if="displayItems.length === 0">
                        <td colspan="4" class="px-4 py-8 text-center text-sm text-text-secondary italic">
                            No hay items registrados
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Financials -->
        <div class="flex justify-end mt-6">
            <div class="w-full sm:w-2/3 md:w-1/2 space-y-4">
                 <!-- Main Display (Toggled) -->
                <div class="border-t border-surface-border pt-4">
                    <div class="flex justify-between text-xl font-extrabold text-text-heading">
                        <span>Total {{ showInVes ? 'Bolívares' : 'USD' }}</span>
                        <!-- If showing VES, use paidVesAmount. If USD, use baseUsdAmount -->
                         <span class="font-mono whitespace-nowrap text-primary-600 dark:text-primary-400">
                            {{ formatMoney(showInVes ? paidVesAmount : baseUsdAmount, showInVes ? 'VES' : 'USD') }}
                         </span>
                    </div>
                </div>

                <!-- Context Box -->
                <div class="bg-surface-subtle/50 rounded-xl p-4 border border-surface-border text-sm shadow-inner group">
                     
                     <!-- Mixed Payment Details -->
                     <div v-if="sale.payment_details && ((sale.payment_details.usd_amount || 0) > 0 || (sale.payment_details.ves_amount || 0) > 0)" class="space-y-3">
                        <div class="flex justify-between text-text-heading font-extrabold text-xs uppercase tracking-widest mb-2 border-b border-surface-border pb-2">
                            <span>Desglose de Pago (Mixto)</span>
                        </div>
                        <div v-if="(sale.payment_details.usd_amount || 0) > 0" class="flex justify-between items-center text-text-secondary">
                            <span class="font-medium">Pagado en Divisa</span>
                            <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">${{ Number(sale.payment_details.usd_amount).toFixed(2) }}</span>
                        </div>
                        <div v-if="(sale.payment_details.ves_amount || 0) > 0" class="flex justify-between items-center text-text-secondary">
                            <span class="font-medium">Pagado en Bolívares</span>
                            <div class="text-right">
                                <span class="font-mono font-bold text-primary-600 block whitespace-nowrap">Bs. {{ Number(sale.payment_details.ves_amount).toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}</span>
                            </div>
                        </div>
                         <div v-if="(sale.tax_igtf || 0) > 0" class="flex justify-between text-text-secondary text-xs mt-2 pt-2 border-t border-surface-border/50 border-dashed">
                            <span>Base IGTF (Divisa)</span>
                            <span class="font-mono font-semibold whitespace-nowrap">${{ Number(sale.payment_details.igtf_base || sale.payment_details.usd_amount).toFixed(2) }}</span>
                        </div>
                     </div>

                     <!-- Standard Single Method Details -->
                     <div v-else>
                         <div class="flex justify-between items-center text-text-secondary">
                            <span class="font-medium">Método de Pago</span>
                            <span class="text-text-heading font-semibold capitalize">{{ displayPaymentMethod(sale.payment_method) }}</span>
                        </div>
                        <div v-if="sale.exchange_rate" class="flex items-center justify-between text-text-secondary mt-2 pt-2 border-t border-surface-border/50 border-dashed">
                            <span class="font-medium">Tasa de Cambio</span>
                            <span class="font-mono text-xs">{{ Number(sale.exchange_rate).toLocaleString('es-VE', { minimumFractionDigits: 2 }) }} Bs/$</span>
                        </div>
                        <!-- Provide alternative context based on state -->
                        <div v-if="sale.exchange_rate" class="flex items-center justify-between mt-2 pt-2 border-t border-surface-border/50 border-dashed">
                             <span class="text-xs text-text-secondary truncate pr-2">Equivalente {{ showInVes ? 'en Dólares' : 'en Bolívares' }}</span>
                             <span class="font-mono text-xs font-bold text-text-heading whitespace-nowrap">
                                 {{ showInVes ? `$`+baseUsdAmount.toFixed(2) : `Bs. `+paidVesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
                             </span>
                        </div>
                     </div>

                     <!-- Common Reference -->
                     <div v-if="sale.payment_reference" class="mt-4 pt-4 border-t border-surface-border">
                        <div class="flex justify-between text-text-secondary">
                            <span>Referencia</span>
                            <span class="font-mono whitespace-nowrap">{{ sale.payment_reference }}</span>
                        </div>
                    </div>

                    <!-- Retenciones Fiscales (B2B) -->
                    <div v-if="sale.document_type === 'invoice' && ((sale.tax_general_amount || 0) > 0 || (sale.tax_reduced_amount || 0) > 0)" class="mt-4 pt-4 border-t-2 border-dashed border-surface-border">
                        <div class="flex justify-between items-center mb-2">
                             <span class="font-bold text-sm text-text-heading">Retención de IVA (B2B)</span>
                        </div>
                        
                        <!-- Mostrando Retención IVA Existente -->
                        <div v-if="retentionIva" class="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2 text-xs">
                             <div class="flex justify-between text-emerald-500 font-bold mb-1">
                                 <span>Retenido ({{ retentionIva.percentage }}%)</span>
                                 <span class="font-mono">{{ formatMoney(retentionIva.amount_retained, 'USD') }}</span>
                             </div>
                             <div class="flex justify-between text-emerald-500/80">
                                 <span>Comprobante:</span>
                                 <span class="font-mono">{{ retentionIva.retention_number }}</span>
                             </div>
                        </div>

                        <!-- Formulario para agregar IVA -->
                        <div v-else-if="showRetentionForm" class="space-y-2 mt-2 bg-surface-subtle p-2 rounded-md border border-surface-border">
                             <div>
                                 <label class="block text-[10px] uppercase text-text-secondary font-bold mb-1">Porcentaje</label>
                                  <div class="flex gap-2">
                                     <button @click="retentionForm.percentage = 75" :class="['flex-1 py-1 rounded text-xs font-bold border', retentionForm.percentage === 75 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-surface-border text-text-secondary']">75%</button>
                                     <button @click="retentionForm.percentage = 100" :class="['flex-1 py-1 rounded text-xs font-bold border', retentionForm.percentage === 100 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-surface-border text-text-secondary']">100%</button>
                                  </div>
                             </div>
                             <div>
                                 <label class="block text-[10px] uppercase text-text-secondary font-bold mb-1">Nro Comprobante</label>
                                 <input v-model="retentionForm.retention_number" type="text" class="w-full text-xs p-1.5 border border-surface-border rounded bg-surface-ground text-text-heading focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Ej. 202405000012">
                             </div>
                             <div class="flex gap-2 pt-1">
                                  <button @click="saveRetention('iva')" :disabled="savingRetention || !retentionForm.retention_number" class="flex-1 bg-primary-600 text-white rounded py-1.5 text-xs font-bold disabled:opacity-50">Guardar</button>
                                  <button @click="showRetentionForm = false" class="px-3 border border-surface-border rounded text-text-secondary text-xs font-bold">Cancelar</button>
                             </div>
                        </div>
                        
                        <!-- Boton Activar Toggle IVA -->
                        <button v-else-if="!retentionIva" @click="showRetentionForm = true" class="w-full py-1.5 mt-1 border border-dashed border-primary-300 text-primary-600 hover:bg-primary-50 rounded-md text-xs font-bold transition-colors">
                            + Cargar Comprobante Retención IVA
                        </button>

                        <!-- === Retención de ISLR === -->
                        <div class="mt-3 pt-3 border-t border-surface-border/50">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-bold text-sm text-text-heading">Retención de ISLR (Servicios)</span>
                            </div>
                            
                            <!-- Mostrando Retención ISLR existente -->
                            <div v-if="retentionIslr" class="bg-blue-500/10 border border-blue-500/20 rounded-md p-2 text-xs">
                                <div class="flex justify-between text-blue-600 font-bold mb-1">
                                    <span>Retenido ISLR ({{ retentionIslr.percentage }}%)</span>
                                    <span class="font-mono">{{ formatMoney(retentionIslr.amount_retained, 'USD') }}</span>
                                </div>
                                <div class="flex justify-between text-blue-500/80">
                                    <span>Comprobante:</span>
                                    <span class="font-mono">{{ retentionIslr.retention_number }}</span>
                                </div>
                            </div>

                            <!-- Formulario ISLR -->
                            <div v-else-if="showIslrForm" class="space-y-2 mt-2 bg-surface-subtle p-2 rounded-md border border-surface-border">
                                <div>
                                    <label class="block text-[10px] uppercase text-text-secondary font-bold mb-1">Porcentaje ISLR</label>
                                    <div class="flex gap-2">
                                        <button @click="retentionForm.percentage = 1" :class="['flex-1 py-1 rounded text-xs font-bold border', retentionForm.percentage === 1 ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-surface-border text-text-secondary']">1%</button>
                                        <button @click="retentionForm.percentage = 2" :class="['flex-1 py-1 rounded text-xs font-bold border', retentionForm.percentage === 2 ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-surface-border text-text-secondary']">2%</button>
                                        <button @click="retentionForm.percentage = 3" :class="['flex-1 py-1 rounded text-xs font-bold border', retentionForm.percentage === 3 ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-surface-border text-text-secondary']">3%</button>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-[10px] uppercase text-text-secondary font-bold mb-1">Nro Comprobante ISLR</label>
                                    <input v-model="retentionForm.retention_number" type="text" class="w-full text-xs p-1.5 border border-surface-border rounded bg-surface-ground text-text-heading focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Ej. ISLR-20240500012">
                                </div>
                                <div class="flex gap-2 pt-1">
                                    <button @click="saveRetention('islr')" :disabled="savingRetention || !retentionForm.retention_number" class="flex-1 bg-blue-600 text-white rounded py-1.5 text-xs font-bold disabled:opacity-50">Guardar ISLR</button>
                                    <button @click="showIslrForm = false" class="px-3 border border-surface-border rounded text-text-secondary text-xs font-bold">Cancelar</button>
                                </div>
                            </div>

                            <!-- Botón para activar formulario ISLR -->
                            <button v-else-if="!retentionIslr" @click="showIslrForm = true; retentionForm.percentage = 2" class="w-full py-1.5 mt-1 border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-md text-xs font-bold transition-colors">
                                + Cargar Comprobante Retención ISLR
                            </button>
                        </div>
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
        const response: any = await $fetch('/api/sales/credit-note', {
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
const retentions = ref<any[]>([])
const showRetentionForm = ref(false)
const showIslrForm = ref(false)

const savingRetention = ref(false)
const retentionForm = ref({ percentage: 75, retention_number: '', type: 'iva' })

const retentionIva = computed(() => retentions.value.find(r => r.type === 'iva'))
const retentionIslr = computed(() => retentions.value.find(r => r.type === 'islr'))

const fetchRetention = async () => {
    if (props.sale.document_type !== 'invoice') return
    try {
        const { data, error } = await supabase
            .from('fiscal_retentions')
            .select('*')
            .eq('transaction_id', props.sale.id)
        if (data) retentions.value = data
    } catch (e) {
        console.error('Error fetching retentions:', e)
    }
}

const saveRetention = async (type: 'iva' | 'islr') => {
    if (!props.sale.organization_id || !retentionForm.value.retention_number) return
    savingRetention.value = true
    try {
        let amountRetained = 0

        if (type === 'iva') {
            const totalIvaUsd = (Number(props.sale.tax_general_amount) || 0) + (Number(props.sale.tax_reduced_amount) || 0)
            amountRetained = Number((totalIvaUsd * (retentionForm.value.percentage / 100)).toFixed(2))
        } else {
            // ISLR percibe sobre la Base Imponible (Servicios)
            amountRetained = Number(((Number(props.sale.tax_base) || 0) * (retentionForm.value.percentage / 100)).toFixed(2))
        }

        const payload: any = {
             organization_id: organization.value.id,
             transaction_id: props.sale.id,
             percentage: retentionForm.value.percentage,
             retention_number: retentionForm.value.retention_number,
             amount_retained: amountRetained,
             type: type
        }

        const { data, error } = await supabase
            .from('fiscal_retentions')
            .upsert(payload, { onConflict: 'transaction_id,type' })
            .select()
            .single()

        if (error) throw error
        
        toast.success(`Retención de ${type.toUpperCase()} cargada correctamente`)
        
        // Push o Update array local
        const idx = retentions.value.findIndex(r => r.type === type)
        if (idx !== -1) retentions.value[idx] = data
        else retentions.value.push(data)
        
        showRetentionForm.value = false
        showIslrForm.value = false
        retentionForm.value.retention_number = ''
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
