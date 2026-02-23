import { expect, test } from '@playwright/test';

test.describe('Landing Smoke', () => {
    test('renderiza branding y secciones principales', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('#logo-text')).toHaveText('POSTAL');
        await expect(page.locator('#hero-title-main')).toHaveText('Logística corporativa.');
        await expect(page.locator('#services-grid .parallax-img')).toHaveCount(3);
    });

    test('mantiene el contrato DOM de elementos criticos', async ({ page }) => {
        await page.goto('/');

        const criticalSelectors = [
            '#navbar',
            '#hero-section',
            '#hero-title-main',
            '#tracking-form',
            '#tracking-input',
            '#tracking-btn',
            '#tracking-result',
            '#servicios',
            '#services-grid',
            '#features-carousel',
            '#contacto',
            '#floating-whatsapp-link',
        ];

        for (const selector of criticalSelectors) {
            await expect(page.locator(selector), `Missing critical selector: ${selector}`).toHaveCount(1);
        }
    });

    test('links de contratos y whatsapp usan datos oficiales', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('#nav-contract-link')).toHaveAttribute('href', 'tel:+51996983530');
        await expect(page.locator('#hero-contract-link')).toHaveAttribute('href', 'tel:+51996983530');
        await expect(page.locator('#floating-whatsapp-link')).toHaveAttribute('href', 'https://wa.me/51996983530');
    });

    test('tracking sanitiza input y muestra resultado', async ({ page }) => {
        await page.goto('/');

        await page.locator('#tracking-input').fill('pe-2024-001$%');
        await page.locator('#tracking-btn').click();

        await expect(page.locator('#tracking-result')).toBeVisible();
        await expect(page.locator('#result-id')).toHaveText('PE-2024-001');
    });

    test('menu mobile se despliega al tocar boton', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        const menu = page.locator('#mobile-menu');
        await expect(menu).toBeHidden();

        await page.locator('#mobile-btn').click();
        await expect(menu).toBeVisible();
    });
});
