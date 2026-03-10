import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event)

        // 1. Query the cached rate from Supabase
        const { data, error } = await client
            .from('sys_exchange_rates')
            .select('rate, last_update')
            .eq('currency_pair', 'USD-VES')
            .single()

        // 2. Error handling (Table empty or DB error)
        if (error || !data) {
            console.error('DB Cache Miss:', error)
            // Fallback: Try to fetch fresh if DB is empty (Cold Start)
            // In a production app, verify if we want this or just a hardcoded safe value
            return await fetchFreshRateFallback()
        }

        // 3. Stale Data Check (Safety Net)
        const lastUpdate = new Date(data.last_update)
        const now = new Date()
        const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

        // [FIX] Lowered TTL to 1 hour to ensure fresh daily rates
        if (diffHours > 1) {
            console.log(`[INFO] Exchange Rate Stale (${diffHours.toFixed(2)}h). Fetching fresh...`)
            try {
                // Fetch fresh
                const freshData = await fetchFreshRateFallback()

                // [FIX] Persist to DB so other clients benefit
                // Fire and forget update to not block response too much, or await it.
                // Better await to ensure consistency.
                const { error: updateError } = await client
                    .from('sys_exchange_rates')
                    .upsert({
                        currency_pair: 'USD-VES',
                        rate: freshData.rate,
                        last_update: freshData.last_update
                    }, { onConflict: 'currency_pair' })

                if (updateError) console.error('Failed to update rate cache:', updateError)

                return freshData
            } catch (fallbackError) {
                console.error('Fallback failed, serving stale data.', fallbackError)
                return {
                    rate: parseFloat(data.rate),
                    source: 'DB (Stale)',
                    last_update: data.last_update,
                    warning: 'Rate update failed. Using cached.'
                }
            }
        }

        // 4. Return Valid Cached Data
        return {
            rate: parseFloat(data.rate),
            source: 'Database Cache',
            last_update: data.last_update
        }

    } catch (e: any) {
        console.error('Critical Error in BCV Endpoint:', e)
        // [FIX - FASE 3] NUNCA retornar un fallback estático (ej. 33.50 ó 336.46) ante fallos totales.
        // Provoca pérdidas millonarias irremediables si el país sufre hiper-devaluación y la API está caída.
        // Es preferible frenar el TPV (Caja) o forzar la intervención humana, lanzando un 503.
        throw createError({
            statusCode: 503,
            statusMessage: 'Servicio BCV Inaccesible. Verifique su red local o ingrese la tasa manualmente.',
            data: { originalError: e.message }
        })
    }
})

// Emergency Fallback Function (Direct API Call)
// Only used if DB is empty or data is dangerously stale
async function fetchFreshRateFallback() {
    console.log('Executing Emergency External Fetch...')
    const response = await $fetch('https://ve.dolarapi.com/v1/dolares/oficial') as any
    const rate = response?.promedio
    if (!rate) throw new Error('API Fallback failed')

    return {
        rate: parseFloat(rate),
        source: 'API Fallback (Emergency)',
        last_update: new Date().toISOString()
    }
}

