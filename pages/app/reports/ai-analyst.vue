
<template>
  <div class="h-[calc(100vh-80px)] flex flex-col p-6 rounded-2xl relative overflow-hidden">
    <!-- Background Accents -->
    <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-dark)] to-[var(--color-bg-subtle)] z-0"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent-blue)]/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 flex flex-col h-full max-w-5xl mx-auto w-full">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-extrabold text-[var(--color-white)] tracking-tight flex items-center gap-3">
                    <span class="bg-[var(--color-accent-blue)]/20 p-2 rounded-lg text-[var(--color-accent-blue)]">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </span>
                    AI Business Analyst
                </h1>
                <p class="text-[var(--color-text-secondary)] mt-1">Tu consultor inteligente disponible 24/7. Analiza tendencias y optimiza tu negocio.</p>
            </div>
            <div class="hidden md:block">
               <span class="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  DeepSeek v3
               </span>
            </div>
        </div>

        <!-- Chat / Report Area -->
        <div class="flex-1 glass-panel overflow-hidden flex flex-col relative rounded-2xl border border-[var(--color-border-subtle)]">
            
            <!-- Empty State -->
            <div v-if="!messages.length && !loading" class="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div class="w-24 h-24 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
                     <svg class="w-12 h-12 text-[var(--color-accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-[var(--color-white)] mb-2">Generar Reporte Mensual</h3>
                <p class="text-[var(--color-text-secondary)] max-w-md mx-auto mb-8">
                    La IA analizará tus ventas, inventario y clientes de los últimos 30 días para darte recomendaciones estratégicas.
                </p>
                <button @click="generateInitialReport" class="bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    Analizar mi Negocio
                </button>
            </div>

            <!-- Messages List -->
            <div v-else class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref="messagesContainer">
                <div v-for="(msg, idx) in messages" :key="idx" 
                     :class="['flex gap-4 max-w-3xl', msg.role === 'user' ? 'ml-auto flex-row-reverse' : '']">
                    
                    <!-- Avatar -->
                    <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg', 
                                  msg.role === 'user' ? 'bg-[var(--color-bg-subtle)]' : 'bg-[var(--color-accent-blue)]']">
                        <span v-if="msg.role === 'user'">👤</span>
                        <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>

                    <!-- Bubble -->
                    <div :class="['p-4 rounded-2xl shadow-sm text-sm leading-relaxed',
                                  msg.role === 'user' 
                                    ? 'bg-[var(--color-surface-glass)] text-[var(--color-white)] rounded-tr-none border border-[var(--color-border-subtle)]' 
                                    : 'bg-[var(--color-bg-subtle)]/50 text-[var(--color-text-primary)] rounded-tl-none border border-[var(--color-border-subtle)] markdown-body']">
                        
                         <!-- Configured to render Markdown roughly -->
                        <div v-if="msg.role === 'assistant'" v-html="renderMarkdown(msg.content)"></div>
                        <div v-else>{{ msg.content }}</div>
                    </div>
                </div>

                 <!-- Loading Indicator -->
                <div v-if="loading" class="flex gap-4 max-w-3xl animate-pulse">
                     <div class="w-10 h-10 rounded-full bg-[var(--color-accent-blue)]/50 flex flex-shrink-0"></div>
                     <div class="bg-[var(--color-bg-subtle)]/30 p-4 rounded-2xl rounded-tl-none flex-1 space-y-2">
                        <div class="h-2 bg-[var(--color-border-subtle)] rounded w-3/4"></div>
                        <div class="h-2 bg-[var(--color-border-subtle)] rounded w-1/2"></div>
                     </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="p-4 bg-[var(--color-bg-dark)]/80 border-t border-[var(--color-border-subtle)] backdrop-blur-md">
                <form @submit.prevent="sendMessage" class="flex gap-3 max-w-4xl mx-auto relative">
                    <input 
                        v-model="inputQuery" 
                        type="text" 
                        placeholder="Haz una pregunta sobre tu reporte (Ej: ¿Cómo puedo mejorar las ventas?)" 
                        class="flex-1 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-white)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] placeholder-gray-500 transition-all font-medium"
                        :disabled="loading"
                    />
                    <button type="submit" :disabled="loading || !inputQuery.trim()" 
                        class="bg-[var(--color-accent-blue)] text-white px-5 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                    
                    <div v-if="!messages.length" class="absolute -top-10 left-0 right-0 text-center text-xs text-[var(--color-accent-blue)] font-bold animate-bounce hidden md:block">
                        ¡Inicia generando tu primer reporte! 🚀
                    </div>
                </form>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { marked } from 'marked' // We might need to install this or use a simple formatter

definePageMeta({
    layout: 'dashboard'
})

const messages = ref([])
const inputQuery = ref('')
const loading = ref(false)
const messagesContainer = ref(null)

// Auto scroll to bottom
watch(messages.value, () => {
    nextTick(() => {
        if(messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
})

const renderMarkdown = (text) => {
    // Simple unsafe render for demo, ideally sanitize used in prod
    // Using simple replacement for bold/lists if marked not available, but let's assume valid HTML from backend
    // Or we can simple use a basic parser if marked isn't installed.
    // Let's use a very basic formatter to avoid installing libs if possible, or assume user will install.
    // For now: basic text.
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
               .replace(/\n/g, '<br>')
               .replace(/- (.*?)(<br>|$)/g, '• $1<br>')
}

async function generateInitialReport() {
    await sendMessage("Genera el reporte mensual con análisis de ventas y recomendaciones.")
}

async function sendMessage(textOverride = null) {
    const text = textOverride || inputQuery.value
    if (!text || loading.value) return

    // Add user message
    messages.value.push({ role: 'user', content: text })
    inputQuery.value = ''
    loading.value = true

    try {
        const data = await $fetch('/api/ai/analyze', {
            method: 'POST',
            body: { query: text }
        })

        if (data.analysis) {
            messages.value.push({ role: 'assistant', content: data.analysis })
        }
    } catch (e) {
        console.error('Frontend Error:', e)
        // Try to extract readable message
        const serverMsg = e.data?.statusMessage || e.data?.message || e.message || 'Unknown Error'
        messages.value.push({ 
            role: 'assistant', 
            content: `⚠️ **Error de Diagnóstico**:
            
            ${serverMsg}
            
            Raw: ${JSON.stringify(e.data || e, null, 2)}` 
        })
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.markdown-body :deep(b) {
    color: var(--color-white);
    font-weight: 800;
}
.markdown-body :deep(h3) {
    font-size: 1.1em;
    font-weight: bold;
    color: var(--color-accent-blue);
    margin-top: 1em;
    margin-bottom: 0.5em;
}
</style>
