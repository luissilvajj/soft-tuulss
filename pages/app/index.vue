<template>
  <div class="relative">
    <!-- Welcome Header -->
    <div class="mb-10 relative z-10">
      <h1 class="text-4xl font-extrabold text-gradient tracking-tight">
        Hola, <span class="text-[var(--color-accent-blue)] relative inline-block">
            {{ organization?.name || 'Empresario' }}
            <svg class="absolute -bottom-2 left-0 w-full h-2 text-[var(--color-accent-blue)]/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" stroke-width="4" fill="none"/></svg>
        </span>
      </h1>
      <p class="mt-2 text-[var(--color-text-secondary)] font-medium">Aquí tienes el resumen de tu negocio para hoy.</p>
    </div>

    <!-- Quick Actions (Mobile/Tablet visible) -->
    <div class="flex gap-4 mb-8 overflow-x-auto pb-2 md:hidden">
       <NuxtLink to="/app/sales" class="flex-shrink-0 bg-[var(--color-accent-blue)] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nueva Venta
       </NuxtLink>
       <NuxtLink to="/app/inventory" class="flex-shrink-0 bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] px-6 py-3 rounded-xl font-bold border border-[var(--color-border-subtle)] flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          Inventario
       </NuxtLink>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
      <!-- Card: Today Sales -->
      <div class="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <svg class="w-24 h-24 text-[var(--color-accent-green)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.69 1.64 1.83 1.64.95 0 1.63-.61 1.63-1.48 0-1.33-2.15-1.7-3.41-2.19-1.42-.55-2.67-1.43-2.67-3.2 0-1.76 1.34-2.83 2.93-3.17V4h2.67v1.9c1.67.36 2.92 1.48 3.1 3.23h-1.92c-.12-.89-.72-1.45-1.7-1.45-.88 0-1.48.56-1.48 1.4 0 1.25 2.15 1.63 3.39 2.14 1.44.61 2.7 1.46 2.7 3.31.03 1.88-1.37 2.98-3.09 3.36z"/></svg>
        </div>
        <div class="relative z-10">
          <p class="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Ventas de Hoy</p>
          <div class="flex items-baseline mt-2">
            <span class="text-4xl font-black text-[var(--color-white)] tracking-tight">${{ todaySales.toLocaleString() }}</span>
          </div>
          <div class="mt-4 flex items-center text-sm font-medium text-emerald-500">
             <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
             <span>Actualizado ahora</span>
          </div>
        </div>
      </div>

      <!-- Card: Low Stock -->
      <div class="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
         <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <svg class="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm2 4h12v2H6zm2 4h8v2H8z"/></svg>
        </div>
        <div class="relative z-10">
          <p class="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Stock Bajo</p>
          <div class="flex items-baseline mt-2">
            <span class="text-4xl font-black text-[var(--color-white)] tracking-tight">{{ lowStockCount }}</span>
            <span class="ml-2 text-lg text-[var(--color-text-secondary)] font-medium">productos</span>
          </div>
           <div class="mt-4 flex items-center text-sm font-medium text-red-500" v-if="lowStockCount > 0">
             <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             <span>Requiere atención</span>
          </div>
          <div class="mt-4 text-sm font-medium text-emerald-500" v-else>
             <span>Todo en orden</span>
          </div>
        </div>
      </div>

       <!-- Card: Clients -->
      <div class="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
         <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <svg class="w-24 h-24 text-[var(--color-accent-blue)]" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>
        <div class="relative z-10">
          <p class="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Clientes</p>
          <div class="flex items-baseline mt-2">
            <span class="text-4xl font-black text-[var(--color-white)] tracking-tight">{{ clientCount }}</span>
          </div>
          <div class="mt-4 flex items-center text-sm font-medium text-[var(--color-text-secondary)]">
             <span>Base de datos activa</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <!-- Main Activity Table -->
       <div class="lg:col-span-2 glass-panel overflow-hidden">
          <div class="px-6 py-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-bg-dark)]/50">
             <h3 class="text-lg font-bold text-[var(--color-white)]">Actividad Reciente</h3>
             <NuxtLink to="/app/sales" class="text-sm font-bold text-[var(--color-accent-blue)] hover:text-white transition-colors">Ver todo</NuxtLink>
          </div>
          
          <div v-if="loading" class="p-8 text-center text-[var(--color-text-secondary)]">
             Cargando datos...
          </div>
          
          <ul role="list" class="divide-y divide-[var(--color-border-subtle)]" v-else-if="recentTransactions.length > 0">
            <li v-for="trx in recentTransactions" :key="trx.id" class="px-6 py-4 hover:bg-[var(--color-bg-subtle)]/50 transition-colors flex items-center justify-between group">
               <div class="flex items-center gap-4">
                  <div :class="[
                     trx.type === 'sale' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600',
                     'w-10 h-10 rounded-full flex items-center justify-center'
                  ]">
                     <svg v-if="trx.type === 'sale'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                     <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                  </div>
                  <div>
                     <p class="text-sm font-bold text-[var(--color-white)] group-hover:text-[var(--color-accent-blue)] transition-colors">{{ trx.type === 'sale' ? 'Nueva Venta' : 'Gasto Registrado' }}</p>
                     <p class="text-xs text-[var(--color-text-secondary)]">{{ new Date(trx.date).toLocaleDateString() }}</p>
                  </div>
               </div>
               <span :class="[
                  trx.type === 'sale' ? 'text-emerald-600' : 'text-[var(--color-white)]',
                  'font-bold'
               ]">
                  {{ trx.type === 'sale' ? '+' : '-' }} ${{ trx.amount }}
               </span>
            </li>
          </ul>
           <div v-else class="p-8 text-center">
              <div class="w-16 h-16 bg-[var(--color-bg-dark)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border-subtle)]">
                 <svg class="w-8 h-8 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-[var(--color-text-secondary)] font-medium">No hay actividad reciente.</p>
           </div>
       </div>

       <!-- Quick Actions Panel (Desktop) -->
       <div class="hidden lg:flex flex-col gap-4">
          <div class="rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden" style="background: var(--gradient-logo);">
             <!-- Decorators -->
             <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             
             <h3 class="text-xl font-bold mb-2 relative z-10">Acciones Rápidas</h3>
             <p class="text-white/80 text-sm mb-6 relative z-10">Gestiona tu negocio de forma eficiente.</p>
             
             <div class="space-y-3 relative z-10">
                <NuxtLink to="/app/sales" class="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-colors group cursor-pointer no-underline text-white border border-white/10">
                   <div class="flex items-center gap-3">
                      <div class="bg-[var(--color-accent-blue)] p-2 rounded-lg text-white">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                      </div>
                      <span class="font-bold">Registrar Venta</span>
                   </div>
                   <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </NuxtLink>

                <NuxtLink to="/app/inventory" class="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-colors group cursor-pointer no-underline text-white border border-white/10">
                   <div class="flex items-center gap-3">
                      <div class="bg-[var(--color-accent-violet)] p-2 rounded-lg text-white">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                      </div>
                      <span class="font-bold">Nuevo Producto</span>
                   </div>
                   <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </NuxtLink>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })
