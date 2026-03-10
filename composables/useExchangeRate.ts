export const useExchangeRate = () => {
    // 1. Singleton Global State for Exchange Rate
    // Using 'bcv_rate' as requested for clarity and isolation
    const rate = useState<number>('bcv_rate', () => 0)
    const loading = useState<boolean>('bcv_loading', () => false)

    // Track last update to avoid spamming if needed, though the requirement implies robust fetching
    const lastUpdated = useState<number>('bcv_updated', () => 0)

    const fetchLatestRate = async () => {
        // Establecemos un tiempo de vida (TTL) de 5 minutos
        const TTL = 5 * 60 * 1000
        if (rate.value > 0 && Date.now() - lastUpdated.value < TTL) {
            return // Skip ya que el valor en caché aún es fresco
        }

        loading.value = true
        try {
            // Use useFetch which handles SSR/Client transport cleanly
            const { data, error } = await useFetch('/api/bcv-rate')

            if (error.value) {
                console.error('Error fetching BCV rate:', error.value)
                return
            }

            if (data.value) {
                // Defensive parsing: check for 'rate' or 'price' or directly the number
                // Based on previous files, typical response was { rate: 123.45 }
                const val = data.value as any
                const newRate = Number(val.rate || val.price || val)

                if (!isNaN(newRate) && newRate > 0) {
                    rate.value = newRate
                    lastUpdated.value = Date.now()
                }
            }
        } catch (e) {
            console.error('Exception fetching BCV rate:', e)
        } finally {
            loading.value = false
        }
    }

    // Auto-load si el valor no existe o si ya superó el TTL
    const TTL = 5 * 60 * 1000
    if (rate.value === 0 || Date.now() - lastUpdated.value >= TTL) {
        // Run unawaited to not block setup, or await if critical. 
        // User pattern suggests just calling it.
        fetchLatestRate()
    }

    return {
        rate,
        loading,
        fetchLatestRate
    }
}
