<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div class="max-w-2xl w-full space-y-8">
            <div class="text-center">
                <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
                    Selecciona tu Organización
                </h2>
                <p class="mt-2 text-sm text-gray-600">
                    Tienes acceso a las siguientes organizaciones. Elige una para continuar.
                </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <button
                    v-for="org in userOrganizations"
                    :key="org.id"
                    @click="selectOrg(org)"
                    class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all bg-white shadow-sm hover:shadow-md"
                >
                    <div class="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                       <span class="text-xl font-bold text-indigo-600">{{ org.name[0].toUpperCase() }}</span>
                    </div>
                    <span class="mt-2 block text-lg font-medium text-gray-900">
                        {{ org.name }}
                    </span>
                    <span class="block text-sm text-gray-500 mt-1 capitalize">
                        Role: {{ org.role }}
                    </span>
                </button>

                <!-- Create New Option -->
                <button
                    v-if="userOrganizations.length < 3"
                    @click="goToCreate"
                    class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none transition-all"
                >
                    <div class="mx-auto h-12 w-12 text-gray-400">
                        <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4v-4m0 0v-4m-4 4h4m0 0h4" />
                        </svg>
                    </div>
                    <span class="mt-2 block text-sm font-medium text-gray-900">
                        Crear nueva Organización
                    </span>
                </button>
            </div>

            <p v-if="userOrganizations.length >= 3" class="text-center text-xs text-red-500 mt-4">
                Has alcanzado el límite de 3 organizaciones.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'auth' // Use auth or default layout? empty usually best for this. Let's assume auth like logic.
})

const { userOrganizations, switchOrganization } = useOrganization()
const router = useRouter()

// Redirect if strictly empty (should be handled by middleware but safety check)
onMounted(() => {
    if (userOrganizations.value.length === 0) {
        // router.push('/onboarding') 
        // We let the list load first.
    }
})

const selectOrg = async (org: any) => {
    await switchOrganization(org.id)
    // switchOrganization handles reload or redirect? The composable reloads window.
}

const goToCreate = () => {
    router.push('/onboarding') // Assuming onboarding is where you create new ones
}
</script>
