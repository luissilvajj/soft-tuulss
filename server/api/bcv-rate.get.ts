export default defineEventHandler(async (event) => {
    try {
        // Option 1: Try scraping direct (Unreliable on some cloud hosts due to geoblock/SSL)
        // Option 2: Use a reliable community API that scrapes BCV
        // We will use a reliable public API that mirrors BCV to ensure stability for the user's business.

        // Using ve.dolarapi.com (Reliable and free)
        const response = await $fetch('https://ve.dolarapi.com/v1/dolares/oficial') as any

        // Structure check: { Average: 270.79, ... } -> actually { promedio: 270.79 }
        const rate = response?.promedio || 0
        const lastUpdate = response?.fechaActualizacion || new Date().toISOString()

        if (!rate) {
            throw new Error('Rate not found in API')
        }

        return {
            rate: parseFloat(rate),
            source: 'BCV (DolarApi)',
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
