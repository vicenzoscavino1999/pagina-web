import { expect, test, type Page } from '@playwright/test';

const stabilizeVisualState = async (page: Page): Promise<void> => {
    await page.route('https://images.unsplash.com/**', (route) => route.abort());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForLoadState('domcontentloaded');

    await page.addStyleTag({
        content: `
            *, *::before, *::after {
                animation: none !important;
                transition: none !important;
                caret-color: transparent !important;
            }
        `,
    });
};

const waitForImagesIn = async (page: Page, selector: string): Promise<void> => {
    await page.locator(selector).evaluate(async (rootElement) => {
        const images = Array.from(rootElement.querySelectorAll('img'));

        const waitForSettledImage = (img: HTMLImageElement): Promise<void> =>
            new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                    return;
                }

                const done = (): void => resolve();
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
            });

        await Promise.all(
            images.map(async (img) => {
                if (img.complete && img.naturalWidth > 0) return;

                try {
                    await img.decode();
                } catch {
                    await waitForSettledImage(img);
                }
            })
        );
    });
};

test.describe('Landing Visual Regression', () => {
    test('hero layout mobile snapshot', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await stabilizeVisualState(page);
        await page.addStyleTag({
            content: '.hero-webgl-layer, .hero-canvas-layer { display: none !important; }',
        });
        await waitForImagesIn(page, '#hero-section');

        await expect(page.locator('#hero-layout')).toHaveScreenshot('hero-layout-mobile.png');
    });

    test('hero cinematic desktop snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);
        await page.addStyleTag({
            content: '.hero-webgl-layer, .hero-canvas-layer { display: none !important; }',
        });
        await waitForImagesIn(page, '#hero-section');

        await expect(page.locator('#hero-section')).toHaveScreenshot('hero-cinematic-desktop.png');
    });

    test('university features mobile snapshot', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await stabilizeVisualState(page);

        const featuresSection = page.locator('#university-features');
        await featuresSection.scrollIntoViewIfNeeded();
        await waitForImagesIn(page, '#university-features');
        await expect(featuresSection).toHaveScreenshot('university-features-mobile.png');
    });

    test('carousel mobile snapshot', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await stabilizeVisualState(page);

        const carousel = page.locator('#carousel-sticky');
        await carousel.scrollIntoViewIfNeeded();
        await expect(carousel).toHaveScreenshot('carousel-mobile.png');
    });

    test('tracking widget desktop snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);

        await expect(page.locator('#tracking-widget')).toHaveScreenshot('tracking-widget-desktop.png');
    });

    test('apple section desktop snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);

        const sceneMetrics = await page.locator('#apple-section').evaluate((element) => ({
            top: element.getBoundingClientRect().top + window.scrollY,
            height: element.clientHeight,
            viewport: window.innerHeight,
        }));

        const focusScroll = sceneMetrics.top + (sceneMetrics.height - sceneMetrics.viewport) * 0.5;

        await page.evaluate((top) => {
            window.scrollTo({ top, behavior: 'auto' });
        }, focusScroll);

        await page.waitForFunction(() => {
            const section = document.getElementById('apple-section');
            if (!section) return false;
            return parseFloat(getComputedStyle(section).getPropertyValue('--apple-overlay-opacity')) > 0.4;
        });

        await waitForImagesIn(page, '#apple-sticky-container');
        await expect(page.locator('#apple-sticky-container')).toHaveScreenshot('apple-section-desktop.png');
    });

    test('truck scene desktop snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);

        const sceneMetrics = await page.locator('#truck-scene').evaluate((element) => ({
            top: element.getBoundingClientRect().top + window.scrollY,
            height: element.clientHeight,
            viewport: window.innerHeight,
        }));

        const focusScroll = sceneMetrics.top + (sceneMetrics.height - sceneMetrics.viewport) * 0.55;

        await page.evaluate((top) => {
            window.scrollTo({ top, behavior: 'auto' });
        }, focusScroll);

        await page.waitForFunction(() => {
            const scene = document.getElementById('truck-scene');
            if (!scene) return false;
            return parseFloat(getComputedStyle(scene).getPropertyValue('--ts-road-glow-opacity')) > 0.4;
        });

        await expect(page.locator('#truck-sticky')).toHaveScreenshot('truck-scene-desktop.png');
    });

    test('services section snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);

        const servicesSection = page.locator('#servicios');
        await servicesSection.scrollIntoViewIfNeeded();
        await waitForImagesIn(page, '#servicios');
        await expect(servicesSection).toHaveScreenshot('services-section-desktop.png');
    });

    test('services hovered snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);

        const servicesSection = page.locator('#servicios');
        await servicesSection.scrollIntoViewIfNeeded();
        await waitForImagesIn(page, '#servicios');

        await page.evaluate(() => {
            const section = document.getElementById('servicios');
            const card = document.querySelector('[data-service-card]');
            if (!(section instanceof HTMLElement) || !(card instanceof HTMLElement)) {
                throw new Error('No se pudo fijar el estado visual de services');
            }

            const shiftX = 5.12;
            const shiftY = -3.12;

            section.style.setProperty('--services-accent', 'rgba(56, 189, 248, 0.24)');
            section.style.setProperty('--services-spotlight-opacity', '0.468');
            section.style.setProperty('--services-spotlight-x', '72.00%');
            section.style.setProperty('--services-spotlight-y', '18.00%');

            card.classList.add('is-interacting', 'is-active-service');
            card.style.setProperty('--svc-tilt-x', '2.08deg');
            card.style.setProperty('--svc-tilt-y', '2.88deg');
            card.style.setProperty('--svc-shift-x', `${shiftX.toFixed(2)}px`);
            card.style.setProperty('--svc-shift-y', `${shiftY.toFixed(2)}px`);
            card.style.setProperty('--svc-glow-x', '72.00%');
            card.style.setProperty('--svc-glow-y', '18.00%');

            const layers = card.querySelectorAll<HTMLElement>('[data-service-depth]');
            layers.forEach((layer) => {
                const depth = Number.parseFloat(layer.dataset['serviceDepth'] ?? '0.35');
                const depthFactor = Number.isFinite(depth) ? depth : 0.35;
                layer.style.setProperty('--svc-layer-x', `${(shiftX * depthFactor).toFixed(2)}px`);
                layer.style.setProperty('--svc-layer-y', `${(shiftY * depthFactor).toFixed(2)}px`);
            });
        });

        await expect(servicesSection).toHaveScreenshot('services-section-hovered-desktop.png');
    });

    test('flow section desktop snapshot', async ({ page }) => {
        await page.goto('/');
        await stabilizeVisualState(page);

        const sceneMetrics = await page.locator('#flow-steps').evaluate((element) => ({
            top: element.getBoundingClientRect().top + window.scrollY,
            viewport: window.innerHeight,
        }));

        const focusScroll = sceneMetrics.top - sceneMetrics.viewport * 0.3;

        await page.evaluate((top) => {
            window.scrollTo({ top, behavior: 'auto' });
        }, focusScroll);

        await page.waitForFunction(() => {
            const flow = document.getElementById('flow-steps');
            if (!flow) return false;
            return parseFloat(getComputedStyle(flow).getPropertyValue('--flow-scroll-energy')) > 0.25;
        });

        await waitForImagesIn(page, '#flow-steps');
        await expect(page.locator('#flow-steps')).toHaveScreenshot('flow-section-desktop.png');
    });

    test('flow section mobile snapshot', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await stabilizeVisualState(page);

        const sceneMetrics = await page.locator('#flow-steps').evaluate((element) => ({
            top: element.getBoundingClientRect().top + window.scrollY,
            viewport: window.innerHeight,
        }));

        const focusScroll = sceneMetrics.top - sceneMetrics.viewport * 0.22;

        await page.evaluate((top) => {
            window.scrollTo({ top, behavior: 'auto' });
        }, focusScroll);

        await page.waitForFunction(() => {
            const flow = document.getElementById('flow-steps');
            if (!flow) return false;
            return parseFloat(getComputedStyle(flow).getPropertyValue('--flow-scroll-energy')) > 0.2;
        });

        await waitForImagesIn(page, '#flow-steps');
        await expect(page.locator('#flow-steps')).toHaveScreenshot('flow-section-mobile.png');
    });

    test('mobile menu opened snapshot', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await stabilizeVisualState(page);

        await page.locator('#mobile-btn').click();
        await expect(page.locator('#mobile-menu')).toHaveScreenshot('mobile-menu-open.png');
    });
});
