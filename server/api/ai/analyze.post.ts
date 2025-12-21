import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // 1. Auth Check
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const userQuery = body.query || "Genera el reporte mensual de rendimiento."

    // 2. Fetch Business Context (Direct DB Access to avoid HTTP loop issues)
    const config = useRuntimeConfig()
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    const supabaseUrl = process.env.SUPABASE_URL

    if (!serviceKey || !supabaseUrl) throw createError({ statusCode: 500, statusMessage: 'Server Config Missing' })

    const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get Org ID (Robust Lookup)
    // 0. Init Clients
    const client = await serverSupabaseClient(event)

    // Get Org ID (Robust Lookup)
    let orgId = null

    console.log(`[AI Analyst] Starting Org Lookup for User: ${user.id}`)

    // Strategy 1: Check Members (Standard)
    const { data: memberData, error: memberError } = await adminClient
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (memberData) {
        orgId = memberData.organization_id
        console.log(`[AI Analyst] Strategy 1 (Members) Success: ${orgId}`)
    } else {
        console.log(`[AI Analyst] Strategy 1 (Members) Failed. Error: ${memberError?.message || 'No data'}`)
    }

    // Strategy 2: Check Ownership REMOVED (Column does not exist in schema)
    // Proceeding to Strategy 3

    // Strategy 3: RPC (Legacy/Sidebar Logic)
    if (!orgId) {
        try {
            const { data: rpcData, error: rpcError } = await client.rpc('get_my_main_organization')
            if (rpcData && rpcData.id) {
                orgId = rpcData.id
                console.log(`[AI Analyst] Strategy 3 (RPC) Success: ${orgId}`)
            } else {
                console.log(`[AI Analyst] Strategy 3 (RPC) Failed. Data: ${JSON.stringify(rpcData)}, Error: ${rpcError?.message}`)
            }
        } catch (rpcEx) {
            console.error('[AI Analyst] Strategy 3 (RPC) Exception:', rpcEx)
        }
    }

    if (!orgId) {
        console.error(`Org Analysis Failed: User ${user.id} has no org. Strategies 1, 2, & 3 failed.`)
        throw createError({
            statusCode: 403,
            statusMessage: 'No Organization Found for Analysis',
            data: {
                userId: user.id,
                email: user.email,
                strategies_tried: ['members', 'ownership', 'rpc']
            }
        })
    }

    // Fetch Metrics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Sales (Last 30 Days)
    const { data: salesData } = await adminClient
        .from('transactions')
        .select('amount')
        .eq('organization_id', orgId)
        .eq('type', 'sale')
        .gte('date', thirtyDaysAgo.toISOString())

    const totalRevenue = salesData?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0


    // Low Stock
    const { data: lowStockData } = await adminClient
        .from('products')
        .select('name, stock')
        .eq('organization_id', orgId)
        .lt('stock', 10)
        .limit(5)

    const contextData = {
        summary: `Revenue (Last 30d): $${totalRevenue.toFixed(2)}`,
        low_stock: lowStockData || [],
        note: "Data fetched directly via Service Key"
    }
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
