import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',   // Simula el DOM del browser
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        alias: {
            '@modules': resolve(__dirname, 'src/modules'),
            '@utils': resolve(__dirname, 'src/utils'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            thresholds: {
                lines: 80,          // El build falla si baja del 80%
                functions: 80,
            },
            include: ['src/**/*.ts'],
            exclude: ['src/main.ts', 'src/vite-env.d.ts', 'src/**/*.d.ts', 'tests/**']
        },
    },
});
