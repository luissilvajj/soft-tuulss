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
                       <p>{{ item.qty }} x {{ item.name }}</p>
                   </div>
                   <div class="text-right">
                       {{ formatMoney(item.qty * item.price) }}
                   </div>
               </div>
          </div>

          <!-- Totals -->
          <div class="border-t border-black border-dashed pt-2">
              <div class="flex justify-between font-bold">
                  <span>TOTAL</span>
                  <span>{{ formatMoney(info.total) }}</span>
              </div>
               <div v-if="info.currency === 'VES'" class="flex justify-between text-[10px] mt-1">
                  <span>Tasa BCV:</span>
                  <span>{{ info.exchangeRate }}</span>
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
    if (props.info.currency === 'USD') return `$${amount.toFixed(2)}`
    return `Bs. ${amount.toFixed(2)}`
}
</script>
