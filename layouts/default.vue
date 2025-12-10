<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900">
    <header class="bg-white border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-indigo-600">Soft Tuuls</NuxtLink>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/pricing" class="text-sm font-medium text-gray-600 hover:text-gray-900">Precios</NuxtLink>
          <NuxtLink to="/login" class="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md">
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
