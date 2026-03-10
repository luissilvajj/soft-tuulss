<template>
  <BaseCard class="p-6">
      <div class="grid grid-cols-1 gap-8">
          
          <!-- Identity Section -->
          <div>
              <h3 class="text-lg font-bold text-text-heading flex items-center gap-2 mb-1">
                  <span>🏢</span> Identidad de la Empresa
              </h3>
              <p class="text-sm text-text-secondary mb-6">Información visible en tickets y facturas.</p>

              <div class="mb-8">
                  <label class="block text-sm font-bold text-text-secondary mb-4">Logotipo (Ticket & App)</label>
                  <LogoUploader v-model="form.logo_url" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BaseInput 
                    v-model="form.name" 
                    label="Nombre Comercial" 
                    placeholder="Ej. Panadería La Estrella" 
                  />
                  <BaseInput 
                    v-model="form.fiscal_doc" 
                    label="Doc. Fiscal (RIF/NIT)" 
                    placeholder="Ej. J-12345678-9" 
                  />
                  <div class="md:col-span-2">
                      <BaseInput 
                        v-model="form.address" 
                        label="Dirección Fiscal" 
                        placeholder="Ej. Av. Principal, Local 1" 
                      />
                  </div>
                   <div>
                      <BaseInput 
                        v-model="form.phone" 
                        label="Teléfono" 
                        placeholder="Ej. +58 412 1234567" 
                      />
                  </div>
                   <div class="md:col-span-2">
                      <BaseInput 
                        v-model="form.receipt_footer" 
                        label="Mensaje en Ticket" 
                        placeholder="Ej. ¡Gracias por su compra! No se aceptan devoluciones pasadas 24h." 
                      />
                  </div>
              </div>
          </div>

      </div>

       <!-- Action Footer -->
       <div class="mt-8 flex justify-end">
          <BaseButton 
            variant="primary" 
            :loading="saving" 
            @click="saveSettings"
          >
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </BaseButton>
      </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from "vue-toastification"
import type { Database } from '~/types/database.types'
import BaseCard from '~/components/base/BaseCard.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import BaseButton from '~/components/base/BaseButton.vue'

const { organization, fetchOrganization } = useOrganization()
const client = useSupabaseClient<Database>()
const toast = useToast()

const form = ref<any>({})
const saving = ref(false)

// Init Form
watch(() => organization.value, (org) => {
    if (org) {
        form.value = { ...org }
    }
}, { immediate: true })

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
