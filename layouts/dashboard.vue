<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64">
        <div class="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
          <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div class="flex items-center flex-shrink-0 px-4 mb-5">
              <span class="text-xl font-bold text-indigo-600">Soft Tuuls</span>
            </div>
            <nav class="mt-5 flex-1 px-2 bg-white space-y-1">
              <NuxtLink to="/app" class="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900" active-class="bg-gray-100 text-gray-900">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/app/inventory" class="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900" active-class="bg-gray-100 text-gray-900">
                Inventario
              </NuxtLink>
              <NuxtLink to="/app/sales" class="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900" active-class="bg-gray-100 text-gray-900">
                Movimientos
              </NuxtLink>
            </nav>
          </div>
          <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div class="flex items-center">
              <div>
                <p class="text-sm font-medium text-gray-700">{{ organization?.name }}</p>
                <p class="text-xs text-gray-500 cursor-pointer hover:text-red-500" @click="logout">Cerrar Sesión</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const { organization, fetchOrganization } = useOrganization()
const client = useSupabaseClient()
const router = useRouter()

// Ensure org is loaded
onMounted(() => {
  fetchOrganization()
})

const logout = async () => {
  await client.auth.signOut()
  router.push('/login')
}
</script>
