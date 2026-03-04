import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
    testDir: './e2e',
    snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
    fullyParallel: true,
    forbidOnly: !!process.env['CI'],
    retries: process.env['CI'] ? 1 : 0,
    timeout: 45_000,
    workers: process.env['CI'] ? 2 : undefined,
    reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html']],
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            maxDiffPixelRatio: 0.03,
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    webServer: {
        command: `npm run dev -- --host 127.0.0.1 --port ${PORT} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env['CI'],
        timeout: 120_000,
    },
});
