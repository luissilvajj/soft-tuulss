<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-8">Usuarios del Sistema</h1>

    <!-- Loading State -->
    <div v-if="pending" class="text-white">Cargando usuarios...</div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 mb-6">
        <p class="font-bold">Error cargando usuarios: ({{ error.statusCode }})</p>
        <p class="font-mono text-xs mt-2 bg-black/20 p-2 rounded">{{ error.message }}</p>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block overflow-hidden rounded-xl border border-white/10">
      <table class="min-w-full divide-y divide-white/10 text-sm">
        <thead class="bg-white/5">
          <tr>
            <th class="px-6 py-3 text-left font-bold text-gray-400 uppercase">Usuario</th>
            <th class="px-6 py-3 text-left font-bold text-gray-400 uppercase">Organizaciones</th>
            <th class="px-6 py-3 text-left font-bold text-gray-400 uppercase">Registro</th>
            <th class="px-6 py-3 text-right font-bold text-gray-400 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10 bg-black/20">
          <tr v-for="user in users" :key="user.id" class="hover:bg-white/5 transition-colors">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                        {{ user.full_name?.[0]?.toUpperCase() || '?' }}
                    </div>
                    <div>
                        <div class="font-medium text-white">{{ user.full_name }}</div>
                        <div class="text-xs text-gray-400">{{ user.email }}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div v-if="user.organizations && user.organizations.length > 0" class="space-y-1">
                    <div v-for="(org, idx) in user.organizations" :key="idx" 
                         class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mr-2">
                        {{ org.name }} <span class="ml-1 opacity-50">({{ org.role }})</span>
                    </div>
                </div>
                <span v-else class="text-xs text-yellow-500/70 bg-yellow-500/10 px-2 py-1 rounded">
                    Sin Organización
                </span>
            </td>
            <td class="px-6 py-4 text-gray-300">
                <div class="text-xs">
                    {{ new Date(user.created_at).toLocaleDateString() }}
                </div>
                <div class="text-[10px] text-gray-500">
                    Último acceso: {{ user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Nunca' }}
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <button @click="resetPassword(user)" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs transition-colors border border-white/5">
                    Reset Password
                </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile View -->
    <div class="md:hidden space-y-4">
        <div v-for="user in users" :key="user.id" class="glass-panel p-4 flex flex-col gap-3">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
                    {{ user.full_name?.[0] || '?' }}
                </div>
                <div>
                    <h3 class="text-white font-bold">{{ user.full_name }}</h3>
                    <p class="text-xs text-gray-400">{{ user.email }}</p>
                </div>
            </div>
            
            <div class="pt-3 border-t border-white/10">
                <p class="text-xs font-bold text-gray-500 mb-2 uppercase">Organizaciones</p>
                <div v-if="user.organizations?.length">
                    <span v-for="(org, i) in user.organizations" :key="i" class="block text-sm text-blue-300 mb-1">
                        • {{ org.name }} ({{ org.role }})
                    </span>
                </div>
                <p v-else class="text-sm text-yellow-500">⚠ Sin Organización</p>
            </div>

            <button @click="resetPassword(user)" class="w-full mt-2 py-2 bg-white/5 rounded-lg text-xs text-gray-400">
                Enviar Email de Reset de Password
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: users, pending, error } = await useFetch('/api/admin/users')

const resetPassword = async (user) => {
    if(!confirm(`¿Enviar email de restablecimiento de contraseña a ${user.email}?`)) return
    
    // Logic to be implemented or simply use Supabase client if available with service key on server
    alert('Funcionalidad de Reset Password simulada por ahora. Se agregará endpoint.')
}
</script>
