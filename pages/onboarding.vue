<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Configura tu Organización</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Para comenzar, necesitamos el nombre de tu empresa o equipo.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="createOrganization">
          <div>
            <label for="orgName" class="block text-sm font-medium text-gray-700">Nombre de la Organización</label>
            <div class="mt-1">
              <input id="orgName" v-model="orgName" name="orgName" type="text" required placeholder="Ej. Mi Empresa S.A." class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <button type="submit" :disabled="loading" class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400">
              {{ loading ? 'Creando...' : 'Comenzar' }}
            </button>
          </div>
        </form>
        <p v-if="errorMsg" class="mt-4 text-center text-sm text-red-600">{{ errorMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()

const orgName = ref('')
const loading = ref(false)
const errorMsg = ref('')

const createOrganization = async () => {
  if (!orgName.value.trim()) return

  try {
    loading.value = true
    errorMsg.value = ''
    
    // Call the database function we created in schema.sql
    const { data, error } = await client.rpc('create_org_for_user', {
      org_name: orgName.value
    })

    if (error) throw error

    // Success - Redirect to Dashboard
    router.push('/app')
  } catch (error) {
    console.error(error)
    errorMsg.value = error.message || 'Error al crear la organización'
  } finally {
    loading.value = false
  }
}
</script>
