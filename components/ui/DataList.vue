<script setup lang="ts">
/**
 * DataList Hybrid Component
 * Renders a Table on Desktop and Cards on Mobile
 * 
 * Props:
 * - items: Array of data objects
 * - columns: Array of { key, label, class? }
 * - titleKey: Key to use for the card title (mobile)
 * - subtitleKey: Key to use for the card subtitle/price (mobile)
 * - loading: Boolean state
 */

defineProps<{
  items: any[];
  columns: { key: string; label: string; class?: string }[];
  titleKey?: string;
  subtitleKey?: string;
  loading?: boolean;
}>();

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
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary"
                  :class="col.class"
                >
                  {{ col.label }}
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
