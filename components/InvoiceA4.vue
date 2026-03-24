<template>
    <div 
        ref="invoiceRef"
        class="bg-white text-black print-container font-sans text-sm mx-auto"
        style="width: 794px; min-height: 1123px; padding: 40px; box-sizing: border-box;"
    >
        <!-- Header: Logo, Company Info & Invoice Data -->
        <header class="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4">
            <div class="flex items-start gap-4">
                <div v-if="organization?.logo_url" class="w-20 h-20 rounded shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center">
                    <img :src="organization.logo_url" alt="Logo" class="max-w-full max-h-full object-contain" />
                </div>
                <div>
                    <h1 class="text-2xl font-bold uppercase tracking-wide text-gray-900">{{ organization?.name || 'Soft Tuuls' }}</h1>
                    <p v-if="organization?.rif" class="text-xs text-gray-700 font-bold mt-1">RIF: {{ organization.rif }}</p>
                    <p class="text-xs text-gray-600 max-w-xs mt-1">{{ organization?.address || 'Dirección de la Empresa' }}</p>
                    <p v-if="organization?.phone" class="text-xs text-gray-600">Tel: {{ organization.phone }}</p>
                </div>
            </div>
            
            <div class="text-right">
                <div class="inline-block border-2 border-gray-800 p-2 rounded text-center min-w-[150px]">
                    <span class="text-[10px] font-bold uppercase text-gray-600 tracking-widest block">Factura Serie</span>
                    <span class="text-2xl font-mono font-bold text-red-600">Nº {{ formattedInvoiceNumber }}</span>
                </div>
                <div class="mt-2 text-right">
                    <div class="text-[11px] font-bold uppercase text-gray-500">N° de Control</div>
                    <div class="font-mono text-sm tracking-widest font-bold">{{ formattedControlNumber }}</div>
                </div>
            </div>
        </header>

        <!-- Client & Transaction Info Box -->
        <section class="grid grid-cols-3 gap-4 mb-6 text-xs">
            <!-- Client Info -->
            <div class="col-span-2 border border-gray-300 rounded p-3 bg-gray-50">
                <h2 class="font-bold uppercase text-gray-700 mb-2 border-b border-gray-200 pb-1">Datos del Cliente</h2>
                <div class="grid grid-cols-4 gap-2">
                    <div class="col-span-1 font-bold text-gray-600">Razón Social:</div>
                    <div class="col-span-3 font-medium uppercase">{{ sale.client?.name || 'Consumidor Final' }}</div>
                    
                    <div class="col-span-1 font-bold text-gray-600">RIF/C.I.:</div>
                    <div class="col-span-3 font-mono font-medium">{{ sale.client?.identity_document || 'V/E' }}</div>
                    
                    <div class="col-span-1 font-bold text-gray-600">Dirección:</div>
                    <div class="col-span-3 uppercase text-[11px] leading-tight">{{ sale.client?.address || 'DOMICILIO FISCAL NO REGISTRADO' }}</div>
                    
                    <div class="col-span-1 font-bold text-gray-600">Teléfono:</div>
                    <div class="col-span-3">{{ sale.client?.phone || 'N/A' }}</div>
                </div>
            </div>
            
            <!-- Dates & Payment Info -->
            <div class="col-span-1 border border-gray-300 rounded p-3 bg-gray-50 flex flex-col justify-between">
                <div>
                     <h2 class="font-bold uppercase text-gray-700 mb-2 border-b border-gray-200 pb-1">Transacción</h2>
                     <div class="flex justify-between mb-1">
                        <span class="font-bold text-gray-600">Fecha Emisión:</span>
                        <span class="font-mono">{{ formattedDate }}</span>
                     </div>
                     <div class="flex justify-between mb-1">
                        <span class="font-bold text-gray-600">Hora:</span>
                        <span class="font-mono">{{ formattedTime }}</span>
                     </div>
                     <div class="flex justify-between">
                        <span class="font-bold text-gray-600">Condición:</span>
                        <span class="uppercase">{{ getPaymentMethodLabel(sale.payment_method) }}</span>
                     </div>
                </div>
            </div>
        </section>

        <!-- Items Table (Full Detail) -->
        <section class="mb-4">
            <table class="w-full text-left border border-gray-300 text-[10px]" style="border-collapse: collapse;">
                <thead class="bg-gray-800 text-white">
                    <tr>
                        <th class="p-2 w-8 text-center border-r border-gray-600">CANT</th>
                        <th class="p-2 border-r border-gray-600">SKU</th>
                        <th class="p-2 border-r border-gray-600">DESCRIPCIÓN</th>
                        <th class="p-2 w-20 text-right border-r border-gray-600">P. UNIT (Bs)</th>
                        <th class="p-2 w-14 text-center border-r border-gray-600">DESC %</th>
                        <th class="p-2 w-20 text-right border-r border-gray-600">DESC (Bs)</th>
                        <th class="p-2 w-14 text-center border-r border-gray-600">ALÍC.</th>
                        <th class="p-2 w-20 text-right border-r border-gray-600">IVA (Bs)</th>
                        <th class="p-2 w-24 text-right">TOTAL (Bs)</th>
                    </tr>
                </thead>
                <tbody class="font-mono">
                    <tr v-for="(item, i) in displayItems" :key="i" :class="['border-b border-gray-200', i % 2 === 0 ? 'bg-white' : 'bg-gray-50']">
                        <td class="p-1.5 text-center border-r border-gray-200 align-top">{{ item.qty }}</td>
                        <td class="p-1.5 border-r border-gray-200 align-top text-gray-500">{{ item.sku || '-' }}</td>
                        <td class="p-1.5 border-r border-gray-200 align-top uppercase font-sans">{{ item.name }}</td>
                        <td class="p-1.5 text-right border-r border-gray-200 align-top">
                            {{ fmt(item.price * exchangeRate) }}
                        </td>
                        <td class="p-1.5 text-center border-r border-gray-200 align-top">
                            <span v-if="item.discount && item.discount > 0">{{ item.discount }}%</span>
                            <span v-else class="text-gray-300">—</span>
                        </td>
                        <td class="p-1.5 text-right border-r border-gray-200 align-top text-green-700">
                            <span v-if="item.discount && item.discount > 0">
                                -{{ fmt((item.price * item.qty) * (item.discount / 100) * exchangeRate) }}
                            </span>
                            <span v-else class="text-gray-300">—</span>
                        </td>
                        <td class="p-1.5 text-center border-r border-gray-200 align-top">
                            <span v-if="itemIsExempt(item)" class="font-bold text-blue-700">EXENTO</span>
                            <span v-else>{{ itemTaxRate(item) }}%</span>
                        </td>
                        <td class="p-1.5 text-right border-r border-gray-200 align-top">
                            <span v-if="!itemIsExempt(item)">
                                {{ fmt(itemTaxAmount(item) * exchangeRate) }}
                            </span>
                            <span v-else class="text-gray-300">—</span>
                        </td>
                        <td class="p-1.5 text-right font-bold align-top text-gray-900">
                            {{ fmt(itemTotal(item) * exchangeRate) }}
                        </td>
                    </tr>
                </tbody>
                <!-- Column Sub-totals row -->
                <tfoot class="bg-gray-100 border-t-2 border-gray-400 font-mono text-[10px]">
                    <tr>
                        <td colspan="5" class="p-1.5 text-right font-bold text-gray-600 border-r border-gray-300">TOTALES:</td>
                        <td class="p-1.5 text-right font-bold text-green-700 border-r border-gray-300">
                            -{{ fmt(discountBs) }}
                        </td>
                        <td class="p-1.5 text-center border-r border-gray-300">
                            <span v-if="exemptBs > 0" class="text-blue-700 font-bold text-[9px]">Inc. Exentos</span>
                        </td>
                        <td class="p-1.5 text-right font-bold border-r border-gray-300">{{ fmt(taxGeneralBs) }}</td>
                        <td class="p-1.5 text-right font-bold text-gray-900">{{ fmt(totalBs) }}</td>
                    </tr>
                </tfoot>
            </table>
        </section>

        <!-- Totals Summary Grid -->
        <section class="grid grid-cols-2 gap-8 items-start mb-6 border-t-2 border-gray-800 pt-4">
             <!-- Notes & Signatures -->
             <div class="text-[10px] text-gray-500">
                  <p class="mb-4 text-justify pr-4">
                      Factura emitida bajo controles fiscales. Esta factura es válida sin firma y sello según las providencias normativas. La moneda base de la operación interna fue pactada a una tasa de cambio del Banco Central de Venezuela (BCV).
                  </p>
                  
                  <div class="flex justify-between px-8 text-center mt-12 gap-8">
                      <div class="border-t border-gray-400 pt-1 w-full uppercase">Firma Emisor</div>
                      <div class="border-t border-gray-400 pt-1 w-full uppercase">Firma Receptor</div>
                  </div>
             </div>

             <!-- Math Section -->
             <div class="border border-gray-300 rounded overflow-hidden">
                 <table class="w-full text-xs font-mono">
                     <thead class="bg-gray-100 border-b border-gray-300">
                         <tr>
                             <th class="p-1.5 font-bold text-gray-700 text-left pl-3 uppercase text-[10px]">Concepto</th>
                             <th class="p-1.5 font-bold text-gray-700 text-right pr-3 uppercase text-[10px]">Bs.</th>
                             <th class="p-1.5 font-bold text-gray-700 text-right pr-3 uppercase text-[10px]">$</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr class="border-b border-gray-100">
                             <td class="p-1.5 font-bold text-gray-600 pl-3 uppercase">Subtotal Bruto:</td>
                             <td class="p-1.5 text-right pr-3">{{ fmt(subtotalBs) }}</td>
                             <td class="p-1.5 text-right pr-3 text-gray-500">${{ fmtUsd(subtotalUsd) }}</td>
                         </tr>
                         <tr v-if="discountBs > 0" class="border-b border-gray-100">
                             <td class="p-1.5 font-bold text-gray-600 pl-3 uppercase">Descuento Global:</td>
                             <td class="p-1.5 text-right pr-3 text-green-700">-{{ fmt(discountBs) }}</td>
                             <td class="p-1.5 text-right pr-3 text-green-600">-${{ fmtUsd(discountUsd) }}</td>
                         </tr>
                         <tr class="border-b border-gray-100 bg-blue-50">
                             <td class="p-1.5 font-bold text-blue-700 pl-3 uppercase">Ventas Exentas:</td>
                             <td class="p-1.5 text-right pr-3 text-blue-700 font-bold">{{ fmt(exemptBs) }}</td>
                             <td class="p-1.5 text-right pr-3 text-blue-500">${{ fmtUsd(exemptUsd) }}</td>
                         </tr>
                         <tr class="border-b border-gray-100">
                             <td class="p-1.5 font-bold text-gray-600 pl-3 uppercase">Base Imponible (16%):</td>
                             <td class="p-1.5 text-right pr-3">{{ fmt(taxBaseBs) }}</td>
                             <td class="p-1.5 text-right pr-3 text-gray-500">${{ fmtUsd(taxBaseUsd) }}</td>
                         </tr>
                         <tr class="border-b border-gray-100">
                             <td class="p-1.5 font-bold text-gray-600 pl-3 uppercase">IVA (16%):</td>
                             <td class="p-1.5 text-right pr-3">{{ fmt(taxGeneralBs) }}</td>
                             <td class="p-1.5 text-right pr-3 text-gray-500">${{ fmtUsd(taxGeneralUsd) }}</td>
                         </tr>
                         <tr v-if="sale.tax_reduced_amount > 0" class="border-b border-gray-100">
                             <td class="p-1.5 font-bold text-gray-600 pl-3 uppercase">IVA Reducido (8%):</td>
                             <td class="p-1.5 text-right pr-3">{{ fmt(Number(sale.tax_reduced_amount) * exchangeRate) }}</td>
                             <td class="p-1.5 text-right pr-3 text-gray-500">${{ fmtUsd(Number(sale.tax_reduced_amount)) }}</td>
                         </tr>
                         <tr v-if="sale.include_igtf && igtfAmountBs > 0" class="border-b border-gray-100">
                             <td class="p-1.5 font-bold text-gray-600 pl-3 uppercase">IGTF (3%):</td>
                             <td class="p-1.5 text-right pr-3">{{ fmt(igtfAmountBs) }}</td>
                             <td class="p-1.5 text-right pr-3 text-gray-500">${{ fmtUsd(igtfAmountUsd) }}</td>
                         </tr>
                         <tr class="bg-gray-800 text-white">
                             <td class="p-2 font-bold pl-3 uppercase text-sm">TOTAL A PAGAR:</td>
                             <td class="p-2 font-bold text-right pr-3 text-sm">{{ fmt(totalBs) }}</td>
                             <td class="p-2 font-bold text-right pr-3 text-sm text-yellow-300">${{ fmtUsd(totalUsd) }}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </section>

        <!-- Disclaimer & Tasa -->
        <footer class="text-center text-[10px] text-gray-500 border-t border-gray-200 pt-2 pb-2 flex justify-between items-center">
             <span>Documento emitido en cumplimiento de normativas fiscales.</span>
             <span class="font-mono bg-yellow-50 px-2 py-1 rounded text-yellow-800 border border-yellow-200">
                 Tasa BCV: {{ fmt(exchangeRate) }} Bs/USD
             </span>
             <span class="font-mono">Total Ref: ${{ fmtUsd(totalUsd) }}</span>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  sale: {
    type: Object as any,
    required: true
  },
  organization: {
    type: Object as any,
    required: true
  }
})

