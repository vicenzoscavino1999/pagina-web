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
            all: false,
            include: [
                'src/app/App.ts',
                'src/utils/events.ts',
                'src/modules/ContentHydrator.ts',
                'src/modules/TrackingForm.ts',
                'src/modules/ParallaxEngine.ts',
            ],
            thresholds: {
                lines: 80, // El build falla si baja del 80%
                functions: 80,
            },
        },
    },
});
