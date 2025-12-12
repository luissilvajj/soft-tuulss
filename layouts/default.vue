<template>
  <div class="min-h-screen font-sans transition-colors duration-300 bg-white dark:bg-[#020617] text-slate-900 dark:text-white">
    <!-- Navbar (Global for non-landing pages unless overridden) -->
    <header v-if="!$route.path.includes('/app') && $route.path !== '/'" class="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] flex items-center justify-center">
             <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
           </div>
          <NuxtLink to="/" class="text-xl font-bold text-slate-900 dark:text-white">Soft Tuuls</NuxtLink>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/pricing" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Precios</NuxtLink>
          <NuxtLink to="/login" class="text-sm font-bold text-white bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] hover:from-indigo-500 hover:to-purple-600 px-4 py-2 rounded-full transition-all shadow-lg shadow-indigo-500/20">
            Iniciar Sesión
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
