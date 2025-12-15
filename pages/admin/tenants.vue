<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-8">Organizaciones</h1>

    <!-- Loading State -->
    <div v-if="pending" class="text-white">Cargando clientes...</div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 mb-6">
        <p class="font-bold">Error cargando datos: ({{ error.statusCode }})</p>
        <p class="font-mono text-xs mt-2 bg-black/20 p-2 rounded">{{ error.message }}</p>
        <p class="font-mono text-xs mt-2 bg-black/20 p-2 rounded text-yellow-300" v-if="error.data">
            Server Msg: {{ error.data.statusMessage || error.data }}
        </p>
        <p v-if="error.statusCode === 500" class="text-xs mt-2 text-white/50">
            (Si dice "Missing SUPABASE_SERVICE_KEY", verifica Vercel Env Vars)
        </p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-hidden rounded-xl border border-white/10">
      <table class="min-w-full divide-y divide-white/10 text-sm">
        <thead class="bg-white/5">
          <tr>
            <th class="px-6 py-3 text-left font-bold text-gray-400 uppercase">Organización</th>
            <th class="px-6 py-3 text-left font-bold text-gray-400 uppercase">Dueño</th>
            <th class="px-6 py-3 text-left font-bold text-gray-400 uppercase">Plan / Estatus</th>
            <th class="px-6 py-3 text-left font-bold text-gray-400 uppercase">Trial</th>
            <th class="px-6 py-3 text-right font-bold text-gray-400 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10 bg-black/20">
          <tr v-for="org in tenants" :key="org.id" class="hover:bg-white/5 transition-colors">
            <td class="px-6 py-4 font-medium text-white">{{ org.name }}</td>
            <td class="px-6 py-4 text-gray-300">{{ org.owner_email }}</td>
            <td class="px-6 py-4">
                <span :class="[
                   'px-2 py-1 rounded text-xs font-bold uppercase',
                   org.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                ]">
                    {{ org.subscription_status || 'Trial' }}
                </span>
            </td>
            <td class="px-6 py-4 text-gray-300">
                {{ getDaysLeft(org.trial_ends_at) }} días
            </td>
            <td class="px-6 py-4 text-right flex justify-end gap-2">
                <!-- Action Buttons -->
                <button @click="extendTrial(org)" class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs">
                    +14 Días
                </button>
                <button v-if="org.subscription_status !== 'active'" @click="activatePlan(org)" class="px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs">
                    Activar
                </button>
                <button @click="deleteOrg(org)" class="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs">
                    🗑️
                </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: tenants, pending, error, refresh } = await useFetch('/api/admin/tenants')

const getDaysLeft = (dateStr) => {
    if (!dateStr) return 0
    const end = new Date(dateStr)
    const now = new Date()
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diff
}

const extendTrial = async (org) => {
    if (!confirm(`¿Extender trial de ${org.name} por 14 días?`)) return
    
    try {
        await $fetch('/api/admin/manage-tenant', {
            method: 'POST',
            body: { orgId: org.id, action: 'extend_trial' }
        })
        alert('Trial extendido exitosamente')
        refresh() // Refresh list
    } catch (e) {
        alert('Error: ' + e.message)
    }
}

const activatePlan = async (org) => {
    if (!confirm(`¿Activar Plan PRO para ${org.name}? (Sin cobro automático)`)) return

    try {
        await $fetch('/api/admin/manage-tenant', {
            method: 'POST',
            body: { orgId: org.id, action: 'activate_pro' }
        })
        alert('Plan activado exitosamente')
        refresh() // Refresh list
    } catch (e) {
        alert('Error: ' + e.message)
    }
}
</script>
