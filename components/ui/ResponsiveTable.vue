<template>
  <div>
    <!-- Desktop Table View -->
    <div class="hidden md:block overflow-x-auto glass-panel rounded-xl border border-[var(--color-border-subtle)]">
      <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-sm text-left">
        <thead class="bg-[var(--color-bg-subtle)]">
          <tr>
            <th 
                v-for="(header, index) in headers" 
                :key="index"
                class="px-4 py-3 font-bold text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap"
            >
              {{ header.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-border-subtle)] bg-[var(--color-bg-dark)]/50">
            <template v-if="loading">
                <tr v-for="i in 3" :key="i">
                    <td :colspan="headers.length" class="px-4 py-4 animate-pulse">
                        <div class="h-4 bg-gray-700/50 rounded w-3/4"></div>
                    </td>
                </tr>
            </template>
            <tr v-else-if="items.length === 0">
                <td :colspan="headers.length" class="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                    No hay datos disponibles.
                </td>
            </tr>
            <tr 
                v-else
                v-for="(item, i) in items" 
                :key="i" 
                class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors group"
                @click="$emit('row-click', item)"
            >
                <td 
                    v-for="(header, hIndex) in headers" 
                    :key="hIndex" 
                    class="px-4 py-3 text-[var(--color-text-primary)] whitespace-nowrap"
                >
                    <slot :name="`cell-${header.key}`" :item="item" :value="item[header.key]">
                        {{ item[header.key] }}
                    </slot>
                </td>
            </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4">
        <template v-if="loading">
            <div v-for="i in 3" :key="i" class="glass-panel p-4 h-32 animate-pulse"></div>
        </template>
        <div v-else-if="items.length === 0" class="glass-panel p-8 text-center text-sm text-[var(--color-text-secondary)]">
            No hay datos disponibles.
        </div>
        <div 
            v-else
            v-for="(item, i) in items" 
            :key="i"
            class="glass-panel p-4 active:scale-[0.98] transition-transform border border-[var(--color-border-subtle)]"
            @click="$emit('row-click', item)"
        >
            <!-- Mobile Slot: Custom Layout per Row -->
            <slot name="mobile-row" :item="item">
                <!-- Default Fallback Mobile Layout -->
                <div class="space-y-2">
                    <div v-for="(header, hIndex) in headers" :key="hIndex" class="flex justify-between items-center text-sm">
                        <span class="font-bold text-[var(--color-text-secondary)]">{{ header.label }}:</span>
                        <span>{{ item[header.key] }}</span>
                    </div>
                </div>
            </slot>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ResponsiveTable.vue
 * Switches between a standard HTML table on desktop and a stacked card layout on mobile.
 */

defineProps<{
    headers: { label: string; key: string }[];
    items: any[];
    loading?: boolean;
}>()

defineEmits(['row-click'])
</script>
