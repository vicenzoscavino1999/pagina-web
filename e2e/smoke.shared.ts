import { expect, test } from '@playwright/test';
import { CRITICAL_DOM_SELECTORS } from '../src/app/domContracts';

export function registerCoreSmokeTests(): void {
    test('renderiza branding y secciones principales', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('#skip-to-content')).toHaveAttribute('href', '#main-content');
        await expect(page.locator('#main-content')).toHaveCount(1);
        await expect(page.locator('#site-logo')).toBeVisible();
        await expect(page.locator('#site-logo')).toHaveAttribute('alt', 'Postal Express SAC Logo');
        await expect(page.locator('#hero-title-main')).toHaveText(/Log/);
        await expect(page.locator('#hero-bg-avif-source')).toHaveAttribute('srcset', /hero-warehouse-640\.avif/);
        await expect(page.locator('#apple-bg-webp-source')).toHaveAttribute('srcset', /furgoneta-hero-1280\.webp/);
        await expect(page.locator('#services-grid .parallax-img')).toHaveCount(3);
        await expect(page.locator('#services-grid picture source[type="image/avif"]').first()).toHaveAttribute(
            'srcset',
            /docs-cinematic-320\.avif/
        );
        await expect(page.locator('#tracking-result')).toHaveAttribute('role', 'status');
        await expect(page.locator('#tracking-result')).toHaveAttribute('aria-live', 'polite');
    });

    test('mantiene el contrato DOM de elementos criticos', async ({ page }) => {
        await page.goto('/');

        for (const selector of CRITICAL_DOM_SELECTORS) {
            await expect(page.locator(selector), `Missing critical selector: ${selector}`).toHaveCount(1);
        }
    });

    test('links de contratos y whatsapp usan datos oficiales', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('#nav-contract-link')).toHaveAttribute('href', 'tel:+51996983530');
        await expect(page.locator('#hero-contract-link')).toHaveAttribute('href', 'tel:+51996983530');
        await expect(page.locator('#floating-whatsapp-link')).toHaveAttribute('href', 'https://wa.me/51996983530');
        await expect(page.locator('#mobile-quick-whatsapp-link')).toHaveAttribute(
            'href',
            'https://wa.me/51996983530'
        );
    });

    test('navbar navega a servicios, tracking y cobertura sin desalinear el layout', async ({ page }) => {
        await page.goto('/');

        const navHeight = await page
            .locator('#navbar')
            .evaluate((element) => element.getBoundingClientRect().height);

        await page.locator('#nav-services-link').click();
        await page.waitForFunction(
            ({ height }) => {
                const target = document.getElementById('servicios');
                if (!target) return false;
                const top = target.getBoundingClientRect().top;
                return top >= height - 20 && top <= height + 48;
            },
            { height: navHeight }
        );

        await page.locator('#nav-coverage-link').click();
        await page.waitForFunction(
            ({ height }) => {
                const target = document.getElementById('coverage-section');
                if (!target) return false;
                const top = target.getBoundingClientRect().top;
                return top >= -height && top <= window.innerHeight * 0.45;
            },
            { height: navHeight }
        );

        await page.locator('#nav-tracking-link').click();
        await page.waitForFunction(
            ({ height }) => {
                const hero = document.getElementById('hero-section');
                const widget = document.getElementById('tracking-widget');
                if (!hero || !widget) return false;

                const heroTop = hero.getBoundingClientRect().top;
                const widgetRect = widget.getBoundingClientRect();
                const widgetVisibleHeight =
                    Math.min(widgetRect.bottom, window.innerHeight) - Math.max(widgetRect.top, 0);

                return heroTop >= -8 && heroTop <= height + 56 && widgetVisibleHeight >= widgetRect.height * 0.45;
            },
            { height: navHeight }
        );
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

    test('quickbar mobile ofrece accesos de tracking y whatsapp', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        const quickbar = page.locator('#mobile-quickbar');
        await expect(quickbar).toBeVisible();
        await expect(page.locator('#mobile-quick-track-link')).toHaveAttribute('href', '#hero-section');
        await expect(page.locator('#mobile-quick-track-text')).toHaveText('Tracking');
        await expect(page.locator('#mobile-quick-whatsapp-link')).toHaveAttribute(
            'href',
            'https://wa.me/51996983530'
        );
        await expect(page.locator('#mobile-quick-chat-text')).toHaveText(/WhatsApp/);
    });
}
