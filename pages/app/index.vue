<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Resumen del Negocio</h1>
    
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Card 1 -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Ventas de Hoy</dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">${{ todaySales }}</dd>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Productos en Stock Bajo</dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ lowStockCount }}</dd>
        </div>
      </div>

       <!-- Card 3 -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Total Clientes</dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ clientCount }}</dd>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h2>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200" v-if="recentTransactions.length > 0">
           <li v-for="trx in recentTransactions" :key="trx.id">
            <div class="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div class="flex items-center">
                <span :class="[trx.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase mr-3']">
                  {{ trx.type === 'sale' ? 'Venta' : 'Gasto' }}
                </span>
                <p class="text-sm font-medium text-gray-900">{{ new Date(trx.date).toLocaleDateString() }}</p>
              </div>
              <div class="flex items-center">
                 <span class="text-sm font-bold text-gray-900">${{ trx.amount }}</span>
              </div>
            </div>
          </li>
        </ul>
        <div v-else class="p-4 text-center text-gray-500">
          No hay actividad reciente.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const supabase = useSupabaseClient()

const todaySales = ref(0)
const lowStockCount = ref(0)
const clientCount = ref(0)
const recentTransactions = ref([])

onMounted(async () => {
    // 1. Get Today Sales
    const today = new Date().toISOString().split('T')[0]
    const { data: sales } = await supabase.from('transactions')
        .select('amount')
        .eq('type', 'sale')
        .gte('date', today)
    
    todaySales.value = sales?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

    // 2. Low Stock
    const { count: stockCount } = await supabase.from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 10)
    lowStockCount.value = stockCount || 0

    // 3. Client Count
    const { count: clCount } = await supabase.from('clients')
        .select('*', { count: 'exact', head: true })
    clientCount.value = clCount || 0

    // 4. Recent Trx
    const { data: recent } = await supabase.from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(5)
    recentTransactions.value = recent || []
})
</script>
