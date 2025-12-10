<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Crea tu cuenta gratis</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">Inicia sesión</NuxtLink>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSignup">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <div class="mt-1">
              <input id="name" v-model="fullName" name="name" type="text" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <div class="mt-1">
              <input id="email" v-model="email" name="email" type="email" autocomplete="email" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
            <div class="mt-1">
              <input id="password" v-model="password" name="password" type="password" autocomplete="new-password" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <button type="submit" :disabled="loading" class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400">
              {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
            </button>
          </div>
        </form>
        <p v-if="errorMsg" class="mt-4 text-center text-sm text-red-600">{{ errorMsg }}</p>
        <p v-if="successMsg" class="mt-4 text-center text-sm text-green-600">{{ successMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSignup = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''
    
    const { data, error } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value
        }
      }
    })
    
    if (error) throw error

    // If email confirmation is disabled, we might be logged in automatically.
    // If enabled, user needs to check email.
    // Assuming for MVP it might be disabled or we handle the flow.
    // Checking if session exists
    if (data.session) {
      router.push('/onboarding')
    } else {
      successMsg.value = 'Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta.'
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>
