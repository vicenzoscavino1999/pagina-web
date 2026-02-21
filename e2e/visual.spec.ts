import { expect, test, type Page } from '@playwright/test';

const stabilizeVisualState = async (page: Page): Promise<void> => {
    await page.route('https://images.unsplash.com/**', (route) => route.abort());

    await page.addStyleTag({
        content: `
            *, *::before, *::after {
                animation: none !important;
                transition: none !important;
                caret-color: transparent !important;
            }
            img {
                visibility: hidden !important;
            }
        `,
    });
};

test.describe('Landing Visual Regression', () => {
    test('tracking widget desktop snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);

        await expect(page.locator('#tracking-widget')).toHaveScreenshot('tracking-widget-desktop.png');
    });

    test('services section snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);

        const servicesSection = page.locator('#servicios');
        await servicesSection.scrollIntoViewIfNeeded();
        await expect(servicesSection).toHaveScreenshot('services-section-desktop.png');
    });

    test('mobile menu opened snapshot', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await stabilizeVisualState(page);

        await page.locator('#mobile-btn').click();
        await expect(page.locator('#mobile-menu')).toHaveScreenshot('mobile-menu-open.png');
    });
});