// Fechas y Números
const formattedInvoiceNumber = computed(() => {
    return String(props.sale.invoice_number || props.sale.id.split('-')[0]).padStart(6, '0')
})

const formattedControlNumber = computed(() => {
    return String(props.sale.control_number || props.sale.invoice_number || props.sale.id.split('-')[0]).padStart(6, '0')
})

const formattedDate = computed(() => {
    if (!props.sale.date) return ''
    return new Date(props.sale.date).toLocaleDateString('es-VE')
})

const formattedTime = computed(() => {
    if (!props.sale.created_at) return ''
    return new Date(props.sale.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
})

// Items
const displayItems = computed(() => {
    if (props.sale.items_snapshot) return props.sale.items_snapshot
    if (props.sale.items) return props.sale.items
    return []
})

// Exchange Rate
const exchangeRate = computed(() => Number(props.sale.exchange_rate) || 1)

// Per-item helpers
const itemTaxRate = (item: any): number => {
    if (item.taxRate !== undefined) return item.taxRate
    if (item.tax_rate !== undefined) return item.tax_rate
    const cond = (item.tax_condition || '').toLowerCase()
    if (cond === 'exempt' || cond === 'exento' || cond === 'e') return 0
    if (cond === 'reduced') return 8
    return 16
}

const itemIsExempt = (item: any): boolean => itemTaxRate(item) === 0

const itemNetBase = (item: any): number => {
    const gross = (item.price || 0) * (item.qty || item.quantity || 1)
    const disc = item.discount ? gross * (item.discount / 100) : 0
    return gross - disc
}

const itemTaxAmount = (item: any): number => {
    return itemNetBase(item) * (itemTaxRate(item) / 100)
}

const itemTotal = (item: any): number => {
    return itemNetBase(item) + itemTaxAmount(item)
}

// Matematicas base
const subtotalUsd = computed(() => Number(props.sale.subtotal) || 0)
const discountUsd = computed(() => Number(props.sale.discount) || 0)
const exemptUsd = computed(() => Number(props.sale.exempt_amount) || 0)
const taxBaseUsd = computed(() => Number(props.sale.tax_base) || 0)
const taxGeneralUsd = computed(() => Number(props.sale.tax_general_amount) || 0)
const igtfAmountUsd = computed(() => Number(props.sale.tax_igtf) || 0)
const totalUsd = computed(() => Number(props.sale.amount) || 0)

// Traducción a Bolívares
const subtotalBs = computed(() => subtotalUsd.value * exchangeRate.value)
const discountBs = computed(() => discountUsd.value * exchangeRate.value)
const exemptBs = computed(() => exemptUsd.value * exchangeRate.value)
const taxBaseBs = computed(() => taxBaseUsd.value * exchangeRate.value)
const taxGeneralBs = computed(() => taxGeneralUsd.value * exchangeRate.value)
const igtfAmountBs = computed(() => igtfAmountUsd.value * exchangeRate.value)
const totalBs = computed(() => totalUsd.value * exchangeRate.value)

const fmt = (val: number) => {
    return `Bs ${Number(val).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const fmtUsd = (val: number) => {
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
        'cash': 'Efectivo',
        'zelle': 'Zelle',
        'mobile_pay': 'Pago Móvil',
        'pago_movil': 'Pago Móvil',
        'card': 'Punto de Venta',
        'pos': 'Punto de Venta',
        'transfer': 'Transferencia',
        'transferencia': 'Transferencia',
        'split': 'Pago Mixto',
        'other': 'Crédito / Otro',
        'credit': 'Venta a Crédito',
    }
    return map[method] || method || 'No especificado'
}
</script>