const supabase = useSupabaseClient()
useAuthGuard()
const router = useRouter()
const { organization, fetchOrganization } = useOrganization()

const todaySales = ref(0)
const lowStockCount = ref(0)
const clientCount = ref(0)
const recentTransactions = ref([])
const loading = ref(true)

onMounted(async () => {
    try {
      // 0. Ensure Org is loaded for the title
      await fetchOrganization()

      // 1. Check Organization Membership (Onboarding Check) logic
      if (organization.value === null) { 
          // double check via DB directly in case composable is slow or empty
          const { count: orgCount } = await supabase.from('organization_members')
            .select('*', { count: 'exact', head: true })
          
          if (orgCount === 0) {
            return router.push('/onboarding')
          }
      }

      // 2. Get Today Sales
      const today = new Date().toISOString().split('T')[0]
      const { data: sales } = await supabase.from('transactions')
          .select('amount')
          .eq('type', 'sale')
          .gte('date', today)
      
      todaySales.value = sales?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

      // 3. Low Stock
      const { count: stockCount } = await supabase.from('products')
          .select('*', { count: 'exact', head: true })
          .lt('stock', 10)
      lowStockCount.value = stockCount || 0

      // 4. Client Count
      const { count: clCount } = await supabase.from('clients')
          .select('*', { count: 'exact', head: true })
      clientCount.value = clCount || 0

      // 5. Recent Trx
      const { data: recent } = await supabase.from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(5)
      recentTransactions.value = recent || []
    } catch (e) {
      console.error('Error loading dashboard:', e)
    } finally {
      loading.value = false
    }
})
</script>
