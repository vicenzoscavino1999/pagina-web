import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
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
