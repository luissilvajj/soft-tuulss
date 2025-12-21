<template>
  <div class="p-8 bg-gray-900 min-h-screen text-white font-mono">
    <h1 class="text-2xl font-bold mb-4">🕵️‍♂️ Admin Data Debugger</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- USER / ORG INFO -->
        <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h2 class="text-xl font-bold mb-2 text-blue-400">1. User & Org Identity</h2>
            <div v-if="loading" class="animate-pulse">Loading...</div>
            <pre v-else class="text-xs overflow-auto max-h-60">{{ JSON.stringify({ user: user?.id, email: user?.email }, null, 2) }}</pre>
            
            <h3 class="font-bold mt-4 text-green-400">Current Org State (Composable)</h3>
            <pre class="text-xs overflow-auto max-h-40 bg-black p-2 rounded">{{ JSON.stringify(organization, null, 2) }}</pre>
        </div>

        <!-- TRANSACTIONS -->
        <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
             <div class="flex justify-between items-center mb-2">
                <h2 class="text-xl font-bold text-yellow-400">2. Recent Transactions (Last 50)</h2>
                <button @click="fetchData" class="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-500">Refresh</button>
             </div>
            
            <div v-if="txLoading">Loading Transactions...</div>
            <div v-else-if="transactions.length === 0" class="text-red-400 font-bold p-4 text-center border border-red-900 rounded bg-red-900/20">
                NO TRANSACTIONS FOUND
            </div>
            <ul v-else class="space-y-1 text-xs max-h-96 overflow-auto">
                <li v-for="t in transactions" :key="t.id" class="p-2 bg-gray-700 rounded hover:bg-gray-600">
                    <span class="text-green-300 font-bold">{{ t.type }}</span> | 
                    <span class="text-white">${{ t.amount }}</span> | 
                    <span class="text-gray-400">{{ t.date }}</span> <br>
                    <span class="text-gray-500 text-[10px]">Org: {{ t.organization_id }}</span>
                </li>
            </ul>
        </div>
    </div>

    <!-- ERROR LOG -->
    <div v-if="errorLog" class="mt-8 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
        <h3 class="font-bold">Errors:</h3>
        <pre>{{ errorLog }}</pre>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const user = useSupabaseUser()
const client = useSupabaseClient()
const { organization } = useOrganization()

const transactions = ref([])
const txLoading = ref(false)
const errorLog = ref('')
const loading = ref(false)

const fetchData = async () => {
    loading.value = true
    txLoading.value = true
    errorLog.value = ''
    try {
        const { data: txs, error } = await client
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })
            .limit(50)
        
        if (error) throw error
        transactions.value = txs || []

    } catch (e) {
        errorLog.value = JSON.stringify(e, null, 2)
    } finally {
        loading.value = false
        txLoading.value = false
    }
}

onMounted(() => {
    fetchData()
})
</script>
