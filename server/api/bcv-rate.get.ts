export default defineEventHandler(async (event) => {
    try {
        // Option 1: Try scraping direct (Unreliable on some cloud hosts due to geoblock/SSL)
        // Option 2: Use a reliable community API that scrapes BCV
        // We will use a reliable public API that mirrors BCV to ensure stability for the user's business.

        // Using pydolarvenezuela-api which is very popular and reliable
        const response = await $fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv') as any

        // Structure check (adjust based on actual API response)
        // Usually returns { monitors: { usd: { price: 36.5, ... } } }
        const rate = response?.monitors?.usd?.price || 0
        const lastUpdate = response?.monitors?.usd?.last_update || new Date().toISOString()

        if (!rate) {
            throw new Error('Rate not found in API')
        }

        return {
            rate: parseFloat(rate),
            source: 'BCV (via API)',
            last_update: lastUpdate
        }
    } catch (e: any) {
        console.error('Error fetching BCV rate:', e)
        // Fallback hardcoded (safe failover) to avoid breaking UI if API down
        return {
            rate: 270.79, // Updated Dec 15 2025 based on user input
            source: 'Fallback',
            error: e.message
        }
    }
})
