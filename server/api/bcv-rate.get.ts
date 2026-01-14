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

        if (diffHours > 24) {
            console.warn(`[WARNING] Stale Exchange Rate Detected! Old: ${diffHours.toFixed(1)} hours. Triggering emergency fetch.`)
            // Option: trigger the background function async here, but for now return fallback or old data
            // Let's try to fetch fresh to not block the user with old rates
            try {
                return await fetchFreshRateFallback()
            } catch (fallbackError) {
                console.error('Fallback failed, serving stale data as last resort.', fallbackError)
                return {
                    rate: parseFloat(data.rate),
                    source: 'DB (Stale > 24h)',
                    last_update: data.last_update,
                    warning: 'Rate is older than 24h. Please check system status.'
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
        return {
            rate: 270.00, // Safe Hardcoded Fallback
            source: 'Hardcoded Fallback (System Error)',
            error: e.message
        }
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

