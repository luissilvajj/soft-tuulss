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
                    ground: '#ffffff',
                    section: '#f8fafc', // Slate-50
                    subtle: '#f1f5f9', // Slate-100
                    border: '#e2e8f0', // Slate-200
                },
                status: {
                    success: '#10b981', // Emerald-500
                    warning: '#f59e0b', // Amber-500
                    error: '#ef4444', // Red-500
                    info: '#3b82f6', // Blue-500
                },
                // Semantic Aliases (to replace ghost vars)
                bg: {
                    dark: '#0f172a', // Slate-900
                    subtle: '#1e293b', // Slate-800
                },
                text: {
                    heading: '#1e293b', // Slate-800
                    body: '#475569', // Slate-600
                    secondary: '#64748b', // Slate-500
                    inverse: '#ffffff',
                }
            },
        },
    },
    plugins: [],
}
