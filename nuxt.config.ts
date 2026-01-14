// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@pinia-plugin-persistedstate/nuxt'
  ],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Softtuuls POS',
      short_name: 'Softtuuls',
      theme_color: '#000000',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'landscape',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/rest/v1/products'),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'products-cache',
            expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 }
          }
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/rest/v1/clients'),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'clients-cache',
            expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 }
          }
        }
      ]
    }
  },
  css: [
    '~/assets/css/velo-theme.css'
  ],
  supabase: {
    redirect: false,
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: true // Always secure for modern browsers/vercel
    }
  },
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY
  },
  ssr: false
})
