<script setup lang="ts">
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  ArchiveBoxIcon, 
  UserIcon,
  ArrowLeftOnRectangleIcon,
  UsersIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline';
import SyncIndicator from '~/components/status/SyncIndicator.vue';

import { usePermissions } from '~/composables/usePermissions';

const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();
const { isSeniatAuditor, isAdmin, canEditInventory, canViewFinancials } = usePermissions();
const { organization, fetchOrganization } = useOrganization()

const navigation = computed(() => {
  if (isSeniatAuditor.value) {
      return [
          { name: 'Módulo Fiscal (Z)', href: '/app/reports/fiscal', icon: ClipboardDocumentListIcon }
      ]
  }

  const nav = [
      { name: 'Dashboard', href: '/app', icon: HomeIcon },
      { name: 'Vender', href: '/app/sales/new', icon: ShoppingCartIcon },
      { name: 'Ventas', href: '/app/sales', icon: ClipboardDocumentListIcon },
      { name: 'Movimientos', href: '/app/transactions', icon: ArrowsRightLeftIcon },
      { name: 'Clientes', href: '/app/clients', icon: UsersIcon },
      { name: 'Compras', href: '/app/purchases', icon: ShoppingBagIcon },
      { name: 'CxC / CxP', href: '/app/debts', icon: CurrencyDollarIcon }
  ]

  if (canEditInventory.value) {
      nav.push({ name: 'Inventario', href: '/app/inventory', icon: ArchiveBoxIcon })
  }

  if (canViewFinancials.value) {
      nav.push({ name: 'Reportes', href: '/app/reports', icon: ChartBarIcon })
      nav.push({ name: 'Libros Contables', href: '/app/reports/ledgers', icon: ClipboardDocumentListIcon })
  }

  if (isAdmin.value) {
      nav.push({ name: 'Módulo Fiscal (Z)', href: '/app/reports/fiscal', icon: ClipboardDocumentListIcon })
  }

  nav.push({ name: 'AI Analyst', href: '/app/ai', icon: SparklesIcon })
  nav.push({ name: 'Configuración', href: '/app/settings', icon: UserIcon })

  return nav
});

const logout = async () => {
  await client.auth.signOut();
  router.push('/login');
};

const ensureGlobalState = async (userId: string) => {
    if (!userId) return;
    
    // Si no tenemos la organización con su rol, intentamos recuperarlo de la base de datos
    if (!organization.value?.role) {
        const { data: orgData } = await client
            .from('organization_members')
            .select(`
                organization:organizations ( id, name, subscription_status, logo_url ),
                role
            `)
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle()
        
        if (orgData && orgData.organization) {
            organization.value = {
                ...orgData.organization,
                role: orgData.role || 'Usuario' // Explicitly set role
            }
        }
    }
}

onMounted(async () => {
    // 1. Recover Session explicitly
    const { data: { session } } = await client.auth.getSession()
    if (!session?.user) return

    const userId = session.user.id
    await ensureGlobalState(userId)

    if (!organization.value) {
        await fetchOrganization()
    }
})
</script>

<template>
  <div class="min-h-screen bg-surface-subtle font-sans text-text-body">
    <!-- Desktop Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-surface-border bg-surface-ground lg:flex">
      <div class="flex h-16 items-center px-6 border-b border-surface-border">
        <span class="text-xl font-bold tracking-tight text-primary-600">Softtuuls</span>
        <span class="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">Gold</span>
      </div>

      <div class="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav class="flex-1 space-y-1 px-4">
          <NuxtLink 
            v-for="item in navigation" 
            :key="item.name" 
            :to="item.href"
            active-class="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
            class="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-section hover:text-text-heading"
          >
            <component 
              :is="item.icon" 
              class="mr-3 h-5 w-5 flex-shrink-0" 
              :class="[ $route.path === item.href ? 'text-primary-600 dark:text-primary-400' : 'text-text-secondary group-hover:text-text-heading' ]" 
            />
            {{ item.name }}
          </NuxtLink>
        </nav>
      </div>

      <!-- Desktop Sidebar Footer -->
      <div class="border-t border-surface-border p-4">
        <div class="mb-4 flex flex-col gap-3">
             <SyncIndicator />
             <div class="flex items-center gap-2 text-sm text-text-secondary font-medium px-2 py-1">
                 <ThemeSwitcher />
                 <span>Apariencia</span>
             </div>
        </div>
        <div class="flex items-center group cursor-pointer" @click="logout">
          <div class="h-9 w-9 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
            {{ user?.email?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-text-heading">
              {{ user?.email?.split('@')[0] || 'Usuario' }}
            </p>
            <p class="text-xs text-text-secondary group-hover:text-text-heading transition-colors">Cerrar Sesión</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-surface-border bg-surface-ground px-4 shadow-sm lg:hidden">
      <div class="flex items-center">
        <span class="text-lg font-bold text-primary-600">Softtuuls</span>
      </div>
      <div class="flex items-center gap-2">
        <ThemeSwitcher />
        <SyncIndicator />
      </div>
    </header>

    <!-- Main Content -->
    <main class="lg:pl-64 pb-24 lg:pb-8">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-surface-border bg-surface-ground pb-safe pt-2 lg:hidden">
      <NuxtLink 
        v-for="item in navigation" 
        :key="item.name" 
        :to="item.href"
        active-class="text-primary-600 dark:text-primary-400"
        class="flex flex-col items-center p-2 text-text-secondary transition-colors hover:text-text-heading"
      >
        <component 
          :is="item.icon" 
          class="h-6 w-6" 
          :class="[ $route.path === item.href ? 'text-primary-600 dark:text-primary-400' : '' ]"
        />
        <span class="mt-1 text-[10px] font-medium">{{ item.name }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
/* Support for iOS safe area integration */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>
