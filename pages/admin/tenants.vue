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

    <!-- Mobile Card View -->
    <div class="block md:hidden space-y-4">
        <div v-for="org in tenants" :key="org.id" class="glass-panel p-4 flex flex-col gap-3 relative">
            <div class="flex justify-between items-start">
                <div>
                   <h3 class="font-bold text-white">{{ org.name }}</h3>
                   <p class="text-xs text-gray-400">{{ org.owner_email }}</p>
                </div>
                <div class="flex flex-col items-end">
                    <span :class="[
                       'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                       org.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    ]">
                        {{ org.subscription_status || 'Trial' }}
                    </span>
                    <span class="text-[10px] text-gray-500 mt-1" v-if="org.subscription_plan">{{ org.subscription_plan.toUpperCase() }}</span>
                </div>
            </div>
            
            <div class="flex items-center gap-2 text-xs text-gray-300">
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Restan {{ getDaysLeft(org.trial_ends_at) }} días de prueba
            </div>

            <div class="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                <button @click="extendTrial(org)" class="px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20">
                    + Trial
                </button>
                <div class="relative group w-full">
                    <button class="w-full px-3 py-2 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/20 flex justify-center items-center gap-1">
                        Plan ▼
                    </button>
                    <!-- Mobile Dropdown -->
                    <div class="absolute left-0 bottom-full mb-1 hidden group-hover:block w-full bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50">
                        <button @click="setPlan(org, 'basic')" class="block w-full text-center px-4 py-2 text-xs hover:bg-white/10 text-white border-b border-white/5">Básico</button>
                        <button @click="setPlan(org, 'pro')" class="block w-full text-center px-4 py-2 text-xs hover:bg-white/10 text-white border-b border-white/5">Pro</button>
                        <button @click="setPlan(org, 'enterprise')" class="block w-full text-center px-4 py-2 text-xs hover:bg-white/10 text-white">Enterprise</button>
                    </div>
                </div>
                <button @click="deleteOrg(org)" class="col-span-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 flex justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Eliminar Organización
                </button>
            </div>
        </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block overflow-hidden rounded-xl border border-white/10">
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
                <span class="text-xs text-gray-400 block" v-if="org.subscription_plan">
                   {{ org.subscription_plan.toUpperCase() }}
                </span>
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
                    + Trial
                </button>
                
                <div class="relative group">
                    <button class="px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs flex items-center gap-1">
                        Plan <span class="text-[10px]">▼</span>
                    </button>
                    <!-- Dropdown -->
                    <div class="absolute right-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 border border-white/10 rounded shadow-xl z-50 min-w-[120px]">
                        <button @click="setPlan(org, 'basic')" class="block w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white">Básico</button>
                        <button @click="setPlan(org, 'pro')" class="block w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white">Pro</button>
                        <button @click="setPlan(org, 'enterprise')" class="block w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white">Enterprise</button>
                    </div>
                </div>

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
  middleware: 'admin' // Protected
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
    const days = prompt(`¿Cuántos días de trial deseas agregar a ${org.name}?`, '14')
    if (!days) return
    
    try {
        await $fetch('/api/admin/manage-tenant', {
            method: 'POST',
            body: { orgId: org.id, action: 'extend_trial', days }
        })
        alert('Trial extendido exitosamente')
        refresh() // Refresh list
    } catch (e) {
        alert('Error: ' + e.message)
    }
}

const setPlan = async (org, plan) => {
    if (!confirm(`¿Asignar Plan ${plan.toUpperCase()} a ${org.name}?`)) return

    try {
        await $fetch('/api/admin/manage-tenant', {
            method: 'POST',
            body: { orgId: org.id, action: 'set_plan', plan }
        })
        alert(`Plan ${plan} activado`)
        refresh() // Refresh list
    } catch (e) {
        alert('Error: ' + e.message)
    }
}

const deleteOrg = async (org) => {
    if (!confirm(`⚠️ ELIMINAR "${org.name}"?\n\nEsto borrará:\n- La organización\n- Todos sus productos\n- Todas sus ventas\n- Todos los miembros\n\n¿Estás SEGURO?`)) return
    
    try {
        await $fetch('/api/admin/manage-tenant', {
            method: 'POST',
            body: { orgId: org.id, action: 'delete_org' }
        })
        alert('Organización eliminada')
        refresh()
    } catch (e) {
        alert('Error: ' + e.message)
    }
}
</script>
