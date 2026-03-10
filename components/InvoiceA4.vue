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

        <!-- Items Table -->
        <section class="mb-6 flex-1 min-h-[300px]">
             <table class="w-full text-left border border-gray-300 collapse text-[11px]">
                 <thead class="bg-gray-100 border-b-2 border-gray-400">
                    <tr>
                        <th class="p-2 w-12 text-center font-bold border-r border-gray-300">CANT</th>
                        <th class="p-2 font-bold border-r border-gray-300">DOCUMENTO/SKU</th>
                        <th class="p-2 font-bold border-r border-gray-300">DESCRIPCIÓN</th>
                        <th class="p-2 w-24 text-right font-bold border-r border-gray-300">PRECIO U.</th>
                        <th class="p-2 w-16 text-center font-bold border-r border-gray-300">% IVA</th>
                        <th class="p-2 w-28 text-right font-bold">TOTAL BS</th>
                    </tr>
                 </thead>
                 <tbody class="font-mono">
                    <tr v-for="(item, i) in displayItems" :key="i" class="border-b border-gray-200">
                        <td class="p-2 text-center border-r border-gray-300 align-top">{{ item.qty }}</td>
                        <td class="p-2 border-r border-gray-300 align-top text-gray-600">{{ item.sku || '-' }}</td>
                        <td class="p-2 border-r border-gray-300 align-top uppercase">{{ item.name }}</td>
                        <td class="p-2 text-right border-r border-gray-300 align-top">
                            {{ formatMoneyCustom(item.price * exchangeRate, 'VES') }}
                        </td>
                        <td class="p-2 text-center border-r border-gray-300 align-top">16%</td>
                        <td class="p-2 text-right font-bold align-top text-gray-900">
                            {{ formatMoneyCustom((item.price * exchangeRate) * item.qty, 'VES') }}
                        </td>
                    </tr>
                 </tbody>
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
             <div class="border border-gray-300 rounded p-1">
                 <table class="w-full text-xs font-mono">
                     <tbody>
                         <tr>
                             <td class="p-1 font-bold text-gray-600 text-right pr-4 uppercase">Subtotal Neto:</td>
                             <td class="p-1 text-right border-b border-gray-100">{{ formatMoneyCustom(subtotalBs, 'VES') }}</td>
                         </tr>
                         <tr v-if="sale.discount > 0">
                             <td class="p-1 font-bold text-gray-600 text-right pr-4 uppercase">Descuento Global:</td>
                             <td class="p-1 text-right text-green-700 border-b border-gray-100">-{{ formatMoneyCustom(discountBs, 'VES') }}</td>
                         </tr>
                         <tr>
                             <td class="p-1 font-bold text-gray-600 text-right pr-4 uppercase">Ventas Exentas:</td>
                             <td class="p-1 text-right border-b border-gray-100">{{ formatMoneyCustom(exemptBs, 'VES') }}</td>
                         </tr>
                         <tr>
                             <td class="p-1 font-bold text-gray-600 text-right pr-4 uppercase">Base Imponible (16%):</td>
                             <td class="p-1 text-right border-b border-gray-100">{{ formatMoneyCustom(taxBaseBs, 'VES') }}</td>
                         </tr>
                         <tr>
                             <td class="p-1 font-bold text-gray-600 text-right pr-4 uppercase">Impuesto IVA (16%):</td>
                             <td class="p-1 text-right border-b border-gray-100">{{ formatMoneyCustom(taxGeneralBs, 'VES') }}</td>
                         </tr>
                         <tr v-if="sale.include_igtf && igtfAmountBs > 0">
                             <td class="p-1 font-bold text-gray-600 text-right pr-4 uppercase">Impuesto IGTF (3%):</td>
                             <td class="p-1 text-right border-b border-gray-100">{{ formatMoneyCustom(igtfAmountBs, 'VES') }}</td>
                         </tr>
                         <tr class="bg-gray-100">
                             <td class="p-2 font-bold text-gray-900 text-right pr-4 uppercase text-sm border-t-2 border-gray-800">Total a Pagar:</td>
                             <td class="p-2 font-bold text-right text-sm border-t-2 border-gray-800">{{ formatMoneyCustom(totalBs, 'VES') }}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </section>

        <!-- Disclaimer & Tasa -->
        <footer class="text-center text-[10px] text-gray-500 border-t border-gray-200 pt-2 pb-2 flex justify-between items-center">
             <span>Documento emitido en cumplimiento de normativas fiscales.</span>
             <span class="font-mono bg-yellow-50 px-2 py-1 rounded text-yellow-800 border border-yellow-200">
                 Tasa de cálculo utilizada: {{ formatMoneyCustom(exchangeRate, 'VES') }} Bs/USD
             </span>
             <span class="font-mono">Total Ref: ${{ Number(totalUsd).toFixed(2) }}</span>
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

// Matemáticas Base
const subtotalUsd = computed(() => Number(props.sale.subtotal) || 0)
const discountUsd = computed(() => Number(props.sale.discount) || 0)
const exemptUsd = computed(() => Number(props.sale.exempt_amount) || 0)
const taxBaseUsd = computed(() => Number(props.sale.tax_base) || 0)
const taxGeneralUsd = computed(() => Number(props.sale.tax_general_amount) || 0)
const igtfAmountUsd = computed(() => Number(props.sale.tax_igtf) || 0)
const totalUsd = computed(() => Number(props.sale.amount) || 0)

// Traducción a Bolívares (Monto legal impreso)
const subtotalBs = computed(() => subtotalUsd.value * exchangeRate.value)
const discountBs = computed(() => discountUsd.value * exchangeRate.value)
const exemptBs = computed(() => exemptUsd.value * exchangeRate.value)
const taxBaseBs = computed(() => taxBaseUsd.value * exchangeRate.value)
const taxGeneralBs = computed(() => taxGeneralUsd.value * exchangeRate.value)
const igtfAmountBs = computed(() => igtfAmountUsd.value * exchangeRate.value)
const totalBs = computed(() => totalUsd.value * exchangeRate.value)

const formatMoneyCustom = (val: number, currency: string) => {
    return `${currency === 'VES' ? 'Bs ' : '$'}${Number(val).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getPaymentMethodLabel = (method: string) => {
    switch(method) {
        case 'cash': return 'Efectivo';
        case 'zelle': return 'Zelle';
        case 'pago_movil': return 'Pago Móvil / Transferencia';
        case 'pos': return 'Punto de Venta';
        case 'split': return 'Pago Mixto'
        default: return 'No especificado';
    }
}
</script>
