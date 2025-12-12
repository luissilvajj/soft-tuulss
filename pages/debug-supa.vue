<template>
  <div class="p-10 text-white bg-gray-900 min-h-screen">
    <h1 class="text-2xl font-bold mb-4">Supabase Debugyer</h1>
    
    <div class="mb-6 p-4 border border-gray-700 rounded">
      <h2 class="text-xl font-bold mb-2">Config Status</h2>
      <p><strong>Supabase URL Present:</strong> {{ hasUrl ? 'YES' : 'NO' }}</p>
      <p><strong>Supabase Key Present:</strong> {{ hasKey ? 'YES' : 'NO' }}</p>
      <p><strong>Supabase URL Value (Masked):</strong> {{ maskedUrl }}</p>
      <p><strong>Supabase Key Value (Prefix):</strong> {{ keyPrefix }}</p>
    </div>

    <div class="p-4 border border-gray-700 rounded">
      <h2 class="text-xl font-bold mb-2">Connection Test</h2>
      <button @click="testConnection" class="bg-blue-600 px-4 py-2 rounded">Ping Supabase</button>
      <p class="mt-2">{{ connectionStatus }}</p>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const hasUrl = computed(() => !!config.public.supabase.url)
const hasKey = computed(() => !!config.public.supabase.key)

const maskedUrl = computed(() => {
    const url = config.public.supabase.url || ''
    return url.length > 10 ? url.substring(0, 15) + '...' : '(empty)'
})

const keyPrefix = computed(() => {
    const key = config.public.supabase.key || ''
    return key.substring(0, 5) + '...'
})

const connectionStatus = ref('Click to test...')
const client = useSupabaseClient()

const testConnection = async () => {
    connectionStatus.value = 'Testing...'
    try {
        // Just try to fetch session or something simple
        const { data, error } = await client.from('products').select('count', { count: 'exact', head: true })
        if (error) {
             connectionStatus.value = 'Error: ' + error.message
        } else {
             connectionStatus.value = 'Success! Connected.'
        }
    } catch (e) {
        connectionStatus.value = 'Exception: ' + e.message
    }
}
</script>
