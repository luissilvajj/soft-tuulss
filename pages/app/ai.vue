<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-4">
          <h1 class="text-2xl font-bold text-text-heading flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              AI Analyst
          </h1>
          <p class="mt-1 text-sm text-text-secondary ml-[52px]">Pregunta sobre tus ventas, clientes o productos y obtén datos reales al instante.</p>
      </div>

      <!-- Chat Container -->
      <div class="flex-1 bg-surface-ground overflow-hidden flex flex-col rounded-2xl border border-surface-border shadow-sm">
          <!-- Messages Area -->
          <div ref="scrollRef" class="flex-1 overflow-y-auto p-5 space-y-4">
              <!-- Empty State -->
              <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
                  <div class="text-6xl mb-4">🔮</div>
                  <h3 class="font-bold text-text-heading text-lg">Haz una pregunta a tu negocio</h3>
                  <p class="text-sm text-text-secondary mt-1 max-w-md">Pregunta en lenguaje natural y el AI Analyst consultará tus datos reales para responderte.</p>
                  
                  <!-- Quick Suggestions -->
                  <div class="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                      <button 
                          v-for="suggestion in quickSuggestions" 
                          :key="suggestion"
                          @click="useSuggestion(suggestion)"
                          class="px-3 py-2 text-xs font-medium bg-surface-subtle border border-surface-border rounded-full text-text-secondary hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer"
                      >
                          {{ suggestion }}
                      </button>
                  </div>
              </div>

              <!-- Messages -->
              <div v-for="(msg, i) in messages" :key="i" :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']">
                  <div 
                    :class="[
                        'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm', 
                        msg.role === 'user' 
                            ? 'bg-primary-600 text-white rounded-br-md' 
                            : 'bg-surface-subtle border border-surface-border text-text-body rounded-bl-md'
                    ]"
                  >
                      <div 
                        v-if="msg.text" 
                        class="prose prose-sm max-w-none dark:prose-invert"
                        :class="msg.role === 'user' ? 'text-white' : 'text-text-body'"
                        v-html="renderMarkdown(msg.text)"
                      ></div>
                      
                      <!-- SQL Preview (collapsible) -->
                      <details v-if="msg.sql" class="mt-2">
                          <summary class="text-xs cursor-pointer opacity-60 hover:opacity-100 transition-opacity">Ver consulta SQL</summary>
                          <pre class="mt-1 text-[10px] bg-gray-900 text-green-400 p-2 rounded-lg overflow-x-auto font-mono">{{ msg.sql }}</pre>
                      </details>
                      
                      <!-- Data Table -->
                      <div v-if="msg.data && msg.data.length > 0" class="mt-3 overflow-x-auto rounded-lg border border-surface-border">
                          <table class="min-w-full text-xs text-left">
                              <thead class="bg-surface-subtle font-bold text-text-secondary uppercase">
                                  <tr>
                                      <th v-for="key in getKeys(msg.data[0])" :key="key" class="px-3 py-2">{{ key }}</th>
                                  </tr>
                              </thead>
                              <tbody class="divide-y divide-surface-border bg-surface-ground">
                                  <tr v-for="(row, r) in msg.data" :key="r" class="hover:bg-surface-subtle transition-colors">
                                      <td v-for="key in getKeys(row)" :key="key" class="px-3 py-2 whitespace-nowrap font-mono text-text-heading">
                                          {{ formatValue(row[key]) }}
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                      <p v-else-if="msg.data && msg.data.length === 0" class="mt-2 text-xs italic opacity-70">
                          (Sin resultados para este periodo)
                      </p>
                  </div>
              </div>
              
              <!-- Loading Indicator -->
              <div v-if="loading" class="flex justify-start w-full">
                  <div class="bg-surface-subtle border border-surface-border rounded-2xl rounded-bl-md px-5 py-3 flex items-center gap-2">
                      <div class="flex gap-1">
                          <div class="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                          <div class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                          <div class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                      </div>
                      <span class="text-xs text-text-secondary ml-1">Analizando datos...</span>
                  </div>
              </div>
          </div>

          <!-- Input Area -->
          <div class="p-4 bg-surface-ground border-t border-surface-border">
              <form @submit.prevent="sendMessage" class="relative">
                  <input 
                    v-model="inputText" 
                    type="text" 
                    placeholder="Escribe tu pregunta (ej. ¿Cuánto vendí hoy?)..." 
                    class="w-full pl-5 pr-14 py-3.5 rounded-xl bg-surface-subtle border border-surface-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-text-heading placeholder-text-secondary"
                    :disabled="loading"
                  >
                  <button 
                    type="submit" 
                    :disabled="!inputText || loading"
                    class="absolute right-2 top-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
              </form>
              <p class="text-[10px] text-center text-text-secondary mt-2 opacity-60">
                  AI Analyst ejecuta consultas reales en tus datos. Los resultados pueden contener errores.
              </p>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from "vue-toastification"
import { marked } from 'marked'

definePageMeta({ layout: 'authenticated' })

const { organization } = useOrganization()
const client = useSupabaseClient()
const toast = useToast()

const inputText = ref('')
const loading = ref(false)
const messages = ref<{role: 'user' | 'assistant', text?: string, data?: any[], sql?: string}[]>([])
const scrollRef = ref<HTMLDivElement | null>(null)

const quickSuggestions = [
    '¿Cuánto vendí hoy?',
    '¿Cuál es mi producto más vendido?',
    'Ventas de la semana por cajero',
    'Top 5 clientes del mes',
    '¿Cuánto vendí por Zelle esta semana?',
    'Ventas del mes en dólares'
]

const scrollToBottom = () => {
    nextTick(() => {
        if (scrollRef.value) {
            scrollRef.value.scrollTop = scrollRef.value.scrollHeight
        }
    })
}

const getKeys = (obj: any) => Object.keys(obj)

const formatValue = (val: any) => {
    if (typeof val === 'number') return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return val
}

const renderMarkdown = (text: string) => {
    if (!text) return ''
    // Basic cleanup of strange symbols if any remain
    const cleanText = text.replace(/\^/g, '')
    return marked.parse(cleanText)
}

const useSuggestion = (text: string) => {
    inputText.value = text
    sendMessage()
}

const sendMessage = async () => {
    if (!inputText.value.trim() || !organization.value?.id) return
    
    const question = inputText.value
    messages.value.push({ role: 'user', text: question })
    inputText.value = ''
    loading.value = true
    scrollToBottom()

    try {
        const data = await $fetch('/api/ai/ask', {
            method: 'POST',
            body: { 
                question: question,
                organization_id: organization.value.id
            }
        }) as any

        messages.value.push({ 
            role: 'assistant', 
            text: data.answer,
            data: data.data,
            sql: data.sql
        })

    } catch (e: any) {
        console.error("[AI Chat Error]", e)
        const errorMessage = e.data?.statusMessage || e.statusMessage || e.message || 'No pude procesar tu pregunta.'
        messages.value.push({ 
            role: 'assistant', 
            text: `⚠️ Error: ${errorMessage}` 
        })
    } finally {
        loading.value = false
        scrollToBottom()
    }
}
</script>
