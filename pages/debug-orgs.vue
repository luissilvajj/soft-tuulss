<template>
  <div class="p-8 bg-gray-900 min-h-screen text-white font-mono">
    <h1 class="text-2xl font-bold mb-4">Debug Organizations API</h1>
    
    <div class="space-y-4">
        <div class="border p-4 rounded bg-gray-800">
            <h2 class="font-bold text-blue-400">User Session</h2>
            <pre>{{ user ? { id: user.id, email: user.email } : 'No Session' }}</pre>
        </div>

        <div class="border p-4 rounded bg-gray-800">
            <h2 class="font-bold text-green-400">API Response (/api/me/organizations)</h2>
            <div v-if="pending">Loading...</div>
            <div v-else-if="error" class="text-red-400">
                Error: {{ error }}
            </div>
            <pre v-else>{{ data }}</pre>
        </div>

        <div class="border p-4 rounded bg-gray-800">
            <h2 class="font-bold text-yellow-400">Manual Fetch Test</h2>
            <button @click="testFetch" class="bg-blue-600 px-4 py-2 rounded">Fetch Now</button>
            <pre class="mt-2">{{ manualResult }}</pre>
        </div>

        <NuxtLink to="/app" class="block w-fit bg-gray-700 px-4 py-2 rounded mt-8">Back to App</NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
const user = useSupabaseUser()
const manualResult = ref(null)

const { data, pending, error } = await useFetch('/api/me/organizations')

const testFetch = async () => {
    try {
        const res = await $fetch('/api/me/organizations')
        manualResult.value = res
    } catch (e) {
        manualResult.value = e
    }
}
</script>
