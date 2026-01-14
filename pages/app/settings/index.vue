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
              <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>👥</span> Equipo y Accesos
              </h2>
              <p class="text-sm text-[var(--color-text-secondary)] mb-6">Gestiona los miembros de tu equipo, sus roles y permisos de acceso.</p>
              
              <NuxtLink to="/app/settings/team" class="btn btn-primary inline-flex items-center gap-2">
                  Gestionar Equipo
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </NuxtLink>
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
