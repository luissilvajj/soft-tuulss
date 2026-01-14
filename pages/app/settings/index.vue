<template>
  <div class="max-w-4xl mx-auto pb-20">
      <h1 class="text-3xl font-bold tracking-tight text-gradient mb-8">Configuración</h1>

      <div class="space-y-8">
          <!-- Identity Section -->
          <section class="glass-panel p-8">
              <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                  <span>🏢</span> Identidad de la Empresa
              </h2>
              
              <div class="mb-8">
                  <label class="block text-sm font-bold text-gray-500 mb-4">Logotipo (Ticket & App)</label>
                  <LogoUploader v-model="form.logo_url" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label class="block text-sm font-bold text-gray-500 mb-2">Nombre Comercial</label>
                      <input v-model="form.name" type="text" class="input-std" placeholder="Ej. Panadería La Estrella">
                  </div>
                  <div>
                      <label class="block text-sm font-bold text-gray-500 mb-2">Doc. Fiscal (RIF/NIT)</label>
                      <input v-model="form.fiscal_doc" type="text" class="input-std" placeholder="Ej. J-12345678-9">
                  </div>
                  <div class="md:col-span-2">
                      <label class="block text-sm font-bold text-gray-500 mb-2">Dirección Fiscal</label>
                      <input v-model="form.address" type="text" class="input-std" placeholder="Ej. Av. Principal, Local 1">
                  </div>
                   <div>
                      <label class="block text-sm font-bold text-gray-500 mb-2">Teléfono</label>
                      <input v-model="form.phone" type="text" class="input-std" placeholder="Ej. +58 412 1234567">
                  </div>
                   <div class="md:col-span-2">
                      <label class="block text-sm font-bold text-gray-500 mb-2">Mensaje en Ticket</label>
                      <input v-model="form.receipt_footer" type="text" class="input-std" placeholder="Ej. ¡Gracias por su compra! No se aceptan devoluciones pasadas 24h.">
                  </div>
              </div>

              <div class="mt-8 flex justify-end">
                  <button @click="saveSettings" class="btn btn-primary" :disabled="saving">
                      {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
              </div>
          </section>

          <!-- Team Section -->
          <section class="glass-panel p-8">
              <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                  <span>👥</span> Equipo y Accesos
              </h2>
              <div class="overflow-x-auto">
                  <table class="min-w-full text-sm text-left">
                      <thead class="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-stone-900">
                          <tr>
                              <th class="px-4 py-3">Usuario</th>
                              <th class="px-4 py-3">Rol</th>
                              <th class="px-4 py-3 text-right">Estado</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="member in team" :key="member.id" class="border-b dark:border-gray-800">
                              <td class="px-4 py-3 font-medium">
                                  {{ member.profiles?.full_name || 'Usuario' }}
                                  <div class="text-xs text-gray-500 font-normal">ID: {{ member.user_id }}</div>
                              </td>
                              <td class="px-4 py-3">
                                  <span class="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase">
                                      {{ member.role }}
                                  </span>
                              </td>
                              <td class="px-4 py-3 text-right">
                                  <span class="text-emerald-500">Activo</span>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
              <p class="text-xs text-gray-500 mt-4">* Para agregar usuarios, contacta a soporte (MVP Limit).</p>
          </section>
      </div>
  </div>
</template>

<style scoped>
.input-std {
    @apply w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all;
}
</style>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from "vue-toastification"
import type { Database } from '~/types/database.types'

definePageMeta({ layout: 'dashboard', middleware: 'admin-auth' })

const { organization, fetchOrganization } = useOrganization()
const client = useSupabaseClient<Database>()
const toast = useToast()

const form = ref<any>({})
const team = ref<any[]>([])
const saving = ref(false)

// Init Form
watch(() => organization.value, (org) => {
    if (org) {
        form.value = { ...org }
    }
}, { immediate: true })

// Fetch Team
onMounted(async () => {
    await fetchOrganization()
    if (organization.value?.id) {
        const { data } = await client
            .from('organization_members')
            .select('*, profiles(full_name, avatar_url)')
            .eq('organization_id', organization.value.id)
        team.value = data || []
    }
})

const saveSettings = async () => {
    saving.value = true
    try {
        const { error } = await client
            .from('organizations')
            .update({
                name: form.value.name,
                fiscal_doc: form.value.fiscal_doc,
                address: form.value.address,
                phone: form.value.phone,
                receipt_footer: form.value.receipt_footer
            } as any)
            .eq('id', organization.value!.id)

        if (error) throw error
        
        toast.success('Configuración guardada')
        await fetchOrganization() // Refresh Store
    } catch (e: any) {
        toast.error(e.message)
    } finally {
        saving.value = false
    }
}
</script>
