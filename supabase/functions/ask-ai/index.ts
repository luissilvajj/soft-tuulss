
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// DeepSeek API Config
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

// System Prompt (Embedded for Edge Function speed/reliability)
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

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { question, organization_id } = await req.json()
        if (!question || !organization_id) throw new Error("Pregunta o ID de organización faltante")

        // 1. Prepare Prompt
        const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{ORGANIZATION_ID}}', organization_id)

        // 2. Call DeepSeek API
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`
            },
            body: JSON.stringify({
                model: "deepseek-coder", // or deepseek-chat
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                temperature: 0.1,
                max_tokens: 500
            })
        })

        if (!response.ok) {
            throw new Error(`DeepSeek API Error: ${response.statusText}`)
        }

        const aiData = await response.json()
        let generatedSql = aiData.choices?.[0]?.message?.content || ''

        // Clean up SQL
        generatedSql = generatedSql.replace(/```sql/g, '').replace(/```/g, '').trim()

        console.log("AI Generated SQL:", generatedSql)

        // 3. Security Validation (Second Layer)
        if (!generatedSql.includes(organization_id)) {
            throw new Error("Error de seguridad: La IA generó una consulta insegura (Falta filtro de organización).")
        }

        // 4. Execute SQL via Safe RPC provided by Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Call the SECURITY DEFINER function that switches to 'ai_readonly' role
        const { data: result, error: dbError } = await supabaseAdmin.rpc('ai_run_sql', { query: generatedSql })

        if (dbError) throw dbError

        return new Response(JSON.stringify({
            answer: "Consulta generada exitosamente.",
            sql: generatedSql,
            data: result
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
