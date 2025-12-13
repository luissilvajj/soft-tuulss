<template>
  <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-4">
    <h3 class="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Agregar Productos</h3>
    
    <!-- Search -->
    <div class="mb-4">
        <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar producto por nombre o SKU..." 
            class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-lg p-3 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none"
        />
        
        <!-- Search Results Dropdown -->
        <div v-if="searchResults.length > 0" class="mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
            <div 
                v-for="product in searchResults" 
                :key="product.id"
                @click="addProduct(product)"
                class="p-3 hover:bg-[var(--color-bg-dark)] cursor-pointer flex justify-between items-center border-b border-[var(--color-border)] last:border-0"
            >
                <div>
                    <p class="text-[var(--color-text-primary)] font-medium">{{ product.name }}</p>
                    <p class="text-xs text-[var(--color-text-secondary)]">Stock: {{ product.stock }} | SKU: {{ product.sku || 'N/A' }}</p>
                </div>
                <span class="text-[var(--color-primary)] font-bold">${{ product.price }}</span>
            </div>
        </div>
        <p v-else-if="searchQuery && searchResults.length === 0" class="mt-2 text-xs text-[var(--color-text-secondary)]">No se encontraron productos.</p>
    </div>

    <!-- Selected Items List -->
    <div v-if="selectedItems.length > 0" class="space-y-3">
        <div v-for="(item, index) in selectedItems" :key="item.product.id" class="flex items-center justify-between bg-[var(--color-bg-dark)]/50 p-2 rounded">
            <div class="flex-1">
                <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ item.product.name }}</p>
                <p class="text-xs text-[var(--color-text-secondary)]">${{ item.product.price }} c/u</p>
            </div>
            
            <div class="flex items-center space-x-3">
                <input 
                    type="number" 
                    v-model.number="item.quantity" 
                    min="1" 
                    :max="item.product.stock"
                    class="w-16 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded p-1 text-center text-[var(--color-text-primary)] text-sm"
                />
                <span class="text-sm font-bold text-[var(--color-text-primary)] w-20 text-right">
                    ${{ (item.quantity * item.product.price).toFixed(2) }}
                </span>
                <button @click="removeItem(index)" class="text-red-500 hover:text-red-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
        
        <!-- Total -->
        <div class="flex justify-between items-center pt-4 border-t border-[var(--color-border)] mt-4">
            <span class="text-[var(--color-text-secondary)]">Total</span>
            <span class="text-xl font-bold text-[var(--color-primary)]">${{ total.toFixed(2) }}</span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseClient } from '#imports'
import { useOrganization } from '~/composables/useOrganization'
import type { Product } from '~/types/models'

const props = defineProps<{
    modelValue: { product: Product, quantity: number }[]
}>()

const emit = defineEmits(['update:modelValue'])

const client = useSupabaseClient()
const { organization } = useOrganization()

const searchQuery = ref('')
const allProducts = ref<Product[]>([])
const selectedItems = ref<{ product: Product, quantity: number }[]>(props.modelValue || [])

// Load all products initially (for small catalogs this is fine)
const fetchProducts = async () => {
    if (!organization.value?.id) return
    const { data } = await client
        .from('products')
        .select('*')
        .eq('organization_id', organization.value.id)
    
    if (data) allProducts.value = data as any
}

const searchResults = computed(() => {
    if (!searchQuery.value) return []
    const q = searchQuery.value.toLowerCase()
    return allProducts.value.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q)
    ).slice(0, 5) // Limit to 5 results
})

const addProduct = (product: Product) => {
    if (product.stock <= 0) {
        alert('Este producto no tiene stock disponible.')
        return
    }

    const existing = selectedItems.value.find(i => i.product.id === product.id)
    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity++
        }
    } else {
        selectedItems.value.push({ product, quantity: 1 })
    }
    searchQuery.value = '' // Clear search
}

const removeItem = (index: number) => {
    selectedItems.value.splice(index, 1)
}

const total = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + (item.quantity * item.product.price), 0)
})

watch(selectedItems, (newVal) => {
    emit('update:modelValue', newVal)
}, { deep: true })

onMounted(fetchProducts)
</script>
