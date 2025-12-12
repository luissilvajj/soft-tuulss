<template>
  <div class="min-h-screen font-sans transition-colors duration-300 bg-[var(--color-bg-dark)] text-[var(--color-white)] overflow-x-hidden selection:bg-[var(--color-accent-blue)] selection:text-white">
    
    <!-- Navbar -->
    <nav class="fixed w-full z-50 transition-all duration-300" :class="{ 'bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--color-border-subtle)]': scrolled, 'bg-transparent': !scrolled }">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center gap-3 group cursor-pointer">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
               <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <span class="text-xl font-bold tracking-tight text-[var(--color-white)]">Soft Tuuls</span>
          </div>
          
          <!-- Links Desktop -->
          <div class="hidden md:flex items-center gap-8">
            <a href="#inicio" class="text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-white)] transition-colors">Inicio</a>
            <a href="#features" class="text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-white)] transition-colors">Funcionalidades</a>
            <a href="#pricing" class="text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-white)] transition-colors">Precios</a>
            <a href="#contact" class="text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-white)] transition-colors">Contacto</a>
            <NuxtLink to="/login" class="text-sm font-bold px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105">
              Iniciar Sesión
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="inicio" class="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
      <!-- Background Glow -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-accent-blue)]/20 rounded-full blur-[120px] -z-10"></div>
      <div class="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--color-accent-violet)]/10 rounded-full blur-[100px] -z-10"></div>

      <div class="max-w-4xl mx-auto px-6 relative z-10">
        <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          Gestión Inteligente para tu 
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-violet)]">Negocio</span>
        </h1>
        
        <p class="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
          Sistema integral de control de inventario, ventas y facturación. 
          Todo lo que necesitas para hacer crecer tu empresa en una sola plataforma.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <NuxtLink to="/signup" class="px-8 py-4 rounded-full bg-[var(--color-white)] text-[var(--color-bg-dark)] font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl shadow-white/10">
            Ver Planes Ahora
          </NuxtLink>
          <a href="#demo" class="px-8 py-4 rounded-full text-[var(--color-white)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)] transition-colors text-lg font-bold">
            Solicitar Demo
          </a>
        </div>

        <!-- Mockup Container -->
        <div class="relative max-w-5xl mx-auto animate-float">
          <!-- Desktop Mockup -->
          <div class="relative rounded-2xl glass-panel border border-[var(--color-border-subtle)] shadow-2xl shadow-indigo-500/10 overflow-hidden aspect-[16/9] flex items-center justify-center bg-[var(--glass-bg)]">
             <div class="absolute inset-0 flex flex-col p-6">
                <!-- Header Mock -->
                <div class="h-8 w-full flex justify-between mb-8">
                   <div class="w-32 h-4 bg-[var(--color-bg-subtle)] rounded-full op-50"></div>
                   <div class="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] op-50"></div>
                </div>
                <!-- Content Mock -->
                <div class="flex gap-6 h-full">
                  <div class="w-1/4 h-full bg-[var(--color-bg-subtle)]/30 rounded-xl border border-[var(--color-border-subtle)]"></div>
                  <div class="w-3/4 h-full flex flex-col gap-4">
                     <div class="w-full h-1/2 bg-[var(--color-bg-subtle)]/50 rounded-xl border border-[var(--color-border-subtle)] p-4 relative overflow-hidden">
                        <span class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Reportes Mensuales</span>
                        <div class="mt-4 flex items-end gap-2 h-3/4 opacity-80">
                           <div class="w-1/6 h-[40%] bg-[var(--color-accent-blue)]/30 rounded-t"></div>
                           <div class="w-1/6 h-[60%] bg-[var(--color-accent-blue)]/60 rounded-t"></div>
                           <div class="w-1/6 h-[30%] bg-[var(--color-border-subtle)] rounded-t"></div>
                           <div class="w-1/6 h-[80%] bg-[var(--color-accent-blue)] rounded-t shadow-[0_0_15px_rgba(0,113,227,0.5)]"></div>
                           <div class="w-1/6 h-[50%] bg-[var(--color-accent-blue)]/40 rounded-t"></div>
                        </div>
                     </div>
                     <div class="w-full h-1/2 bg-[var(--color-bg-subtle)]/30 rounded-xl border border-[var(--color-border-subtle)]"></div>
                  </div>
                </div>
             </div>
          </div>
          
           <!-- Phone Floating Mockup -->
           <div class="absolute -right-8 -bottom-16 w-[280px] h-[550px] rounded-[3rem] border-8 border-[var(--color-bg-dark)] bg-[var(--color-bg-dark)] shadow-2xl overflow-hidden hidden md:block z-20 ring-1 ring-[var(--color-border-subtle)]">
              <div class="w-full h-full bg-[var(--glass-bg)] p-4 flex flex-col items-center">
                 <div class="w-20 h-6 bg-[var(--color-bg-subtle)] rounded-full mb-8"></div>
                 <h3 class="text-3xl font-bold mb-2 text-[var(--color-white)]">$12.4k</h3>
                 <span class="text-xs text-[var(--color-text-secondary)] mb-8">Total Ventas</span>
                 
                 <div class="w-full space-y-4">
                    <div class="w-full h-16 bg-[var(--color-bg-subtle)]/50 rounded-2xl shadow-sm border border-[var(--color-border-subtle)] flex items-center px-4 gap-3">
                       <div class="w-8 h-8 rounded-full bg-[var(--color-accent-green)]"></div>
                       <div class="w-32 h-2 bg-[var(--color-border-subtle)] rounded"></div>
                    </div>
                     <div class="w-full h-16 bg-[var(--color-bg-subtle)]/30 rounded-2xl border border-[var(--color-border-subtle)] flex items-center px-4 gap-3">
                       <div class="w-8 h-8 rounded-full bg-[var(--color-accent-violet)]"></div>
                       <div class="w-24 h-2 bg-[var(--color-border-subtle)] rounded"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 bg-[var(--color-bg-dark)] relative">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent-blue)]/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-sm font-bold tracking-wide text-[var(--color-accent-blue)] uppercase mb-2">Potencia tu empresa</h2>
          <h3 class="text-3xl font-bold text-[var(--color-white)] sm:text-4xl text-gradient">Todo lo que necesitas para operar</h3>
          <p class="mt-4 text-lg text-[var(--color-text-secondary)]">
            Soft Tuuls centraliza tus operaciones en una plataforma rápida, segura y fácil de usar.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group p-8 rounded-3xl glass-panel hover:border-[var(--color-accent-blue)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-[var(--color-accent-blue)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg class="w-6 h-6 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h4 class="text-xl font-bold text-[var(--color-white)] mb-3">Inventario en Tiempo Real</h4>
            <p class="text-[var(--color-text-secondary)] leading-relaxed">
              Control total de tu stock. Bajas automáticas con cada venta y alertas de stock bajo al instante.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="group p-8 rounded-3xl glass-panel hover:border-[var(--color-accent-violet)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-[var(--color-accent-violet)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg class="w-6 h-6 text-[var(--color-accent-violet)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <h4 class="text-xl font-bold text-[var(--color-white)] mb-3">Punto de Venta (POS)</h4>
            <p class="text-[var(--color-text-secondary)] leading-relaxed">
              Registra ventas en segundos desde cualquier dispositivo. Facturación simplificada y cálculo de ganancias.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="group p-8 rounded-3xl glass-panel hover:border-[var(--color-accent-green)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-[var(--color-accent-green)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <svg class="w-6 h-6 text-[var(--color-accent-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <h4 class="text-xl font-bold text-[var(--color-white)] mb-3">Reportes y KPIs</h4>
            <p class="text-[var(--color-text-secondary)] leading-relaxed">
              Toma decisiones basadas en datos. Visualiza tus métricas clave: ventas diarias, productos top y más.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-24 relative overflow-hidden">
      <!-- Background decorators -->
      <div class="absolute left-0 bottom-0 w-[600px] h-[600px] bg-[var(--color-accent-violet)]/5 rounded-full blur-[120px] -z-10"></div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
         <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-sm font-bold tracking-wide text-[var(--color-accent-blue)] uppercase mb-2">Planes Flexibles</h2>
          <h3 class="text-3xl font-bold text-[var(--color-white)] sm:text-4xl">Elige el plan ideal para ti</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
           <!-- Basic Plan -->
           <div class="p-8 rounded-3xl glass-panel border border-[var(--color-border-subtle)]">
              <h4 class="text-lg font-bold text-[var(--color-white)]">Básico</h4>
              <div class="mt-4 flex items-baseline text-[var(--color-white)]">
                 <span class="text-4xl font-extrabold tracking-tight">$0</span>
                 <span class="ml-1 text-xl font-bold opacity-50">/mes</span>
              </div>
              <p class="mt-4 text-sm text-[var(--color-text-secondary)]">Para emprendedores que inician.</p>
              <ul class="mt-6 space-y-4">
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-green)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 1 Usuario</li>
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-green)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Hasta 50 Productos</li>
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-green)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Soporte por Correo</li>
              </ul>
              <NuxtLink to="/signup" class="mt-8 block w-full py-3 px-6 border border-[var(--color-border-subtle)] rounded-xl text-center font-bold text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)] transition-colors">
                Empezar Gratis
              </NuxtLink>
           </div>
           
           <!-- Pro Plan (Destacado) -->
           <div class="relative p-8 rounded-3xl bg-[var(--color-bg-subtle)]/50 border-2 border-[var(--color-accent-blue)] shadow-[0_0_30px_rgba(0,113,227,0.15)] transform md:-translate-y-4 backdrop-blur-xl">
              <div class="absolute top-0 right-0 -mt-4 mr-4 bg-[var(--color-accent-blue)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg shadow-blue-500/30">Más Popular</div>
              <h4 class="text-lg font-bold text-[var(--color-white)]">Pro</h4>
              <div class="mt-4 flex items-baseline text-[var(--color-white)]">
                 <span class="text-5xl font-extrabold tracking-tight">$29</span>
                 <span class="ml-1 text-xl font-bold opacity-50">/mes</span>
              </div>
              <p class="mt-4 text-sm text-[var(--color-text-secondary)]">Para negocios en crecimiento.</p>
              <ul class="mt-6 space-y-4">
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-blue)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Usuarios Ilimitados</li>
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-blue)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Productos Ilimitados</li>
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-blue)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Reportes Avanzados</li>
              </ul>
              <NuxtLink to="/signup" class="mt-8 block w-full py-4 px-6 bg-[var(--color-accent-blue)] rounded-xl text-center font-bold text-white hover:bg-[#0077ED] transition-colors shadow-lg shadow-blue-500/25">
                Prueba Pro 14 días
              </NuxtLink>
           </div>
           
           <!-- Enterprise Plan -->
           <div class="p-8 rounded-3xl glass-panel border border-[var(--color-border-subtle)]">
              <h4 class="text-lg font-bold text-[var(--color-white)]">Empresas</h4>
              <div class="mt-4 flex items-baseline text-[var(--color-white)]">
                 <span class="text-4xl font-extrabold tracking-tight font-sans">Custom</span>
              </div>
              <p class="mt-4 text-sm text-[var(--color-text-secondary)]">Soluciones a medida.</p>
              <ul class="mt-6 space-y-4">
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-green)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> API Dedicada</li>
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-green)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Soporte 24/7</li>
                 <li class="flex items-start text-sm text-[var(--color-text-secondary)]"><svg class="w-5 h-5 text-[var(--color-accent-green)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> SLA Garantizado</li>
              </ul>
               <a href="#contact" class="mt-8 block w-full py-3 px-6 border border-[var(--color-border-subtle)] rounded-xl text-center font-bold text-[var(--color-white)] hover:bg-[var(--color-bg-subtle)] transition-colors">
                Contactar Ventas
              </a>
           </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="py-12 border-t border-[var(--color-border-subtle)] text-center bg-[var(--color-bg-dark)] transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center">
         <div class="flex items-center gap-2 mb-6 opacity-80">
            <div class="w-6 h-6 rounded bg-[var(--color-accent-blue)]"></div>
            <span class="text-lg font-bold text-[var(--color-white)]">Soft Tuuls</span>
         </div>
         <p class="text-[var(--color-text-secondary)] text-sm mb-4">© {{ new Date().getFullYear() }} Soft Tuuls. Todos los derechos reservados.</p>
         <div class="flex gap-6 text-sm text-[var(--color-text-secondary)]">
            <a href="#" class="hover:text-[var(--color-white)] transition-colors">Términos</a>
            <a href="#" class="hover:text-[var(--color-white)] transition-colors">Privacidad</a>
            <a href="#" class="hover:text-[var(--color-white)] transition-colors">Twitter</a>
         </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
/* CSS float animation is defined in tailwind config, but added here effectively */
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}
</style>
