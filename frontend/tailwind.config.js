/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Opella Color Palette
                opella: {
                    dark: '#042B0B',
                    light: '#F7EFE6',
                    'dark-hover': '#063618',
                    'light-hover': '#FFFDF9',
                },
                medical: {
                    red: '#ef4444',
                    green: '#10b981',
                    blue: '#3b82f6',
                    purple: '#8b5cf6',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-in-right': 'slideInRight 0.5s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
            },
            boxShadow: {
                'opella': '0 4px 6px -1px rgba(4, 43, 11, 0.1), 0 2px 4px -1px rgba(4, 43, 11, 0.06)',
            },
        },
    },
    plugins: [],
}
