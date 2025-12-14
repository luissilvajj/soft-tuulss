export default defineEventHandler((event) => {
    const config = useRuntimeConfig()

    // Check key presence (obfuscated)
    const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY
    const serviceKeyStatus = serviceKey
        ? `Present (${serviceKey.substring(0, 5)}...)`
        : 'MISSING'

    return {
        environment: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
        supabase_service_key_status: serviceKeyStatus,
        // Check if other keys exist
        has_supabase_url: !!process.env.SUPABASE_URL,
        runtime_config_keys: Object.keys(config)
    }
})
