<template>
  <div class="flex items-center gap-6">
     <div v-if="previewUrl" class="relative group">
         <img :src="previewUrl" class="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm" alt="Logo Org" />
         <div v-if="uploading" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
             <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
         </div>
     </div>
     <div v-else class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
         <span v-if="!uploading">Sin Logo</span>
         <div v-if="uploading" class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
     </div>

     <div>
         <input 
            type="file" 
            ref="fileInputRef" 
            class="hidden" 
            accept="image/*"
            @change="handleFileChange"
         >
         <button 
            type="button"
            @click="triggerUpload" 
            class="btn bg-white border hover:bg-gray-50 text-sm" 
            :disabled="uploading"
         >
            {{ previewUrl ? 'Cambiar Logo' : 'Subir Logo' }}
         </button>
         <p class="text-xs text-gray-500 mt-2">Max 2MB. PNG/JPG.</p>
     </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "vue-toastification"
import { useOrganization } from '~/composables/useOrganization'
import type { Database } from '~/types/database.types'

const props = defineProps<{
    modelValue?: string
}>()

const emit = defineEmits(['update:modelValue', 'uploaded'])

const supabase = useSupabaseClient<Database>()
const { organization } = useOrganization()
const toast = useToast()
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerUpload = () => {
    fileInputRef.value?.click()
}

const previewUrl = computed(() => props.modelValue)

const handleFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement
    if (!input.files?.length) return

    const file = input.files[0]
    if (file.size > 2 * 1024 * 1024) {
        toast.error('El archivo es muy pesado (Max 2MB)')
        return
    }

    uploading.value = true
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${organization.value?.id}/logo-${Date.now()}.${fileExt}`

        // Upload
        const { error: uploadError } = await supabase.storage
            .from('org_assets')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (uploadError) throw uploadError

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('org_assets')
            .getPublicUrl(fileName)

        // Update DB Organization
        if (organization.value?.id) {
             const { error: dbError } = await supabase
                .from('organizations')
                .update({ logo_url: publicUrl } as any)
                .eq('id', organization.value.id)
            
            if (dbError) throw dbError
        }

        emit('update:modelValue', publicUrl)
        emit('uploaded', publicUrl)
        toast.success('Logo actualizado')

    } catch (e: any) {
        toast.error('Error subiendo logo: ' + e.message)
    } finally {
        uploading.value = false
        // Reset input
        if (input.value) input.value = '' 
    }
}
</script>
