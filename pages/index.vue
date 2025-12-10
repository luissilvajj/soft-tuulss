<template>
  <div class="bg-black min-h-screen font-sans text-white overflow-x-hidden selection:bg-yellow-500 selection:text-black">
    <!-- Navbar -->
    <nav class="fixed w-full z-50 transition-all duration-300" :class="{ 'bg-black/80 backdrop-blur-md': scrolled, 'bg-transparent': !scrolled }">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <div class="flex items-center gap-2 group cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-yellow-400 group-hover:scale-110 transition-transform duration-500"></div>
            <span class="text-xl font-bold tracking-tight">Soft Tuuls</span>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">Características</a>
            <a href="#pricing" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">Precios</a>
            <NuxtLink to="/login" class="text-sm font-medium px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all hover:scale-105 backdrop-blur-sm">
              Iniciar Sesión
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <!-- Background Glows -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      <div class="absolute bottom-0 right-0 w-[800px] h-[600px] bg-yellow-900/10 rounded-full blur-[100px] -z-10"></div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up" style="animation-delay: 0.1s">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span class="text-sm font-medium text-gray-300">Nuevo: Gestión Multi-empresa</span>
        </div>
        
        <h1 class="text-5xl lg:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 animate-fade-in-up" style="animation-delay: 0.2s">
          Gestión empresarial <br />
          <span class="text-white">reinventada.</span>
        </h1>
        
        <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style="animation-delay: 0.3s">
          Olvídate de las hojas de cálculo. Soft Tuuls es la plataforma inteligente que unifica tu inventario, ventas y equipo en una interfaz diseñada para el futuro.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up" style="animation-delay: 0.4s">
          <NuxtLink to="/signup" class="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95">
            <span class="relative z-10">Empezar Gratis</span>
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </NuxtLink>
          <a href="#demo" class="px-8 py-4 rounded-full text-white border border-white/20 hover:bg-white/5 transition-colors text-lg font-medium">
            Ver Demo
          </a>
        </div>

        <!-- Mockup Container -->
        <div class="relative max-w-5xl mx-auto animate-fade-in-up" style="animation-delay: 0.6s">
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-yellow-500 rounded-2xl blur opacity-20"></div>
          <div class="relative bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
             <div class="flex items-center gap-2 px-4 h-10 bg-gray-900/50 border-b border-white/5">
                <div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
             </div>
             <!-- Mockup generated artifacts will be placed here manually or via component -->
             <img src="/saas_dashboard_mockup_desktop.webp" alt="Dashboard Interface" class="w-full h-auto opacity-90" />
          </div>
          
           <!-- Phone Floating Mockup -->
           <div class="absolute -right-12 -bottom-20 w-64 md:w-80 rounded-[3rem] border-8 border-gray-900 bg-gray-900 shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 overflow-hidden hidden md:block z-20">
              <img src="/crm_dashboard_mockup_mobile.webp" alt="Mobile App" class="w-full h-auto" />
           </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="py-32 bg-black relative">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-500">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 class="text-xl font-bold mb-4">Velocidad Extrema</h3>
            <p class="text-gray-400 leading-relaxed">Arquitectura optimizada para cargar en milisegundos. Tu negocio no puede esperar.</p>
          </div>
           <div class="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-500">
            <div class="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 class="text-xl font-bold mb-4">Seguridad Militar</h3>
            <p class="text-gray-400 leading-relaxed">Tus datos están aislados y encriptados. Row Level Security activo por defecto.</p>
          </div>
           <div class="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-500">
            <div class="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <h3 class="text-xl font-bold mb-4">Escalabilidad Real</h3>
            <p class="text-gray-400 leading-relaxed">Crece de 10 a 10,000 usuarios sin cambiar una línea de código.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-white/10 text-center text-gray-500 text-sm">
      <p>&copy; {{ new Date().getFullYear() }} Soft Tuuls. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false // Custom layout approach for landing
})

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  opacity: 0; /* Init hidden */
  animation: fade-in-up 0.8s ease-out forwards;
}

.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.1;
  }
}
</style>
