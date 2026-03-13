import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

const SYSTEM_PROMPT_TEMPLATE = `
Eres Sofia, una analista experta en PostgreSQL para Softtuuls. Tu trabajo es convertir preguntas de negocio en consultas SQL seguras.

ESQUEMA DE BASE DE DATOS (Solo tienes acceso a esta vista):
Vista: public.analytics_flat_sales
Columnas:
- date (timestamp): Fecha de la venta.
- client_name (text): Nombre del cliente o 'Cliente Casual'.
- product_names (text): Lista de productos vendidos.
- total_usd (numeric): Monto total en DÓLARES (Para dinero).
- total_items (numeric): Cantidad total de UNIDADES/VENTAS (Para conteos).
- payment_method (text): 'cash', 'zelle', 'mobile_pay', 'card', 'transfer', 'credit'.
- created_by_name (text): Nombre del cajero.
- organization_id (uuid): ID de la organización.

CONTEXTO DE CHAT:
{{HISTORY}}

REGLAS CRÍTICAS:
1. SIEMPRE incluye WHERE organization_id = '{{ORGANIZATION_ID}}'.
2. Si la pregunta es conversacional (ej. "¿por qué dijiste eso?") y no necesita datos nuevos, responde: "SKIP_SQL".
3. Solo genera el código SQL puro sin markdown o la palabra "SKIP_SQL".
4. Usa total_usd para montos de dinero y total_items para cantidad de productos/ventas.
5. Limita los resultados a 10 filas.
`

const NARRATION_PROMPT_TEMPLATE = `
Eres Sofia, la Analista de Negocio inteligente y amigable de Softtuuls.
Tu tarea es interpretar los resultados y conversar con el usuario.

HISTORIAL:
{{HISTORY}}

PREGUNTA ACTUAL: "{{QUESTION}}"
DATOS RECIÉN OBTENIDOS (JSON): {{DATA}}

REGLAS:
1. Responde de forma natural y empática. Llama al usuario por su nombre si lo sabes.
2. Si hubo una confusión previa, aclárala amablemente usando los datos actuales.
3. Sé breve (máximo 3 frases). Usa negritas de **Markdown**.
4. Diferencia claramente entre "Ventas/Unidades" y "Dólares/Ingresos".
5. NO menciones términos técnicos de base de datos.
`

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const { question, organization_id, history = [] } = body
    if (!question || !organization_id) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan parámetros' })
    }

    const config = useRuntimeConfig()
    const apiKey = config.deepseekApiKey || process.env.DEEPSEEK_API_KEY
    const supabaseUrl = process.env.SUPABASE_URL || config.public?.supabase?.url
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'Sofia no está configurada' })

    // Build History String
    const historyStr = history.map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Sofia'}: ${m.text}`).join('\n')

    // Step 1: Generate SQL (or decide to skip)
    const sqlSystemPrompt = SYSTEM_PROMPT_TEMPLATE
        .replace('{{ORGANIZATION_ID}}', organization_id)
        .replace('{{HISTORY}}', historyStr)

    try {
        const sqlResponse = await $fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: {
                model: "deepseek-coder",
                messages: [
                    { role: "system", content: sqlSystemPrompt },
                    { role: "user", content: question }
                ],
                temperature: 0.1
            }
        }) as any

        let sql = sqlResponse.choices?.[0]?.message?.content || ''
        sql = sql.replace(/```sql/g, '').replace(/```/g, '').replace(/;/g, '').trim()

        console.log("[Sofia] Generated SQL:", sql)

        let dbResult = []
        let finalSql = sql

        if (sql !== 'SKIP_SQL') {
            // Security Vault (Digital Vault)
            const lowerSql = sql.toLowerCase()
            if (!lowerSql.startsWith('select')) throw createError({ statusCode: 403, statusMessage: 'Solo consultas SELECT' })
            
            const forbidden = ['drop', 'delete', 'update', 'insert', 'alter', 'truncate', 'grant', 'revoke', 'create', 'upsert']
            if (forbidden.some(word => lowerSql.includes(word + ' '))) throw createError({ statusCode: 403, statusMessage: 'Comando no permitido' })

            if (!lowerSql.includes(organization_id.toLowerCase())) {
                throw createError({ statusCode: 403, statusMessage: 'Filtro de seguridad obligatorio' })
            }

            // Execute
            const adminClient = createClient(supabaseUrl!, serviceKey!)
            const { data, error } = await adminClient.rpc('ai_run_sql', { query: sql })
            if (error) throw createError({ statusCode: 500, statusMessage: error.message })
            dbResult = data
        } else {
            console.log("[Sofia] Skipping SQL, purely conversational.")
            finalSql = ""
        }

        // Step 2: Narrate
        const narrationPrompt = NARRATION_PROMPT_TEMPLATE
            .replace('{{HISTORY}}', historyStr)
            .replace('{{QUESTION}}', question)
            .replace('{{DATA}}', JSON.stringify(dbResult || []))

        const chatResponse = await $fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Eres Sofia, una analista de negocios amigable." },
                    { role: "user", content: narrationPrompt }
                ],
                temperature: 0.7
            }
        }) as any

        const answer = chatResponse.choices?.[0]?.message?.content || "Lo siento, no pude procesar eso."

        return {
            answer,
            sql: finalSql,
            data: dbResult
        }

    } catch (e: any) {
        console.error("[Sofia] Error:", e)
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || e.message
        })
    }
})
