<template>
  <div class="max-w-[1200px] mx-auto py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-[var(--color-heading)]">Registro de Auditoría</h1>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Historial de acciones de usuarios en el sistema.</p>
      </div>
      <button @click="refresh" class="btn btn-secondary text-sm">
        <span class="mr-2">↻</span> Actualizar
      </button>
      <button @click="forceTest" class="btn btn-secondary text-sm ml-2 text-yellow-500">
        Test Log
      </button>
    </div>

    <!-- Filters could go here -->

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
       <input 
         v-model="search" 
         type="text" 
         placeholder="Buscar por usuario, detalles o ID..." 
         class="flex-1 px-4 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-subtle)] focus:ring-2 focus:ring-[var(--color-accent-blue)] outline-none"
       >
       <select v-model="actionFilter" class="px-4 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-subtle)] outline-none">
          <option value="">Todas las Acciones</option>
          <option value="sale_created">Ventas</option>
          <option value="product">Inventario (Todo)</option>
          <option value="product_created">Crear Producto</option>
          <option value="product_updated">Editar Producto</option>
          <option value="product_restocked">Restock</option>
          <option value="client">Clientes</option>
       </select>
    </div>

    <div class="glass-panel overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-400">
        <span class="inline-block animate-spin mr-2">⟳</span> Cargando registros...
      </div>
      <div v-else-if="logs.length === 0" class="p-8 text-center text-gray-400">
         No hay registros de actividad aun.
      </div>
      <table v-else class="min-w-full divide-y divide-[var(--color-border-subtle)]">
        <thead class="bg-[var(--color-bg-subtle)]">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Acción</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Detalles</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-[var(--color-border-subtle)]">
             <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-[var(--color-bg-subtle)]/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)] font-mono">
                    {{ new Date(log.created_at).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                            {{ log.user?.full_name?.charAt(0) || '?' }}
                        </div>
                        <div class="text-sm font-medium text-[var(--color-text-primary)]">
                            {{ log.user?.full_name || 'Usuario Eliminado' }}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                     <span :class="['px-2 py-1 text-xs font-bold rounded-full border', getActionClass(log.action)]">
                         {{ formatAction(log.action) }}
                     </span>
                </td>
                <td class="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                    <pre class="whitespace-pre-wrap font-mono text-xs bg-[var(--color-bg-dark)]/50 p-2 rounded border border-[var(--color-border-subtle)] max-w-md overflow-x-auto">{{ formatDetails(log.details) }}</pre>
                </td>
             </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'

definePageMeta({
    layout: 'dashboard',
    middleware: 'admin' // Protected
})

const client = useSupabaseClient()
const { organization } = useOrganization()

const logs = ref<any[]>([])
const loading = ref(true)

const fetchLogs = async () => {
    if (!organization.value?.id) return
    loading.value = true
    try {
        const { data, error } = await client
            .from('audit_logs')
            .select(`
                *,
                user:profiles(full_name, avatar_url)
            `)
            .eq('organization_id', organization.value.id)
            .order('created_at', { ascending: false })
            .limit(100) // start with 100

        if (error) throw error
        logs.value = data
    } catch (e) {
        console.error('Error fetching logs', e)
        alert('Error cargando logs')
    } finally {
        loading.value = false
    }
}

const refresh = () => fetchLogs()

const search = ref('')
const actionFilter = ref('')

const filteredLogs = computed(() => {
    return logs.value.filter(log => {
        // Text Search
        const searchLower = search.value.toLowerCase()
        const userMatch = log.user?.full_name?.toLowerCase().includes(searchLower)
        const detailsMatch = JSON.stringify(log.details).toLowerCase().includes(searchLower)
        const matchesSearch = !search.value || userMatch || detailsMatch

        // Action Filter (allow partial matching for groups like 'product')
        const matchesAction = !actionFilter.value || log.action.includes(actionFilter.value)

        return matchesSearch && matchesAction
    })
})

onMounted(() => {
    if (organization.value?.id) fetchLogs()
})

const { logAction } = useAuditLogs()

const forceTest = async () => {
    try {
        await logAction('test_action', { message: 'Manual test from Audit UI' })
        alert('Intento de guardar log realizado. Revisa la consola y recarga.')
        fetchLogs()
    } catch (e) {
        alert('Error: ' + e)
    }
}

watch(() => organization.value?.id, (newId) => {
    if (newId) fetchLogs()
})

const getActionClass = (action: string) => {
    switch (action) {
        case 'sale_created': return 'bg-green-500/10 text-green-500 border-green-500/20'
        case 'product_created': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        case 'product_updated': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        case 'product_deleted': return 'bg-red-500/10 text-red-500 border-red-500/20'
        case 'product_restocked': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
}

const formatAction = (action: string) => {
    const map: Record<string, string> = {
        'sale_created': 'Nueva Venta',
        'product_created': 'Producto Creado',
        'product_updated': 'Producto Editado',
        'product_deleted': 'Producto Eliminado',
        'product_restocked': 'Stock Agregado'
    }
    return map[action] || action
}

const formatDetails = (details: any) => {
    // Simplify for display if needed, but JSON is fine for admin
    return JSON.stringify(details, null, 2)
}

</script>
