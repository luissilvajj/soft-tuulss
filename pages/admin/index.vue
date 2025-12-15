<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-8">Panel de Control</h1>

    <!-- Loading State -->
    <div v-if="pending" class="text-white">Cargando métricas...</div>

    <!-- Metrics -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <!-- Metric Card 1 -->
        <div class="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 class="text-gray-400 text-sm font-medium uppercase">Total Organizaciones</h3>
            <div class="mt-4 flex items-baseline gap-2">
                <span class="text-4xl font-bold text-white">{{ metrics?.totalOrgs || 0 }}</span>
            </div>
        </div>

        <!-- Metric Card 2 -->
        <div class="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 class="text-gray-400 text-sm font-medium uppercase">Usuarios Activos</h3>
            <div class="mt-4 flex items-baseline gap-2">
                <span class="text-4xl font-bold text-white">{{ metrics?.activeUsers || 0 }}</span>
            </div>
        </div>

        <!-- Metric Card 3 -->
        <div class="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 class="text-gray-400 text-sm font-medium uppercase">Ingresos (MRR)</h3>
            <div class="mt-4 flex items-baseline gap-2">
                <span class="text-4xl font-bold text-white">${{ metrics?.mrr || 0 }}</span>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
            <h3 class="text-red-400 font-bold mb-2">Sistema</h3>
            <p class="text-sm text-gray-400 mb-4">Estado de los servicios y base de datos.</p>
            <div class="flex items-center gap-2 text-green-400 text-sm">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Sistema Operativo
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: metrics, pending } = await useFetch('/api/admin/metrics')
</script>
