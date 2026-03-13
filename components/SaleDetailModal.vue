<template>
  <AppModal :show="true" :title="sale.document_type === 'delivery_note' ? 'Nota de Entrega' : 'Factura Fiscal'" description="Recibo de operación" size="max-w-5xl w-[95vw] md:w-full" @close="$emit('close')">
    <div class="space-y-8">
        <!-- Header Info -->
        <div class="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-surface-border pb-6">
            <div class="space-y-1">
                <p class="text-[10px] text-primary-500 uppercase tracking-[0.2em] font-black mb-1">Cliente</p>
                <h2 class="text-3xl font-black text-text-heading tracking-tight">{{ sale.client?.name || sale.client_name || 'Cliente Casual' }}</h2>
                <div class="flex flex-wrap items-center gap-3 mt-3">
                     <span :class="[
                        'px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider',
                        sale.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    ]">
                        {{ sale.status === 'paid' ? 'DOCUMENTO PAGADO' : 'PAGO PENDIENTE' }}
                    </span>
                     <!-- Currency Toggle -->
                    <button v-if="hasVesPayment" @click="toggleCurrency" class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-surface-border text-text-secondary hover:bg-surface-subtle hover:text-text-heading transition-all flex items-center gap-2 shadow-sm bg-surface-ground active:scale-95">
                         <span>{{ showInVes ? 'Ver en USD ($)' : 'Ver en VES (Bs.)' }}</span>
                         <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    </button>
                </div>
            </div>
            <div class="text-left md:text-right space-y-1">
                <p class="text-[10px] text-primary-500 uppercase tracking-[0.2em] font-black mb-1">Detalles del Documento</p>
                <p class="font-mono text-base text-text-heading font-black tracking-tighter">{{ new Date(sale.created_at || Date.now()).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</p>
                <div class="flex flex-col md:items-end gap-0.5">
                    <span class="text-[10px] text-text-secondary font-mono uppercase tracking-[0.1em]">Control: {{ sale.control_number || 'S/N' }}</span>
                    <span class="text-[10px] text-text-secondary font-mono uppercase tracking-[0.1em]">ID: {{ sale.id.slice(0, 8).toUpperCase() }}</span>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div class="overflow-hidden rounded-2xl border border-surface-border bg-surface-subtle/20">
            <table class="min-w-full divide-y divide-surface-border">
                <thead>
                    <tr class="bg-surface-subtle/50">
                        <th class="px-6 py-4 text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] w-20">Cant</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Descripción del Producto</th>
                        <th class="px-6 py-4 text-right text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] whitespace-nowrap">Precio Unit</th>
                        <th class="px-6 py-4 text-right text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] whitespace-nowrap">Monto Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-surface-border/50">
                    <tr v-for="(item, i) in displayItems" :key="i" class="hover:bg-surface-subtle/40 transition-colors group">
                        <td class="px-6 py-4 text-sm text-text-secondary text-center font-mono font-bold">{{ item.qty }}</td>
                        <td class="px-6 py-4 text-sm font-bold text-text-heading">
                            {{ item.name }}
                             <div v-if="item.sku" class="text-[10px] font-mono text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">SKU: {{ item.sku }}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-text-secondary text-right font-mono font-bold whitespace-nowrap">
                            {{ formatMoney(item.price, showInVes ? 'VES' : 'USD') }}
                        </td>
                        <td class="px-6 py-4 text-sm font-black text-text-heading text-right font-mono whitespace-nowrap">
                             {{ formatMoney(item.price * item.qty, showInVes ? 'VES' : 'USD') }}
                        </td>
                    </tr>
                    <tr v-if="displayItems.length === 0">
                        <td colspan="4" class="px-6 py-12 text-center text-sm text-text-secondary italic bg-surface-ground">
                            No se encontraron items registrados para este documento.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>        <!-- Financials & Details -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            <!-- Left Side: Payment Details -->
            <div class="space-y-6">
                 <!-- Payment Method / Mixed Payment -->
                <div class="bg-surface-subtle/30 rounded-2xl p-6 border border-surface-border shadow-sm">
                     <!-- Mixed Payment Details -->
                     <div v-if="sale.payment_details && ((sale.payment_details.usd_amount || 0) > 0 || (sale.payment_details.ves_amount || 0) > 0)" class="space-y-4">
                        <div class="flex items-center gap-3 mb-4 border-b border-surface-border pb-4">
                             <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                             </div>
                             <span class="text-[10px] text-text-heading font-black uppercase tracking-[0.2em]">Desglose de Pago Mixto</span>
                        </div>
                        <div v-if="(sale.payment_details.usd_amount || 0) > 0" class="flex justify-between items-center group">
                            <span class="text-sm text-text-secondary font-bold group-hover:text-text-heading transition-colors">Divisa (Efectivo/Zelle)</span>
                            <span class="font-mono text-emerald-600 dark:text-emerald-400 font-black text-lg">${{ Number(sale.payment_details.usd_amount).toFixed(2) }}</span>
                        </div>
                        <div v-if="(sale.payment_details.ves_amount || 0) > 0" class="flex justify-between items-center group">
                            <span class="text-sm text-text-secondary font-bold group-hover:text-text-heading transition-colors">Bolívares (Pago Móvil/Punto)</span>
                            <span class="font-mono font-black text-primary-600 dark:text-primary-400 text-lg">Bs. {{ Number(sale.payment_details.ves_amount).toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}</span>
                        </div>
                        <div v-if="(sale.tax_igtf || 0) > 0" class="flex justify-between items-center text-[10px] mt-4 pt-4 border-t border-surface-border/50 border-dashed text-text-secondary">
                            <span class="font-bold uppercase tracking-widest">Base imponible IGTF</span>
                            <span class="font-mono font-black">${{ Number(sale.payment_details.igtf_base || sale.payment_details.usd_amount).toFixed(2) }}</span>
                        </div>
                     </div>

                     <!-- Standard Single Method Details -->
                     <div v-else class="space-y-4">
                         <div class="flex items-center gap-3 mb-4 border-b border-surface-border pb-4">
                             <div class="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                             </div>
                             <span class="text-[10px] text-text-heading font-black uppercase tracking-[0.2em]">Información de Pago</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-text-secondary font-bold">Método Utilizado</span>
                            <span class="text-sm text-text-heading font-black uppercase tracking-wider bg-surface-ground px-3 py-1 rounded-lg shadow-sm">{{ displayPaymentMethod(sale.payment_method) }}</span>
                        </div>
                        <div v-if="sale.exchange_rate" class="flex items-center justify-between text-text-secondary">
                            <span class="text-sm font-bold">Tasa de Cambio</span>
                            <span class="font-mono text-sm font-black">{{ Number(sale.exchange_rate).toLocaleString('es-VE', { minimumFractionDigits: 2 }) }} Bs/$</span>
                        </div>
                        <div v-if="sale.exchange_rate" class="flex items-center justify-between mt-2 pt-4 border-t border-surface-border/50 border-dashed">
                             <span class="text-[10px] text-text-secondary uppercase font-black tracking-widest">Equivalente {{ showInVes ? 'en USD' : 'en VES' }}</span>
                             <span class="font-mono text-sm font-black text-text-heading">
                                 {{ showInVes ? `$`+baseUsdAmount.toFixed(2) : `Bs. `+paidVesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
                             </span>
                        </div>
                     </div>

                     <!-- Common Reference -->
                     <div v-if="sale.payment_reference" class="mt-6 pt-6 border-t border-surface-border flex justify-between items-center bg-primary-50/30 dark:bg-primary-900/10 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                        <span class="text-[10px] text-primary-600 dark:text-primary-400 font-black uppercase tracking-[0.2em]">Referencia Bancaria</span>
                        <span class="font-mono text-base font-black text-primary-700 dark:text-primary-300">{{ sale.payment_reference }}</span>
                    </div>
                </div>
            </div>

            <!-- Right Side: Totals -->
            <div class="flex flex-col justify-end">
                <div class="space-y-3 bg-surface-subtle/10 rounded-2xl p-6 border border-surface-border">
                    <div class="flex justify-between items-center text-text-secondary">
                        <span class="text-sm font-bold">Subtotal Bruto</span>
                        <span class="font-mono font-bold">{{ formatMoney(showInVes ? financials.subtotal * (props.sale.exchange_rate || 1) : financials.subtotal, showInVes ? 'VES' : 'USD') }}</span>
                    </div>
                     <div v-if="financials.taxIva > 0" class="flex justify-between items-center text-text-secondary">
                        <span class="text-sm font-bold">Impuestos (IVA)</span>
                        <span class="font-mono font-bold">{{ formatMoney(showInVes ? financials.taxIva * (props.sale.exchange_rate || 1) : financials.taxIva, showInVes ? 'VES' : 'USD') }}</span>
                    </div>
                    <div v-if="financials.taxIgtf > 0" class="flex justify-between items-center text-text-secondary">
                        <span class="text-sm font-bold">Impuesto IGTF (3%)</span>
                        <span class="font-mono font-bold">{{ formatMoney(showInVes ? financials.taxIgtf * (props.sale.exchange_rate || 1) : financials.taxIgtf, showInVes ? 'VES' : 'USD') }}</span>
                    </div>
                    <div class="border-t border-surface-border pt-4 mt-4">
                        <div class="flex flex-col items-end">
                            <span class="text-[10px] text-primary-500 font-black uppercase tracking-[0.4em] mb-1">Total Final {{ showInVes ? 'Bolívares' : 'Dólares' }}</span>
                            <div class="text-5xl font-black text-primary-600 dark:text-primary-500 tracking-tighter font-mono">
                                {{ formatMoney(showInVes ? paidVesAmount : baseUsdAmount, showInVes ? 'VES' : 'USD') }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Fiscal Section (B2B) -->
        <div v-if="sale.document_type === 'invoice' && ((sale.tax_general_amount || 0) > 0 || (sale.tax_reduced_amount || 0) > 0)" class="mt-8 pt-8 border-t-4 border-double border-surface-border">
            <h3 class="text-[10px] font-black text-text-heading uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                Cumplimiento Tributario (Retenciones)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Retention IVA -->
                <div class="relative">
                    <!-- Mostrando Retención IVA Existente -->
                    <div v-if="retentionIva" class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 group hover:bg-emerald-500/20 transition-all">
                            <div class="flex justify-between items-start mb-4">
                                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">IVA Retenido ({{ retentionIva.percentage }}%)</span>
                                <div class="p-1 px-2 bg-emerald-500 text-white rounded text-[8px] font-black uppercase">Válido</div>
                            </div>
                            <div class="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mb-2">{{ formatMoney(retentionIva.amount_retained, 'USD') }}</div>
                            <div class="flex justify-between text-xs text-emerald-600/80 font-bold border-t border-emerald-500/20 pt-3">
                                <span>Comprobante:</span>
                                <span>#{{ retentionIva.retention_number }}</span>
                            </div>
                    </div>

                    <!-- Formulario para agregar IVA -->
                    <div v-else-if="showRetentionForm" class="space-y-4 bg-surface-subtle/50 p-6 rounded-2xl border border-primary-300 ring-4 ring-primary-500/5 animate-fade-in-up">
                            <h4 class="text-xs font-black uppercase tracking-widest text-primary-600">Cargar Retención IVA</h4>
                            <div class="grid grid-cols-2 gap-3">
                                <button @click="retentionForm.percentage = 75" :class="['py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all', retentionForm.percentage === 75 ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-surface-ground border-surface-border text-text-secondary']">75%</button>
                                <button @click="retentionForm.percentage = 100" :class="['py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all', retentionForm.percentage === 100 ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-surface-ground border-surface-border text-text-secondary']">100%</button>
                            </div>
                            <BaseInput v-model="retentionForm.retention_number" label="Número de Comprobante" placeholder="Ej. 202405000012" />
                            <div class="flex gap-3">
                                <BaseButton @click="saveRetention('iva')" :disabled="savingRetention || !retentionForm.retention_number" :loading="savingRetention" variant="primary" class="flex-1">Guardar</BaseButton>
                                <BaseButton @click="showRetentionForm = false" variant="secondary">Cancelar</BaseButton>
                            </div>
                    </div>
                    
                    <BaseButton v-else-if="!retentionIva" @click="showRetentionForm = true" variant="secondary" outline class="w-full h-[140px] border-dashed text-primary-600 border-primary-300 flex flex-col gap-2">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Cargar Retención IVA</span>
                    </BaseButton>
                </div>

                <!-- Retention ISLR -->
                <div class="relative">
                    <div v-if="retentionIslr" class="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 group hover:bg-blue-500/20 transition-all">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">ISLR Retenido ({{ retentionIslr.percentage }}%)</span>
                            <div class="p-1 px-2 bg-blue-500 text-white rounded text-[8px] font-black uppercase">Válido</div>
                        </div>
                        <div class="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono mb-2">{{ formatMoney(retentionIslr.amount_retained, 'USD') }}</div>
                        <div class="flex justify-between text-xs text-blue-600/80 font-bold border-t border-blue-500/20 pt-3">
                            <span>Comprobante:</span>
                            <span>#{{ retentionIslr.retention_number }}</span>
                        </div>
                    </div>

                    <div v-else-if="showIslrForm" class="space-y-4 bg-surface-subtle/50 p-6 rounded-2xl border border-blue-300 ring-4 ring-blue-500/5 animate-fade-in-up">
                        <h4 class="text-xs font-black uppercase tracking-widest text-blue-600">Cargar Retención ISLR</h4>
                        <div class="grid grid-cols-3 gap-2">
                            <button v-for="p in [1, 2, 3]" :key="p" @click="retentionForm.percentage = p" :class="['py-2 rounded-xl text-xs font-black border-2 transition-all', retentionForm.percentage === p ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-surface-ground border-surface-border text-text-secondary']">{{ p }}%</button>
                        </div>
                        <BaseInput v-model="retentionForm.retention_number" label="Comprobante ISLR" placeholder="Ej. ISLR-20240001" />
                        <div class="flex gap-3">
                            <BaseButton @click="saveRetention('islr')" :disabled="savingRetention || !retentionForm.retention_number" :loading="savingRetention" variant="primary" class="flex-1 bg-blue-600 hover:bg-blue-700">Guardar ISLR</BaseButton>
                            <BaseButton @click="showIslrForm = false" variant="secondary">Cancelar</BaseButton>
                        </div>
                    </div>

                    <BaseButton v-else-if="!retentionIslr" @click="showIslrForm = true; retentionForm.percentage = 2" variant="secondary" outline class="w-full h-[140px] border-dashed text-blue-600 border-blue-300 flex flex-col gap-2">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Cargar Retención ISLR</span>
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
    
    <div class="fixed top-[-9999px] left-[-9999px]">
        <InvoiceA4 id="invoice-a4-document" :sale="sale" :organization="organization" />
    </div>

    <template #actions>
        <div class="flex flex-wrap items-center justify-between gap-4 w-full">
            <div class="flex gap-3">
                <BaseButton v-if="sale.document_type === 'invoice'" @click="issueCreditNote" :disabled="isGeneratingCreditNote" :loading="isGeneratingCreditNote" variant="danger" outline class="font-black uppercase tracking-widest text-[10px]">
                    Anular Documento
                </BaseButton>
            </div>

            <div class="flex flex-wrap items-center gap-3">
                 <BaseButton v-if="canShare" @click="shareInvoice" variant="secondary" class="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    Compartir
                </BaseButton>
                
                <BaseButton @click="downloadPDF" :loading="generating" variant="primary" class="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Descargar PDF
                </BaseButton>

                <BaseButton @click="printInvoice" variant="secondary" class="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Ticket
                </BaseButton>

                <BaseButton v-if="fiscalAgentOnline" @click="printFiscal" :loading="printingFiscal" variant="success" class="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                    Imp. Fiscal
                </BaseButton>

                <div class="w-px h-8 bg-surface-border mx-2"></div>

                <BaseButton @click="$emit('close')" variant="secondary" class="font-black uppercase tracking-widest text-[10px]">
                    Cerrar
                </BaseButton>
            </div>
        </div>
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
    client?: {
        name: string;
    };
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

const hasVesPayment = computed(() => {
    if (props.sale.currency === 'VES') return true;
    if (props.sale.payment_details && Number(props.sale.payment_details.ves_amount) > 0) return true;
    return false;
})

const financials = computed(() => {
    const total = Number(props.sale.amount) || 0
    const taxIgtf = Number(props.sale.tax_igtf) || 0
    const taxIva = (Number(props.sale.tax_general_amount) || 0) + (Number(props.sale.tax_reduced_amount) || 0)
    const subtotal = total - taxIva - taxIgtf
    
    return {
        subtotal,
        taxIva,
        taxIgtf,
        total
    }
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
            .select('id, transaction_id, type, percentage, amount_retained, retention_number')
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
