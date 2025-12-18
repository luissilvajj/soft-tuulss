<template>
  <div class="min-h-screen flex bg-[var(--color-bg-dark)] transition-colors duration-300 font-sans">
    <!-- Left Side - Form -->
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <NuxtLink to="/" class="flex items-center gap-2 group">
             <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
               <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
             </div>
             <span class="text-xl font-bold text-[var(--color-white)] tracking-tight">Soft Tuuls</span>
          </NuxtLink>
          <h2 class="mt-8 text-3xl font-extrabold text-gradient tracking-tight">Actualizar contraseña</h2>
          <p class="mt-2 text-sm text-[var(--color-text-secondary)]">
            Ingresa tu nueva contraseña a continuación.
          </p>
        </div>

        <div class="mt-10">
          <form @submit.prevent="handleUpdatePassword" class="space-y-6">
            <div>
              <label for="password" class="block text-sm font-bold text-[var(--color-text-secondary)]">Nueva contraseña</label>
              <div class="mt-2 relative">
                <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" required class="appearance-none block w-full px-4 py-3 border border-[var(--color-border-subtle)] rounded-xl shadow-sm placeholder-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent bg-[var(--color-bg-subtle)] text-[var(--color-white)] sm:text-sm transition-all pr-10" placeholder="••••••••" />
                <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-white)] cursor-pointer focus:outline-none">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <button type="submit" :disabled="loading" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-violet)] hover:from-indigo-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95">
                <span v-if="loading" class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Actualizando...
                </span>
                <span v-else>Guardar contraseña</span>
              </button>
            </div>
            
            <div v-if="successMsg" class="rounded-xl bg-green-500/10 border border-green-500/20 p-4 animate-pulse">
              <div class="flex">
                 <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-bold text-green-500">{{ successMsg }}</h3>
                  <div class="mt-2">
                    <NuxtLink to="/login" class="font-semibold text-green-600 hover:text-green-500">
                      Ir a Iniciar Sesión &rarr;
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="errorMsg" class="rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-pulse">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-bold text-red-500">{{ errorMsg }}</h3>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Right Side - Image/Art -->
    <div class="hidden lg:block relative w-0 flex-1 overflow-hidden bg-[var(--color-bg-dark)]">
       <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-dark)] to-[#000000]"></div>
       <!-- Decorators -->
       <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent-blue)]/20 rounded-full blur-[120px]"></div>
       <div class="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--color-accent-violet)]/20 rounded-full blur-[100px]"></div>
       
       <div class="relative w-full h-full flex items-center justify-center p-20">
          <!-- Abstract UI Representation -->
          <div class="w-full aspect-[4/3] glass-panel p-8 transform rotate-3 hover:rotate-0 transition-transform duration-700 relative overflow-hidden group">
             <div class="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[var(--color-accent-blue)]/30 to-[var(--color-accent-violet)]/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
             
             <div class="h-8 w-1/3 bg-[var(--color-bg-subtle)]/50 rounded-lg mb-8 relative z-10 backdrop-blur-md"></div>
             <div class="space-y-4 relative z-10">
               <div class="h-20 w-full bg-[var(--color-bg-subtle)]/30 rounded-xl border border-[var(--color-border-subtle)] backdrop-blur-sm"></div>
               <div class="h-20 w-full bg-[var(--color-bg-subtle)]/30 rounded-xl border border-[var(--color-border-subtle)] backdrop-blur-sm"></div>
               <div class="h-20 w-full bg-[var(--color-bg-subtle)]/30 rounded-xl border border-[var(--color-border-subtle)] backdrop-blur-sm"></div>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const router = useRouter()

definePageMeta({
  layout: false
})

const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleUpdatePassword = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    const { error } = await client.auth.updateUser({
      password: password.value
    })

    if (error) throw error

    successMsg.value = 'Tu contraseña ha sido actualizada correctamente.'
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>
