/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Manual/Programmatic control via 'dark' class
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
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
            },
            colors: {
                // Semantic Palette
                primary: {
                    DEFAULT: '#eab308', // Yellow-500
                    50: '#fefce8',
                    100: '#fef9c3',
                    200: '#fef08a',
                    300: '#fde047',
                    400: '#facc15',
                    500: '#eab308',
                    600: '#ca8a04',
                    700: '#a16207',
                    800: '#854d0e',
                    900: '#713f12',
                    950: '#422006',
                },
                surface: {
                    ground: 'var(--color-surface-ground)',
                    section: 'var(--color-surface-section)', 
                    subtle: 'var(--color-surface-subtle)', 
                    border: 'var(--color-surface-border)', 
                },
                status: {
                    success: '#10b981', // Emerald-500
                    warning: '#f59e0b', // Amber-500
                    error: '#ef4444', // Red-500
                    info: '#3b82f6', // Blue-500
                },
                bg: {
                    dark: '#0f172a',
                    subtle: '#1e293b', 
                },
                text: {
                    heading: 'var(--color-text-heading)', 
                    body: 'var(--color-text-body)', 
                    secondary: 'var(--color-text-secondary)', 
                    inverse: 'var(--color-text-inverse)',
                }
            },
        },
    },
    plugins: [],
}
