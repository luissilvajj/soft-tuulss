<script setup lang="ts">
import { CloudIcon, CloudArrowUpIcon, SignalSlashIcon } from '@heroicons/vue/24/solid';
import { useOnline } from '@vueuse/core';

// Assume SyncStatus store exists as per instructions
// If not real, this interface mocks what we expect
const isOnline = useOnline();

// TODO: Replace with real store usage
// const syncStore = useSyncStatusStore();
// const isSyncing = computed(() => syncStore.isSyncing);
const isSyncing = ref(false); // Mock for now

</script>

<template>
  <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
    :class="[
      !isOnline ? 'bg-gray-100 text-gray-500' : 
      isSyncing ? 'bg-warning-50 text-warning-600' : 
      'bg-success-50 text-success-600'
    ]"
  >
    <!-- Offline State -->
    <template v-if="!isOnline">
      <SignalSlashIcon class="w-4 h-4" />
      <span class="hidden sm:inline">Offline</span>
    </template>

    <!-- Syncing State -->
    <template v-else-if="isSyncing">
      <CloudArrowUpIcon class="w-4 h-4 animate-bounce" />
      <span class="hidden sm:inline">Syncing...</span>
    </template>

    <!-- Online & Synced State -->
    <template v-else>
      <div class="h-2 w-2 rounded-full bg-success-500"></div>
      <span class="hidden sm:inline">Online</span>
    </template>
  </div>
</template>
