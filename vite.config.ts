import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    root: '.',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icons/*.svg', 'icons/*.png'],
            manifest: {
                name: 'GlobalLogistics — Envíos Universitarios',
                short_name: 'GlobalLogistics',
                description: 'Envíos rápidos desde tu campus universitario. UPC, UPN, UTEC y más.',
                theme_color: '#0284c7',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait-primary',
                start_url: '/',
                lang: 'es',
                icons: [
                    {
                        src: 'icons/icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any',
                    },
                    {
                        src: 'icons/icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'maskable',
                    },
                ],
                categories: ['logistics', 'shopping', 'utilities'],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'google-fonts-stylesheets' },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/images\.unsplash\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'unsplash-images',
                            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/cdnjs\.cloudflare\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'cdnjs-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        outDir: 'dist',
        target: 'es2022',
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
        },
    },
    resolve: {
        alias: {
            '@modules': resolve(__dirname, 'src/modules'),
            '@utils': resolve(__dirname, 'src/utils'),
        },
    },
});
