import type { Config } from 'tailwindcss';

export default {
    content: [
        './index.html',
        './src/**/*.{ts,js}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                accent: {
                    500: '#f97316',
                    600: '#ea580c',
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
