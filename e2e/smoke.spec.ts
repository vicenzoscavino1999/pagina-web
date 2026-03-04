import { expect, test } from '@playwright/test';
import { registerCoreSmokeTests } from './smoke.shared';

test.describe('Landing Smoke', () => {
    registerCoreSmokeTests();

    test('hero mueve el foco visual con el mouse de forma clara', async ({ page }) => {
        await page.goto('/');

        const hero = page.locator('#hero-section');
        await hero.hover({
            position: {
                x: 1120,
                y: 620,
            },
        });

        const heroState = await hero.evaluate((element) => {
            const styles = getComputedStyle(element);
            return {
                energy: parseFloat(styles.getPropertyValue('--hero-stage-energy')),
                pointerX: styles.getPropertyValue('--hero-pointer-x').trim(),
                pointerY: styles.getPropertyValue('--hero-pointer-y').trim(),
            };
        });

        expect(heroState.energy).toBeGreaterThan(0.5);
        expect(heroState.pointerX).not.toBe('52%');
        expect(heroState.pointerY).not.toBe('44%');
    });

    test('feature nav mobile actualiza estado y etiqueta al avanzar', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        const featuresSection = page.locator('#university-features');
        const featureNav = page.locator('#uf-feature-nav');
        const navLabel = page.locator('#uf-nav-label');
        const nextButton = page.locator('#uf-nav-next');
        const prevButton = page.locator('#uf-nav-prev');
        const activeDot = page.locator('.uf-nav-dot--active');

        await featuresSection.scrollIntoViewIfNeeded();
        await expect(featureNav).toHaveClass(/uf-nav--visible/);
        await expect(navLabel).toHaveText(/Recojo/);
        await expect(prevButton).toHaveClass(/uf-nav-arrow--disabled/);

        await nextButton.click();

        await expect(navLabel).toHaveText(/Seguridad/);
        await expect(prevButton).not.toHaveClass(/uf-nav-arrow--disabled/);
        await expect(activeDot).toHaveAttribute('data-index', '1');
    });

    test('truck scene actualiza progreso, waypoints y estado durante el scroll', async ({ page }) => {
        await page.goto('/');

        const initialStatus = await page.locator('#ts-status').innerText();
        const sceneMetrics = await page.locator('#truck-scene').evaluate((element) => ({
            top: element.getBoundingClientRect().top + window.scrollY,
            height: element.clientHeight,
            viewport: window.innerHeight,
        }));

        const midScroll = sceneMetrics.top + (sceneMetrics.height - sceneMetrics.viewport) * 0.55;
        const endScroll = sceneMetrics.top + (sceneMetrics.height - sceneMetrics.viewport) * 0.99;

        await page.evaluate((top) => {
            window.scrollTo({ top, behavior: 'auto' });
        }, midScroll);

        await page.waitForFunction(() => {
            const fill = document.getElementById('ts-progress-fill');
            const activeWaypoints = document.querySelectorAll('.ts-waypoint.wp--active').length;
            return fill?.style.width !== '' && activeWaypoints >= 2;
        });

        const midStatus = await page.locator('#ts-status').innerText();
        const midProgress = await page.locator('#ts-progress-fill').evaluate((element) => element.style.width);
        const midMood = await page.locator('#truck-scene').evaluate((element) => {
            const styles = getComputedStyle(element);
            return {
                cueOpacity: parseFloat(styles.getPropertyValue('--ts-cue-opacity')),
                overlayOpacity: parseFloat(styles.getPropertyValue('--ts-overlay-opacity')),
                roadGlowOpacity: parseFloat(styles.getPropertyValue('--ts-road-glow-opacity')),
            };
        });

        expect(midStatus).not.toBe(initialStatus);
        expect(parseFloat(midProgress)).toBeGreaterThan(40);
        expect(midMood.overlayOpacity).toBeGreaterThan(0.8);
        expect(midMood.roadGlowOpacity).toBeGreaterThan(0.4);
        expect(midMood.cueOpacity).toBeLessThan(0.4);
        await expect(page.locator('.ts-waypoint.wp--active')).toHaveCount(3);

        await page.evaluate((top) => {
            window.scrollTo({ top, behavior: 'auto' });
        }, endScroll);

        await expect(page.locator('#delivery-truck')).toHaveClass(/truck--arrived/);
        await expect(page.locator('.ts-waypoint.wp--active')).toHaveCount(4);
    });

    test('apple section intensifica overlay y revela copy al avanzar en scroll', async ({ page }) => {
        await page.goto('/');

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
            const overlayOpacity = parseFloat(getComputedStyle(section).getPropertyValue('--apple-overlay-opacity'));
            const copyOpacity = parseFloat(getComputedStyle(section).getPropertyValue('--apple-copy-opacity'));
            return overlayOpacity > 0.4 && copyOpacity > 0.5;
        });

        const appleState = await page.locator('#apple-section').evaluate((element) => {
            const styles = getComputedStyle(element);
            return {
                copyOpacity: parseFloat(styles.getPropertyValue('--apple-copy-opacity')),
                headingOpacity: parseFloat(styles.getPropertyValue('--apple-heading-opacity')),
                overlayOpacity: parseFloat(styles.getPropertyValue('--apple-overlay-opacity')),
            };
        });

        expect(appleState.overlayOpacity).toBeGreaterThan(0.4);
        expect(appleState.copyOpacity).toBeGreaterThan(0.5);
        expect(appleState.headingOpacity).toBeGreaterThan(0.6);
    });

    test('carousel mobile navega slides y actualiza controles', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        const carouselSection = page.locator('#features-carousel');
        const prevButton = page.locator('#carousel-prev');
        const nextButton = page.locator('#carousel-next');
        const activeDot = page.locator('.carousel-dot--active');

        await carouselSection.scrollIntoViewIfNeeded();
        await expect(page.locator('#slide-1')).toHaveClass(/slide--active/);
        await expect(prevButton).toHaveClass(/btn--disabled/);

        await nextButton.click();

        await expect(page.locator('#slide-2')).toHaveClass(/slide--active/);
        await expect(activeDot).toHaveAttribute('data-slide', '1');
        await expect(prevButton).not.toHaveClass(/btn--disabled/);

        await nextButton.click();

        await expect(page.locator('#slide-3')).toHaveClass(/slide--active/);
        await expect(activeDot).toHaveAttribute('data-slide', '2');
        await expect(nextButton).toHaveClass(/btn--disabled/);
    });

    test('services activa spotlight y estado interactivo al hover', async ({ page }) => {
        await page.goto('/');

        const servicesSection = page.locator('#servicios');
        const firstCard = page.locator('[data-service-card]').first();

        await servicesSection.scrollIntoViewIfNeeded();
        const cardBounds = await firstCard.boundingBox();
        if (!cardBounds) {
            throw new Error('No se pudo medir la primera service card');
        }
        await firstCard.hover({
            position: {
                x: Math.round(cardBounds.width * 0.72),
                y: Math.round(cardBounds.height * 0.28),
            },
        });

        await page.waitForFunction(() => {
            const section = document.getElementById('servicios');
            if (!section) return false;
            return parseFloat(getComputedStyle(section).getPropertyValue('--services-spotlight-opacity')) > 0.2;
        });

        const serviceState = await servicesSection.evaluate((element) => {
            const styles = getComputedStyle(element);
            return {
                accent: styles.getPropertyValue('--services-accent').trim(),
                opacity: parseFloat(styles.getPropertyValue('--services-spotlight-opacity')),
            };
        });

        expect(serviceState.opacity).toBeGreaterThan(0.2);
        expect(serviceState.accent).not.toBe('');
        await expect(firstCard).toHaveClass(/is-active-service/);
    });

    test('services responde al scroll con sweep visual y energia de escena', async ({ page }) => {
        await page.goto('/');

        const sceneMetrics = await page.locator('#servicios').evaluate((element) => ({
            top: element.getBoundingClientRect().top + window.scrollY,
            viewport: window.innerHeight,
        }));

        const focusScroll = sceneMetrics.top - sceneMetrics.viewport * 0.34;

        await page.evaluate((top) => {
            window.scrollTo({ top, behavior: 'auto' });
        }, focusScroll);

        await page.waitForFunction(() => {
            const section = document.getElementById('servicios');
            if (!section) return false;
            const styles = getComputedStyle(section);
            return parseFloat(styles.getPropertyValue('--services-scroll-energy')) > 0.25;
        });

        const servicesState = await page.locator('#servicios').evaluate((element) => {
            const styles = getComputedStyle(element);
            return {
                energy: parseFloat(styles.getPropertyValue('--services-scroll-energy')),
                gridShift: styles.getPropertyValue('--services-grid-shift').trim(),
                progress: parseFloat(styles.getPropertyValue('--services-scroll-progress')),
                sweepX: styles.getPropertyValue('--services-scroll-sweep-x').trim(),
            };
        });

        expect(servicesState.energy).toBeGreaterThan(0.25);
        expect(servicesState.progress).toBeGreaterThan(0.2);
        expect(servicesState.gridShift).not.toBe('18.00px');
        expect(servicesState.sweepX).not.toBe('48.00%');
    });

    test('flow responde al scroll con conector y profundidad visual', async ({ page }) => {
        await page.goto('/');

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

        const flowState = await page.locator('#flow-steps').evaluate((element) => {
            const styles = getComputedStyle(element);
            return {
                cardShift: styles.getPropertyValue('--flow-card-shift').trim(),
                connectorFill: parseFloat(styles.getPropertyValue('--flow-connector-fill')),
                energy: parseFloat(styles.getPropertyValue('--flow-scroll-energy')),
                sweepX: styles.getPropertyValue('--flow-sweep-x').trim(),
            };
        });

        expect(flowState.energy).toBeGreaterThan(0.25);
        expect(flowState.connectorFill).toBeGreaterThan(0.2);
        expect(flowState.cardShift).not.toBe('20.00px');
        expect(flowState.sweepX).not.toBe('18.00%');
    });
});
