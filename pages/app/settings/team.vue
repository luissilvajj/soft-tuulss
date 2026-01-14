<template>
  <div class="max-w-4xl mx-auto py-8">
      <div class="mb-8">
          <NuxtLink to="/app/settings" class="text-sm text-gray-500 hover:text-white mb-2 inline-block">&larr; Volver a Configuración</NuxtLink>
          <h1 class="text-3xl font-bold text-[var(--color-heading)]">Gestión de Equipo</h1>
      </div>
      
      <TeamList />
  </div>
</template>

<script setup>
definePageMeta({
    layout: 'dashboard'
})
</script>
