<template>
  <div class="hidden">
      <!-- Hidden element for rendering -->
      <div 
        id="ticket-render" 
        class="bg-white text-black font-mono text-xs w-[300px] p-4 leading-tight"
        style="font-family: 'Courier New', Courier, monospace;"
      >
          <!-- Header -->
          <div class="text-center mb-4">
              <h2 class="font-bold text-base">{{ organization?.name }}</h2>
              <p class="text-[10px] mt-1">{{ organization?.address }}</p>
              <p v-if="organization?.fiscal_doc" class="text-[10px] mt-1">RIF/NIT: {{ organization.fiscal_doc }}</p>
              <p v-if="organization?.phone" class="text-[10px] mt-1">Tel: {{ organization.phone }}</p>
              <p class="text-[10px] mt-1">{{ formatDate(info.date) }}</p>
              <p class="text-[10px]">#{{ info.paymentReference || 'S/R' }}</p>
          </div>

          <!-- Client -->
           <div class="border-b border-black border-dashed pb-2 mb-2">
              <p>Clt: {{ info.clientName || 'Consumidor Final' }}</p>
              <p v-if="info.clientDoc">CI/RIF: {{ info.clientDoc }}</p>
           </div>

          <!-- Items -->
          <div class="mb-2">
               <div v-for="item in items" :key="item.id" class="flex justify-between mb-1">
                   <div class="flex-1">
                       <p>
                           {{ item.qty }} x {{ item.name }} 
                           <span class="font-bold">{{ getTaxIndicator(item) }}</span>
                       </p>
                   </div>
                   <div class="text-right">
                       <span v-if="item.discount > 0" class="line-through text-[8px] mr-1">{{ formatMoney(item.qty * item.price) }}</span>
                       <span>{{ formatMoney((item.qty * item.price) - (item.discount || 0)) }}</span>
                   </div>
               </div>
          </div>

          <!-- Totals -->
          <div class="border-t border-black border-dashed pt-2">
              <!-- Tax breakdown -->
              <div class="text-[10px] space-y-0.5 mt-2 mb-2 pb-2 border-b border-black border-dashed">
                  <div class="flex justify-between" v-if="(info.exemptAmount || 0) > 0">
                      <span>Monto Exento (E):</span>
                      <span>{{ formatMoney(info.exemptAmount) }}</span>
                  </div>
                  <div class="flex justify-between" v-if="(info.baseGeneral || 0) > 0">
                      <span>Base Imponible (G):</span>
                      <span>{{ formatMoney(info.baseGeneral) }}</span>
                  </div>
                  <div class="flex justify-between" v-if="(info.taxGeneralAmount || 0) > 0">
                      <span>IVA General (16%):</span>
                      <span>{{ formatMoney(info.taxGeneralAmount) }}</span>
                  </div>
                  <div class="flex justify-between" v-if="(info.baseReduced || 0) > 0">
                      <span>Base Reducida (R):</span>
                      <span>{{ formatMoney(info.baseReduced) }}</span>
                  </div>
                  <div class="flex justify-between" v-if="(info.taxReducedAmount || 0) > 0">
                      <span>IVA Reducido (8%):</span>
                      <span>{{ formatMoney(info.taxReducedAmount) }}</span>
                  </div>
                  <div class="flex justify-between" v-if="(info.taxIgtf || 0) > 0">
                      <span>IGTF (3%):</span>
                      <span>{{ formatMoney(info.taxIgtf) }}</span>
                  </div>
              </div>

              <!-- Grand Total -->
              <div class="flex justify-between font-bold text-sm">
                  <span>TOTAL A PAGAR</span>
                  <span>{{ formatMoney(info.total) }}</span>
              </div>
               <div class="flex justify-between text-[10px] mt-1 pt-1 border-t border-black border-dashed">
                  <span>Moneda Ref:</span>
                  <span>{{ info.currency }}</span>
              </div>
               <div v-if="info.currency === 'VES'" class="flex justify-between text-[10px]">
                  <span>Tasa Cambio (BCV):</span>
                  <span>Bs. {{ Number(info.exchangeRate).toFixed(4) }} / USD</span>
              </div>
          </div>
          
           <!-- Footer -->
           <div class="text-center mt-4 text-[10px]">
               <p>{{ organization?.receipt_footer || '¡Gracias por su compra!' }}</p>
               <p class="mt-2 text-[8px] opacity-70">Softtuuls POS System</p>
           </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'

// Props are processed data ready for print
const props = defineProps<{
    items: any[]
    info: any
}>()

const { organization } = useOrganization()

const formatDate = (d: string) => {
    try {
        return new Date(d).toLocaleString('es-VE')
    } catch { return d }
}

const formatMoney = (amount: number) => {
    if (props.info.currency === 'USD') return `$${(amount||0).toFixed(2)}`
    return `Bs. ${(amount||0).toFixed(2)}`
}

const getTaxIndicator = (item: any) => {
    const taxCondition = item.taxCondition || 'exempt'
    if (taxCondition === 'general') return '(G)'
    if (taxCondition === 'reduced') return '(R)'
    return '(E)'
}
</script>
