<script setup lang="ts">
/**
 * DataList Hybrid Component
 * Renders a Table on Desktop and Cards on Mobile
 * 
 * Props:
 * - items: Array of data objects
 * - columns: Array of { key, label, class?, sortable? }
 * - titleKey: Key to use for the card title (mobile)
 * - subtitleKey: Key to use for the card subtitle/price (mobile)
 * - loading: Boolean state
 * - limit: Number of items per page
 * - total: Total items available (optional)
 */

const props = defineProps<{
  items: any[];
  columns: { key: string; label: string; class?: string; sortable?: boolean }[];
  titleKey?: string;
  subtitleKey?: string;
  loading?: boolean;
  limit?: number;
  total?: number;
}>();

import { ref } from 'vue'

const emit = defineEmits(['update:limit', 'sort'])

const sortCol = ref('')
const sortAsc = ref(true)

const handleSort = (key: string, isSortable?: boolean) => {
    if (!isSortable) return
    if (sortCol.value === key) {
        sortAsc.value = !sortAsc.value
    } else {
        sortCol.value = key
        sortAsc.value = true
    }
    emit('sort', { key: sortCol.value, asc: sortAsc.value })
}

// Using standard slots and destructuring instead of deep resolution on every cell render.
// Emitting utility functions only when strictly needed for simple paths.
const resolve = (item: any, key: string) => {
  if (!item) return null;
  if (!key.includes('.')) return item[key];
  return key.split('.').reduce((o, i) => (o ? o[i] : null), item);
};
</script>

<template>
  <div>
    <!-- Table Controls Header -->
    <div v-if="limit !== undefined" class="flex justify-between items-center mb-4">
        <div class="text-sm text-text-secondary">
            <span v-if="total !== undefined">Mostrando <b>{{ items?.length || 0 }}</b> de <b>{{ total }}</b> resultados</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-text-secondary">
            <span>Mostrar:</span>
            <select 
                :value="limit" 
                @input="$emit('update:limit', Number(($event.target as HTMLSelectElement).value))"
                class="bg-surface-subtle border border-surface-border text-text-heading rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary-500"
            >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
                <option :value="500">500</option>
                <option :value="1000">1000</option>
            </select>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600"></div>
    </div>

    <div v-else>
      <!-- Usage Check -->
      <div v-if="!items || items.length === 0" class="rounded-xl border border-dashed border-surface-border bg-surface-subtle p-8 text-center text-text-secondary">
        No hay datos para mostrar
      </div>

      <div v-else>
        <!-- Desktop Table (Hidden on Mobile) -->
        <div class="hidden overflow-hidden rounded-xl border border-surface-border bg-surface-ground shadow-sm lg:block">
          <table class="min-w-full divide-y divide-surface-border">
            <thead class="bg-surface-subtle">
              <tr>
                <th 
                  v-for="col in columns" 
                  :key="col.key"
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary select-none"
                  :class="[col.class, col.sortable ? 'cursor-pointer hover:bg-surface-section transition-colors group' : '']"
                  @click="handleSort(col.key, col.sortable)"
                >
                  <div class="flex items-center gap-1">
                      {{ col.label }}
                      <span v-if="col.sortable" class="text-text-secondary/50 group-hover:text-text-secondary transition-colors" :class="{'text-primary-600': sortCol === col.key}">
                          <svg v-if="sortCol !== col.key || !sortAsc" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                          <svg v-if="sortCol === col.key && sortAsc" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                      </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border bg-surface-ground">
              <tr 
                v-for="(item, index) in items" 
                :key="index"
                class="transition-colors hover:bg-surface-subtle"
              >
                <td 
                  v-for="col in columns" 
                  :key="col.key"
                  class="whitespace-nowrap px-6 py-4 text-sm text-text-heading"
                >
                  <!-- Slot for specific column key -->
                  <slot :name="`col-${col.key}`" :item="item" :value="resolve(item, col.key)">
                    {{ resolve(item, col.key) }}
                  </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards (Hidden on Desktop) -->
        <div class="grid grid-cols-1 gap-4 lg:hidden">
          <div 
            v-for="(item, index) in items" 
            :key="index" 
            class="relative flex flex-col justify-between rounded-xl bg-surface-ground p-4 shadow-sm border border-surface-border"
          >
            <!-- Card Header: Title & Subtitle/Price -->
            <div class="mb-2">
              <div class="flex justify-between items-start">
                  <h3 class="text-base font-semibold leading-tight text-text-heading line-clamp-2">
                    <slot name="card-title" :item="item">
                        {{ titleKey ? resolve(item, titleKey) : 'Item #' + (index + 1) }}
                    </slot>
                  </h3>
                  <!-- Optional Status/Badge Slot -->
                  <slot name="card-badge" :item="item"></slot>
              </div>
              
              <p v-if="subtitleKey" class="mt-1 text-lg font-bold text-primary-600">
                 <slot name="card-subtitle" :item="item">
                    {{ resolve(item, subtitleKey) }}
                 </slot>
              </p>
            </div>

            <!-- Card Body: Generic Fields -->
            <div class="mt-2 space-y-1 text-sm text-text-secondary">
                 <div class="group flex items-center justify-between border-t border-surface-border pt-2">
                     <slot name="mobile-actions" :item="item"></slot>
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
