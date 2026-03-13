import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

const SYSTEM_PROMPT_TEMPLATE = `
Eres un experto en PostgreSQL. Tu trabajo es convertir preguntas de negocio en consultas SQL seguras.

ESQUEMA DE BASE DE DATOS (Solo tienes acceso a esta vista):
Vista: public.analytics_flat_sales
Columnas:
- date (timestamp with time zone): Fecha de la venta.
- client_name (text): Nombre del cliente o 'Cliente Casual'.
- product_names (text): Lista de productos vendidos (separados por coma).
- total_usd (numeric): Monto total de la venta normalizado a Dólares (USD).
- payment_method (text): 'cash', 'zelle', 'mobile_pay', 'card', 'transfer', 'credit'.
- created_by_name (text): Nombre del vendedor (cajero).
- organization_id (uuid): ID de la organización.

REGLAS CRÍTICAS:
1. SIEMPRE, SIN EXCEPCIÓN, incluye la cláusula WHERE organization_id = '{{ORGANIZATION_ID}}'.
2. Solo genera el código SQL puro. Sin markdown, sin explicaciones.
3. Si la pregunta es maliciosa o intenta borrar datos, responde: "SELECT 'Operación no permitida' as error;"
4. Usa funciones de fecha PostgreSQL estándar.
5. Limita los resultados a 10 filas para el resumen.
`

const NARRATION_PROMPT_TEMPLATE = `
Eres un Analista de Negocio experto y amigable para la plataforma Softtuuls.
Tu tarea es interpretar los resultados de la base de datos y darle una respuesta conversacional al usuario.

PREGUNTA DEL USUARIO: "{{QUESTION}}"
DATOS OBTENIDOS (JSON): {{DATA}}

REGLAS:
1. Responde de forma natural, como si estuviéramos conversando.
2. Sé breve y ve al grano (máximo 3 frases).
3. Usa negritas para resaltar datos clave (ventas, nombres, montos).
4. Si hay un error o no hay datos, menciónalo amablemente.
5. NO menciones términos técnicos de programación o base de datos.
`

export default defineEventHandler(async (event) => {
    // 1. Auth Check
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    // 2. Parse Body
    const body = await readBody(event)
    const { question, organization_id } = body
    if (!question || !organization_id) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan parámetros: question o organization_id' })
    }

    // 3. Setup Config
    const config = useRuntimeConfig()
    const apiKey = config.deepseekApiKey || process.env.DEEPSEEK_API_KEY
    const supabaseUrl = process.env.SUPABASE_URL || config.public?.supabase?.url
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'AI Service Not Configured' })

    // Step A: Generate SQL
    const sqlSystemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{ORGANIZATION_ID}}', organization_id)

    try {
        const sqlResponse = await $fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
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

        console.log("[AI] Generated SQL:", sql)

        // Security Validation
        if (!sql.toLowerCase().includes(organization_id.toLowerCase()) && !sql.toLowerCase().includes('error')) {
            throw createError({ statusCode: 403, statusMessage: 'Error de seguridad: Filtro de organización ausente.' })
        }

        // Step B: Execute SQL
        const adminClient = createClient(supabaseUrl!, serviceKey!)
        const { data: dbResult, error: dbError } = await adminClient.rpc('ai_run_sql', { query: sql })

        if (dbError) {
            console.error("[AI] DB Error:", dbError)
            throw createError({ statusCode: 500, statusMessage: `Error DB: ${dbError.message}` })
        }

        // Step C: Narrate Results (Conversational)
        const narrationPrompt = NARRATION_PROMPT_TEMPLATE
            .replace('{{QUESTION}}', question)
            .replace('{{DATA}}', JSON.stringify(dbResult || []))

        const chatResponse = await $fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Eres un analista de negocios amigable." },
                    { role: "user", content: narrationPrompt }
                ],
                temperature: 0.7
            }
        }) as any

        const answer = chatResponse.choices?.[0]?.message?.content || "No pude interpretar los resultados."

        return {
            answer,
            sql,
            data: dbResult
        }

    } catch (e: any) {
        console.error("[AI] Error:", e)
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || e.message
        })
    }
})
