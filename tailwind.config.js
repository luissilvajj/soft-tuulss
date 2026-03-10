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
                    DEFAULT: '#4F46E5', // Indigo-600
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
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
