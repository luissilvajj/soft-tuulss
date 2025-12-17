<template>
  <div class="min-h-screen bg-black font-sans text-gray-100 flex">
    <!-- Admin Sidebar -->
    <aside class="w-20 lg:w-64 border-r border-red-900/30 flex flex-col fixed h-full z-20 bg-black/50 backdrop-blur-xl">
      <div class="h-16 flex items-center justify-center border-b border-red-900/30">
        <!-- Logo -->
        <span class="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            GOD MODE
        </span>
      </div>

      <nav class="flex-1 py-6 space-y-2 px-3">
        <NuxtLink to="/admin" active-class="bg-red-900/20 text-red-400" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
            <span class="hidden lg:block font-medium">Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/admin/tenants" active-class="bg-red-900/20 text-red-400" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011 1v4a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h2"></path></svg>
            <span class="hidden lg:block font-medium">Organizaciones</span>
        </NuxtLink>
        <NuxtLink to="/admin/users" active-class="bg-red-900/20 text-red-400" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span class="hidden lg:block font-medium">Usuarios</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-red-900/30">
        <NuxtLink to="/app" class="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span class="hidden lg:block">Volver a la App</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-20 lg:ml-64 p-8">
        <slot />
    </main>
  </div>
</template>
