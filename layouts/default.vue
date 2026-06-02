<template>
  <div class="min-h-screen font-sans transition-colors duration-300 bg-white dark:bg-[#020617] text-slate-900 dark:text-white">
    <OfflineIndicator />
    <SubscriptionWarning />
    <!-- Navbar (Global for non-landing pages unless overridden) -->
    <header v-if="!$route.path.includes('/app') && $route.path !== '/'" class="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] flex items-center justify-center">
             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
               <path d="M5.75 3.75v16.5" stroke="#ca8a04" stroke-width="3.5" stroke-linecap="round" />
               <path d="M6.5 11.5l8-7" stroke="#eab308" stroke-width="3.5" stroke-linecap="round" />
               <path d="M6.5 12.5l8 7" stroke="#facc15" stroke-width="3.5" stroke-linecap="round" />
             </svg>
           </div>
          <NuxtLink to="/" class="text-xl font-bold text-slate-900 dark:text-white">Kaptiva App</NuxtLink>
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
