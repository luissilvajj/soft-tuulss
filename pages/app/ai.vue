<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      <div class="mb-4">
          <h1 class="text-3xl font-bold tracking-tight text-gradient">Oráculo AI</h1>
          <p class="text-sm text-[var(--color-text-secondary)]">Pregunta sobre tus ventas y obtén datos reales.</p>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 glass-panel overflow-hidden flex flex-col relative rounded-2xl border border-[var(--color-border-subtle)]">
          <div ref="scrollRef" class="flex-1 overflow-y-auto p-4 space-y-4">
              <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <div class="text-6xl mb-4">🔮</div>
                  <h3 class="font-bold">Haz una pregunta a tu negocio</h3>
                  <p class="text-sm">Ejemplos: "¿Cuánto vendí hoy?", "¿Qué producto se vende más?", "Ventas por cajero esta semana"</p>
              </div>

              <div v-for="(msg, i) in messages" :key="i" :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']">
                  <div 
                    :class="[
                        'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm', 
                        msg.role === 'user' 
                            ? 'bg-[var(--color-accent-blue)] text-white' 
                            : 'bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]'
                    ]"
                  >
                      <p v-if="msg.text" class="whitespace-pre-wrap">{{ msg.text }}</p>
                      
                      <!-- Data Table Render -->
                      <div v-if="msg.data && msg.data.length > 0" class="mt-3 overflow-x-auto rounded-lg border border-white/10">
                          <table class="min-w-full text-xs text-left">
                              <thead class="bg-black/10 font-bold">
                                  <tr>
                                      <th v-for="key in getKeys(msg.data[0])" :key="key" class="px-2 py-1 uppercase">{{ key }}</th>
                                  </tr>
                              </thead>
                              <tbody class="divide-y divide-white/10">
                                  <tr v-for="(row, r) in msg.data" :key="r">
                                      <td v-for="key in getKeys(row)" :key="key" class="px-2 py-1 whitespace-nowrap font-mono">
                                          {{ formatValue(row[key]) }}
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                      <p v-else-if="msg.data && msg.data.length === 0" class="mt-2 text-xs italic opacity-70">
                          (Sin resultados)
                      </p>
                  </div>
              </div>
              
              <div v-if="loading" class="flex justify-start w-full">
                  <div class="bg-[var(--color-bg-subtle)] rounded-2xl px-4 py-3 flex gap-1">
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
              </div>
          </div>

          <!-- Input Area -->
          <div class="p-4 bg-[var(--color-bg-dark)] border-t border-[var(--color-border-subtle)]">
              <form @submit.prevent="sendMessage" class="relative">
                  <input 
                    v-model="inputText" 
                    type="text" 
                    placeholder="Escribe tu pregunta..." 
                    class="w-full pl-5 pr-12 py-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] focus:ring-2 focus:ring-[var(--color-accent-blue)] outline-none transition-all placeholder-[var(--color-text-secondary)]/50 text-[var(--color-text-primary)]"
                    :disabled="loading"
                  >
                  <button 
                    type="submit" 
                    :disabled="!inputText || loading"
                    class="absolute right-2 top-2 p-1.5 bg-[var(--color-accent-blue)] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
              </form>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { useToast } from "vue-toastification"

definePageMeta({ layout: 'dashboard' })

const { organization } = useOrganization()
const client = useSupabaseClient()
const toast = useToast()

const inputText = ref('')
const loading = ref(false)
const messages = ref<{role: 'user' | 'assistant', text?: string, data?: any[]}[]>([])
const scrollRef = ref<HTMLDivElement | null>(null)

const scrollToBottom = () => {
    nextTick(() => {
        if (scrollRef.value) {
            scrollRef.value.scrollTop = scrollRef.value.scrollHeight
        }
    })
}

const getKeys = (obj: any) => Object.keys(obj)

const formatValue = (val: any) => {
    if (typeof val === 'number') return val.toLocaleString('en-US')
    return val
}

const sendMessage = async () => {
    if (!inputText.value.trim() || !organization.value?.id) return
    
    const question = inputText.value
    messages.value.push({ role: 'user', text: question })
    inputText.value = ''
    loading.value = true
    scrollToBottom()

    try {
        const { data, error } = await client.functions.invoke('ask-ai', {
            body: { 
                question: question,
                organization_id: organization.value.id
            }
        })

        if (error) throw error
        if (data.error) throw new Error(data.error)

        messages.value.push({ 
            role: 'assistant', 
            text: data.data ? 'Aquí están los datos encontrados:' : 'No encontré información relevante.',
            data: data.data 
        })

    } catch (e: any) {
        console.error(e)
        // toast.error('Error del Oráculo: ' + e.message)
        messages.value.push({ role: 'assistant', text: `Error: ${e.message}` })
    } finally {
        loading.value = false
        scrollToBottom()
    }
}
</script>
