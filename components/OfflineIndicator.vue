<template>
  <div v-if="salesStore.isOfflineMode || salesStore.pendingCount > 0" class="bg-yellow-500 text-white px-4 py-2 text-sm font-medium flex justify-between items-center shadow-md">
    <div class="flex items-center gap-2">
      <span v-if="!isOnline" class="animate-pulse">🔴 Sin Conexión</span>
      <span v-else>🟡 Recuperando conexión...</span>
      
      <span v-if="salesStore.pendingCount > 0" class="bg-black/20 px-2 py-0.5 rounded text-xs ml-2">
         {{ salesStore.pendingCount }} ventas pendientes
      </span>
    </div>

    <button 
      @click="salesStore.syncOfflineSales()" 
      class="bg-white/20 hover:bg-white/30 text-xs px-3 py-1 rounded transition-colors"
      :disabled="!isOnline"
    >
      Sincronizar Ahora
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSalesStore } from '~/stores/sales'
import { useOnline } from '@vueuse/core'

const salesStore = useSalesStore()
const isOnline = useOnline()

// Sync on mount if we have pending items
onMounted(() => {
    salesStore.checkPendingSales()
})

// Auto-sync when coming online
watch(isOnline, (online) => {
    if (online) {
        salesStore.syncOfflineSales()
    } else {
        salesStore.isOfflineMode = true
    }
})
</script>
