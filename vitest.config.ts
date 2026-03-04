import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom', // Simula el DOM del browser
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
        alias: {
            '@modules': resolve(__dirname, 'src/modules'),
            '@utils': resolve(__dirname, 'src/utils'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            all: true,
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.d.ts'],
            thresholds: {
                branches: 90,
                functions: 85,
                lines: 90,
                statements: 90,
            },
        },
    },
});
