/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'media', // Auto-switch based on system preference
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            colors: {
                // Brand Colors based on "Soft Tuuls" description and Velo Code screenshots
                brand: {
                    yellow: '#fbbf24', // Amber-400 equivalent, warm gold/yellow
                    dark: '#0f172a',   // Slate-900, deep professional blue-black
                    blue: '#3b82f6',   // Standard vibrant blue for accents
                    black: '#020617',  // Slate-950, absolute dark
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
