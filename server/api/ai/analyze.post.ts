
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // 1. Auth Check
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const userQuery = body.query || "Genera el reporte mensual de rendimiento."

    // 2. Fetch Business Context (Reusing our internal API logic effectively)
    // We can call the other handler or just recreate logic. Calling internal API is cleaner if overhead is low.
    // For now, let's reuse the logic via a direct function call if we extracted it, but to save time, we'll hit the localhost API or simpler: 
    // Just import the logic? No, let's fetch it via $fetch to keep it decoupled.
    // Note: $fetch call to own API requires session cookie.
    // Easier strategy: Logic is simple, let's just do the aggregation here or extract it later. 
    // Actually, let's use the same aggregation logic for consistency.

    // ... (Aggregation logic similar to monthly.get.ts would go here, or we call the endpoint)
    // For MVP efficiency, we will fetch the data:
    const contextData = await $fetch('/api/reports/monthly', {
        headers: event.headers // Pass headers for auth
    }).catch(e => null)

    if (!contextData) throw createError({ statusCode: 500, statusMessage: 'Failed to aggregate data' })

    // 3. DeepSeek API Call
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'AI Service Not Configured' })

    const systemPrompt = `
    Eres un Consultor de Negocios Experto y Agudo, especializado en PyMEs (Pequeñas y Medianas Empresas).
    Tu objetivo es analizar los datos financieros y de inventario de la empresa y proveer un reporte accionable, directo y estratégico.
    
    ESTILO:
    - Profesional pero cercano.
    - No uses lenguaje genérico ("optimizar procesos"), sé específico con los datos ("El Producto X cayó 5%").
    - Usa formato Markdown (negritas, listas).
    - Si detectas stock bajo, alerta inmediatamente.
    - Si las ventas bajaron, propón 2 tácticas de marketing rápidas.

    DATOS DEL NEGOCIO (JSON):
    ${JSON.stringify(contextData)}
    `

    try {
        console.log('Sending request to DeepSeek API...')
        const response = await $fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userQuery }
                ],
                temperature: 0.7,
                max_tokens: 2000
            }
        }) as any

        return {
            analysis: response.choices[0].message.content,
            usage: response.usage
        }

    } catch (e: any) {
        console.error('DeepSeek Error Full Object:', JSON.stringify(e, null, 2))

        let msg = e.message
        if (e.response && e.response._data) {
            msg = `API Error [${e.response.status}]: ${JSON.stringify(e.response._data)}`
        }

        throw createError({
            statusCode: 502,
            statusMessage: 'DeepSeek Failed: ' + msg
        })
    }
})
