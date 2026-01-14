import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Fetch from DolarApi
        console.log('Fetching rate from ve.dolarapi.com...')
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial')
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`)

        const data = await response.json()
        const rate = data.promedio
        const lastUpdate = data.fechaActualizacion

        if (!rate || isNaN(rate)) {
            throw new Error('Invalid rate data received')
        }

        // 2. Initialize Supabase Admin Client (Service Role)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 3. Upsert into database
        console.log(`Updating DB with Rate: ${rate}`)
        const { error } = await supabase
            .from('sys_exchange_rates')
            .upsert({
                currency_pair: 'USD-VES',
                rate: rate,
                last_update: new Date().toISOString(), // Use current time as sync time
                source: 'BCV (DolarApi)'
            }, { onConflict: 'currency_pair' })

        if (error) throw error

        return new Response(
            JSON.stringify({ success: true, rate, message: 'Exchange rate updated successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Sync Error:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
