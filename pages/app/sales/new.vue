<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center mb-6">
        <NuxtLink to="/app/sales" class="mr-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-[var(--color-heading)]">Nueva Venta</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="md:col-span-2 space-y-6">
            <!-- 1. Client -->
            <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
                <ClientSelector v-model="form.clientId" @create-client="showClientModal = true" />
            </div>

            <!-- 2. Products -->
            <SaleProductSelector v-model="form.items" />
        </div>

        <!-- Sidebar / Summary -->
        <div class="md:col-span-1">
            <div class="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 sticky top-6">
                <h3 class="text-lg font-bold text-[var(--color-heading)] mb-4">Resumen</h3>
                
                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Fecha</label>
                        <input type="date" v-model="form.date" class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded p-2 text-sm" />
                    </div>
                    
                    <div>
                        <label class="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Estado de Pago</label>
                        <select v-model="form.status" class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded p-2 text-sm">
                            <option value="paid">Pagado</option>
                            <option value="pending">Pendiente de Pago</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Método de Pago</label>
                        <select v-model="form.paymentMethod" class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded p-2 text-sm">
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="transfer">Transferencia</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                </div>

                <div class="border-t border-[var(--color-border)] pt-4 mb-6">
                    <div class="flex justify-between items-center mb-2">
                         <span class="text-[var(--color-text-secondary)]">Subtotal</span>
                         <span class="text-[var(--color-text-primary)]">${{ total.toFixed(2) }}</span>
                    </div>
                     <div class="flex justify-between items-center text-xl font-bold text-[var(--color-primary)]">
                         <span>Total</span>
                         <span>${{ total.toFixed(2) }}</span>
                    </div>
                </div>

                <button 
                    @click="handleSubmit" 
                    :disabled="loading || form.items.length === 0"
                    class="w-full btn btn-primary flex justify-center items-center py-3 text-lg"
                >
                    <span v-if="loading" class="animate-spin mr-2">⟳</span>
                    {{ loading ? 'Registrando...' : 'Registrar Venta' }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSales } from '~/composables/useSales'
import type { Product } from '~/types/models'

definePageMeta({
  layout: 'dashboard'
})

const { createSale, loading } = useSales()
const router = useRouter()

const form = reactive({
    clientId: '',
    status: 'paid' as 'paid' | 'pending',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    items: [] as { product: Product, quantity: number }[]
})

const showClientModal = ref(false)

const total = computed(() => {
    return form.items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0)
})

const handleSubmit = async () => {
    if (form.items.length === 0) return

    try {
        await createSale({
            clientId: form.clientId || undefined,
            status: form.status,
            paymentMethod: form.paymentMethod,
            date: form.date
        }, form.items.map(i => ({ 
            productId: i.product.id, 
            quantity: i.quantity, 
            price: i.product.price 
        })))

        alert('¡Venta registrada exitosamente!')
        router.push('/app/sales')
    } catch (e: any) {
        alert('Error al registrar venta: ' + e.message)
    }
}
</script>
