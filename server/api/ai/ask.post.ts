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
1. SIEMPRE filtra por organization_id = '{{ORGANIZATION_ID}}'. ¡Es obligatorio!
2. Solo genera el código SQL puro. Sin markdown, sin explicaciones.
3. Si la pregunta no se puede responder con esta tabla, responde: "SELECT 'No puedo responder eso con los datos actuales' as error;"
4. Usa funciones de fecha PostgreSQL estándar (now(), interval, to_char).
5. Limita los resultados a 20 filas si no se especifica otra cosa.
6. Para "ventas de hoy", usa: date >= current_date
7. Para "ventas de la semana", usa: date >= date_trunc('week', current_date)
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
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'AI Service Not Configured' })
    if (!supabaseUrl || !serviceKey) throw createError({ statusCode: 500, statusMessage: 'Supabase Config Missing' })

    // 4. Prepare Prompt
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{ORGANIZATION_ID}}', organization_id)

    try {
        // 5. Call DeepSeek
        const aiResponse = await $fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: {
                model: "deepseek-coder",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                temperature: 0.1,
                max_tokens: 500
            }
        }) as any

        let generatedSql = aiResponse.choices?.[0]?.message?.content || ''
        
        // Clean up SQL
        generatedSql = generatedSql.replace(/```sql/g, '').replace(/```/g, '').replace(/;/g, '').trim()

        console.log("[AI] Generated SQL:", generatedSql)

        // 6. Security Validation
        if (!generatedSql.toLowerCase().includes(organization_id.toLowerCase())) {
            throw createError({ statusCode: 403, statusMessage: 'Error de seguridad: Filtro de organización ausente.' })
        }

        // 7. Execute SQL via Admin Client (using the safe RPC)
        const adminClient = createClient(supabaseUrl, serviceKey)
        const { data: result, error: dbError } = await adminClient.rpc('ai_run_sql', { query: generatedSql })

        if (dbError) {
            console.error("[AI] DB Error:", dbError)
            throw createError({ statusCode: 500, statusMessage: `Error de base de datos: ${dbError.message}` })
        }

        return {
            answer: "Consulta ejecutada.",
            sql: generatedSql,
            data: result
        }

    } catch (e: any) {
        console.error("[AI] Error:", e)
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || e.message
        })
    }
})
