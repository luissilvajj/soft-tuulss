<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-dark)] p-4 relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-accent-blue)]/10 rounded-full blur-[128px]"></div>
        <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[var(--color-accent-violet)]/10 rounded-full blur-[128px]"></div>

        <div class="max-w-md w-full relative z-10">
            <div class="text-center mb-8">
                <!-- Icon -->
                <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-accent-blue)]/20">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                
                <h2 class="text-3xl font-extrabold text-[var(--color-white)] tracking-tight">
                    Selecciona tu Espacio
                </h2>
                <p class="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Accede a uno de tus espacios de trabajo
                </p>
            </div>

            <div class="space-y-3">
                <!-- Organization List -->
                <button
                    v-for="org in userOrganizations"
                    :key="org.id"
                    @click="selectOrg(org)"
                    class="group relative w-full flex items-center justify-between p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--glass-bg)] hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-strong)] transition-all duration-300"
                >
                    <!-- Left Side: Avatar + Info -->
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-bg-subtle)] to-[var(--color-bg-dark)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-white)] font-bold text-lg group-hover:scale-110 transition-transform">
                            {{ org.name[0].toUpperCase() }}
                        </div>
                        <div class="text-left">
                            <span class="block text-base font-bold text-[var(--color-white)] group-hover:text-[var(--color-accent-blue)] transition-colors">
                                {{ org.name }}
                            </span>
                            <span class="block text-xs text-[var(--color-text-secondary)] capitalize flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full" :class="org.subscription_status === 'active' || org.subscription_status === 'trialing' ? 'bg-emerald-500' : 'bg-gray-500'"></span>
                                {{ org.role }}
                            </span>
                        </div>
                    </div>

                    <!-- Right Side: Arrow -->
                    <svg class="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-blue)] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>

                <!-- Create New Option -->
                <button
                    v-if="userOrganizations.length < 3"
                    @click="goToCreate"
                    class="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/5 transition-all mt-4"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span class="text-sm font-bold">Crear nueva organización</span>
                </button>

                 <p v-if="userOrganizations.length >= 3" class="text-center text-xs text-red-400 mt-4 bg-red-900/10 py-2 rounded">
                    Has alcanzado el límite de 3 organizaciones.
                </p>
            </div>
        </div>
        
        <!-- Bottom Link -->
        <div class="absolute bottom-8 text-xs text-[var(--color-text-secondary)] text-center">
            Soft Tuuls &bull; v1.0
            <br>
            <span class="opacity-50 font-mono mt-2 block">
                UID: {{ user?.id }}
                <br>
                Orgs: {{ userOrganizations?.length || 0 }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'empty' 
})

const { userOrganizations, switchOrganization } = useOrganization()
const user = useSupabaseUser()
const router = useRouter()

// Force refresh on mount to be sure
onMounted(async () => {
    console.log('SelectOrg: Mounted. ID:', user.value?.id)
    if (userOrganizations.value.length === 0) {
        console.log('SelectOrg: Fetching fresh list...')
        const { fetchOrganization } = useOrganization() // get fetcher
        await fetchOrganization(true) // Force load
    }
})
const selectOrg = async (org: any) => {
    await switchOrganization(org.id)
}

const goToCreate = () => {
    router.push('/onboarding')
}
</script>
