<template>
  <BaseModal 
    :show="show" 
    title="Importar Productos" 
    description="Carga masiva desde Excel (.xlsx)"
    max-width="4xl"
    @close="$emit('close')"
  >
    <!-- Step 1: File Upload -->
    <div v-if="!parsedData.length" 
        class="border-2 border-dashed border-surface-border rounded-xl p-10 text-center hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer group"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @click="$refs.fileInput.click()"
    >
        <input ref="fileInput" type="file" class="hidden" accept=".xlsx, .xls, .csv" @change="handleFileSelect" />
        
        <div class="w-16 h-16 bg-surface-subtle rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>
        <h4 class="text-lg font-bold text-text-heading group-hover:text-primary-600 transition-colors">Sube o arrastra tu archivo aquí</h4>
        <p class="text-text-secondary text-sm mt-2">Soporta .xlsx, .xls</p>
        <div class="mt-6 text-xs text-text-secondary bg-surface-section py-2 px-4 rounded-lg inline-block">
            <p class="font-bold mb-1">Columnas esperadas:</p>
            <code class="font-mono text-primary-600">SKU, Nombre, Precio, Costo, Stock, Categoría</code>
        </div>
    </div>

    <!-- Step 2: Preview -->
    <div v-else>
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
                <span class="text-sm font-bold bg-status-success/10 text-status-success px-3 py-1 rounded-full border border-status-success/20">
                    {{ parsedData.length }} productos detectados
                </span>
                <div v-if="duplicates.length > 0" class="text-sm font-bold bg-status-warning/10 text-status-warning px-3 py-1 rounded-full border border-status-warning/20">
                        {{ duplicates.length }} actualizaciones (SKU existente)
                </div>
            </div>
            <button @click="reset" class="text-sm text-primary-600 hover:text-primary-700 hover:underline font-bold transition-colors">Cambiar archivo</button>
        </div>

        <div class="overflow-x-auto border border-surface-border rounded-xl max-h-[400px]">
            <table class="min-w-full divide-y divide-surface-border text-left">
                <thead class="bg-surface-section sticky top-0 z-10">
                    <tr>
                        <th class="px-4 py-3 text-xs font-bold text-text-secondary uppercase">SKU</th>
                        <th class="px-4 py-3 text-xs font-bold text-text-secondary uppercase">Nombre</th>
                        <th class="px-4 py-3 text-xs font-bold text-text-secondary uppercase text-right">Precio</th>
                        <th class="px-4 py-3 text-xs font-bold text-text-secondary uppercase text-center">Stock</th>
                        <th class="px-4 py-3 text-xs font-bold text-text-secondary uppercase">Estado</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-surface-border bg-surface-ground">
                    <tr v-for="(row, idx) in previewData" :key="idx" class="hover:bg-surface-section transition-colors">
                        <td class="px-4 py-2 text-sm text-text-secondary font-mono">{{ row.sku }}</td>
                        <td class="px-4 py-2 text-sm font-bold text-text-heading truncate max-w-[200px]">{{ row.name }}</td>
                        <td class="px-4 py-2 text-sm text-text-heading text-right font-mono">${{ row.price }}</td>
                        <td class="px-4 py-2 text-sm text-text-heading text-center font-mono">{{ row.stock }}</td>
                        <td class="px-4 py-2 text-xs">
                            <span v-if="row.isValid" class="text-status-success font-bold flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                Válido
                            </span>
                            <span v-else class="text-status-error font-bold flex items-center gap-1" :title="row.error">
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Error
                            </span>
                        </td>
                    </tr>
                        <!-- Show More Row -->
                    <tr v-if="parsedData.length > 50">
                        <td colspan="5" class="px-4 py-3 text-center text-xs text-text-secondary italic bg-surface-section">
                            ... y {{ parsedData.length - 50 }} productos más
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-4 p-4 bg-status-error/10 border border-status-error/20 rounded-xl text-status-error text-sm font-bold flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ error }}
    </div>

    <template #actions>
      <BaseButton 
          v-if="parsedData.length > 0"
          variant="primary"
          :loading="importing"
          :disabled="invalidCount > 0"
          @click="confirmImport"
      >
          Importar {{ parsedData.length }} Productos
      </BaseButton>
      <BaseButton 
          variant="ghost" 
          @click="$emit('close')"
      >
          Cancelar
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import * as XLSX from 'xlsx'
import BaseModal from './base/BaseModal.vue'
import BaseButton from './base/BaseButton.vue'

const props = defineProps({
  show: Boolean,
  existingSkus: {
      type: Array, // Strings
      default: () => []
  }
})

const emit = defineEmits(['close', 'import'])

const fileInput = ref(null)
const parsedData = ref([])
const error = ref('')
const importing = ref(false)

const duplicates = computed(() => {
    return parsedData.value.filter(item => props.existingSkus.includes(item.sku))
})

const invalidCount = computed(() => parsedData.value.filter(i => !i.isValid).length)

const previewData = computed(() => parsedData.value.slice(0, 50)) // Show max 50

const reset = () => {
    parsedData.value = []
    error.value = ''
    if(fileInput.value) fileInput.value.value = ''
}

const processFile = async (file) => {
    error.value = ''
    if (!file) return

    // [FIX - FASE 3] Protección contra Out Of Memory (OOM)
    // El hilo principal de JS colapsará si parsea > 5MB de Excel masivo sincrónicamente.
    // Idealmente, esto deberia subir a una Edge Function, pero como mitigación cortafuego:
    if (file.size > 5 * 1024 * 1024) { 
        error.value = "⚠️ Archivo demasiado grande (>5MB). Por favor divídelo en varios archivos u optimiza el Excel para evitar congelar el navegador."
        return
    }

    try {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) throw new Error("El archivo está vacío o no tiene datos legibles.")

        // Normalize Data
        parsedData.value = jsonData.map(row => {
            // Flexible matching for keys (case insensitive)
            const keys = Object.keys(row)
            const getKey = (target) => keys.find(k => k.toLowerCase().includes(target))
            
            const sku = row[getKey('sku')] || row[getKey('código')] || row[getKey('codigo')] || ''
            const name = row[getKey('nombre')] || row[getKey('name')] || row[getKey('producto')] || ''
            const price = parseFloat(row[getKey('precio')] || row[getKey('price')] || 0)
            const cost = parseFloat(row[getKey('costo')] || row[getKey('cost')] || 0)
            const stock = parseInt(row[getKey('stock')] || row[getKey('cantidad')] || 0)
            const category = row[getKey('categoria')] || row[getKey('category')] || ''

            const isValid = sku && name && !isNaN(price)
            let err = ''
            if (!sku) err = 'Falta SKU'
            else if (!name) err = 'Falta Nombre'

            return {
                sku: String(sku).trim(),
                name: String(name).trim(),
                price,
                cost,
                stock,
                category,
                isValid,
                error: err
            }
        })

    } catch (e) {
        console.error(e)
        error.value = "Error al leer el archivo: " + e.message
    }
}

const handleFileSelect = (event) => {
    const file = event.target.files[0]
    processFile(file)
}

const handleDrop = (event) => {
    const file = event.dataTransfer.files[0]
    processFile(file)
}

const confirmImport = async () => {
    importing.value = true
    try {
        // Filter out invalid items just in case, though button is disabled
        const validItems = parsedData.value.filter(i => i.isValid)
        await emit('import', validItems)
        // Parent is responsible for closing or showing success
        // But we stay loading until parent finishes
    } catch (e) {
        error.value = e.message
        importing.value = false
    }
}

watch(() => props.show, (val) => {
    if(!val) reset()
})
</script>
