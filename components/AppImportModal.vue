<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <!-- Backdrop -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div 
        class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal Panel -->
      <div class="relative inline-block align-bottom bg-[var(--color-bg-dark)] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-[var(--color-border-subtle)]">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/50 flex justify-between items-center">
            <div>
                <h3 class="text-xl font-bold text-[var(--color-white)]" id="modal-title">Importar Productos</h3>
                <p class="text-sm text-[var(--color-text-secondary)] mt-1">Carga masiva desde Excel (.xlsx)</p>
            </div>
            <button @click="$emit('close')" class="text-[var(--color-text-secondary)] hover:text-[var(--color-white)] transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
            
            <!-- Step 1: File Upload -->
            <div v-if="!parsedData.length" 
                class="border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl p-10 text-center hover:border-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/5 transition-all cursor-pointer group"
                @drop.prevent="handleDrop"
                @dragover.prevent
                @click="$refs.fileInput.click()"
            >
                <input ref="fileInput" type="file" class="hidden" accept=".xlsx, .xls, .csv" @change="handleFileSelect" />
                
                <div class="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <svg class="w-8 h-8 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <h4 class="text-lg font-bold text-[var(--color-white)] group-hover:text-[var(--color-accent-blue)] transition-colors">Sube o arrastra tu archivo aquí</h4>
                <p class="text-[var(--color-text-secondary)] text-sm mt-2">Soporta .xlsx, .xls</p>
                <div class="mt-6 text-xs text-[var(--color-text-secondary)]">
                    <p class="font-bold">Columnas esperadas:</p>
                    <code>SKU, Nombre, Precio, Costo, Stock, Categoría</code>
                </div>
            </div>

            <!-- Step 2: Preview -->
            <div v-else>
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-bold text-[var(--color-white)] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
                            {{ parsedData.length }} productos detectados
                        </span>
                        <div v-if="duplicates.length > 0" class="text-sm font-bold text-[var(--color-white)] bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">
                             {{ duplicates.length }} actualizaciones (SKU existente)
                        </div>
                    </div>
                    <button @click="reset" class="text-sm text-[var(--color-accent-blue)] hover:underline font-bold">Cambiar archivo</button>
                </div>

                <div class="overflow-x-auto border border-[var(--color-border-subtle)] rounded-xl max-h-[400px]">
                    <table class="min-w-full divide-y divide-[var(--color-border-subtle)] text-left">
                        <thead class="bg-[var(--color-bg-dark)] sticky top-0 z-10">
                            <tr>
                                <th class="px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase">SKU</th>
                                <th class="px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase">Nombre</th>
                                <th class="px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase text-right">Precio</th>
                                <th class="px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase text-center">Stock</th>
                                <th class="px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30">
                            <tr v-for="(row, idx) in previewData" :key="idx" class="hover:bg-[var(--color-bg-dark)] transition-colors">
                                <td class="px-4 py-2 text-sm text-[var(--color-text-secondary)] font-mono">{{ row.sku }}</td>
                                <td class="px-4 py-2 text-sm font-bold text-[var(--color-white)] truncate max-w-[200px]">{{ row.name }}</td>
                                <td class="px-4 py-2 text-sm text-[var(--color-white)] text-right">${{ row.price }}</td>
                                <td class="px-4 py-2 text-sm text-[var(--color-white)] text-center">{{ row.stock }}</td>
                                <td class="px-4 py-2 text-xs">
                                    <span v-if="row.isValid" class="text-emerald-500 font-bold">Válido</span>
                                    <span v-else class="text-red-500 font-bold" :title="row.error">Error: {{ row.error }}</span>
                                </td>
                            </tr>
                             <!-- Show More Row -->
                            <tr v-if="parsedData.length > 50">
                                <td colspan="5" class="px-4 py-3 text-center text-xs text-[var(--color-text-secondary)] italic">
                                    ... y {{ parsedData.length - 50 }} productos más
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Error Display -->
            <div v-if="error" class="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center gap-2">
                 <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 {{ error }}
            </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-[var(--color-bg-subtle)]/50 border-t border-[var(--color-border-subtle)] flex justify-end gap-3">
             <button @click="$emit('close')" type="button" class="px-6 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border-subtle)] rounded-xl hover:bg-[var(--color-bg-dark)] focus:outline-none transition-colors">
                Cancelar
            </button>
            <button 
                v-if="parsedData.length > 0"
                @click="confirmImport" 
                type="button" 
                class="btn btn-primary shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                :disabled="importing || invalidCount > 0"
            >
                <svg v-if="importing" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span v-else>Importar {{ parsedData.length }} Productos</span>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'

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
