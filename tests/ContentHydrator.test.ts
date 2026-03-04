import { beforeEach, describe, expect, it } from 'vitest';
import { ContentHydrator } from '@modules/ContentHydrator';
import { SITE_CONTENT } from '../src/content/siteContent';

describe('ContentHydrator', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <span id="uf-company-label"></span>

            <picture>
                <source id="hero-bg-avif-source" type="image/avif">
                <source id="hero-bg-webp-source" type="image/webp">
                <img id="hero-bg">
            </picture>
            <picture>
                <source id="apple-bg-avif-source" type="image/avif">
                <source id="apple-bg-webp-source" type="image/webp">
                <img id="apple-bg-image">
            </picture>
            <img id="stats-bg">

            <a id="nav-services-link"></a>
            <a id="nav-tracking-link"></a>
            <a id="nav-coverage-link"></a>
            <a id="mobile-services-link"></a>
            <a id="mobile-tracking-link"></a>
            <a id="mobile-coverage-link"></a>

            <a id="nav-contract-link"></a>
            <a id="mobile-contract-link"></a>
            <a id="contact-contract-link"></a>
            <h2 id="contact-title"></h2>
            <span id="contact-subtitle-prefix"></span>

            <a id="floating-whatsapp-link"></a>
            <span id="floating-whatsapp-text"></span>

            <div id="hero-layout">
                <div id="hero-copy"></div>
            </div>

            <div id="tracking-widget"></div>

            <div id="apple-copy"></div>

            <div id="ts-status"></div>
            <h2 id="truck-headline"></h2>
            <p id="truck-subheading"></p>
            <span id="truck-origin-label"></span>
            <span id="truck-destination-label"></span>
            <span id="truck-scroll-cue-text"></span>
            <div id="truck-waypoints"></div>

            <h2 id="uf-title"></h2>
            <div id="uf-nav-label"></div>
            <div id="uf-feature-list"></div>
            <div id="uf-nav-dots"></div>
            <div id="uf-mockup-screens"></div>

            <div id="carousel-track"></div>
            <div id="carousel-dots"></div>

            <span id="services-eyebrow"></span>
            <span id="services-title"></span>
            <div id="services-grid"></div>
            <h3 id="service-characteristics-title"></h3>
            <ul id="service-characteristics-list"></ul>

            <h2 id="flow-title"></h2>
            <div id="flow-steps"></div>

            <div id="stats-grid"></div>

            <div id="faq-list"></div>
            <template id="ticker-content"><div></div></template>

            <div id="footer-content"></div>
        `;
    });

    it('hidrata contenido clave y renderiza bloques dinamicos', () => {
        const hydrator = new ContentHydrator();
        hydrator.init();

        expect(document.getElementById('uf-company-label')?.textContent).toBe(SITE_CONTENT.brand.legalName);
        expect(document.getElementById('hero-title-main')?.textContent).toBe(SITE_CONTENT.hero.titleMain);
        expect(document.getElementById('tracking-title')?.textContent).toBe(SITE_CONTENT.tracking.title);
        expect(document.getElementById('tracking-result')?.getAttribute('role')).toBe('status');
        expect(document.getElementById('tracking-result')?.getAttribute('aria-live')).toBe('polite');
        expect(document.getElementById('tracking-result')?.getAttribute('aria-atomic')).toBe('true');

        expect((document.getElementById('nav-contract-link') as HTMLAnchorElement).href).toBe(SITE_CONTENT.contact.phoneHref);
        expect((document.getElementById('hero-contract-link') as HTMLAnchorElement).href).toBe(SITE_CONTENT.contact.phoneHref);
        expect((document.getElementById('footer-whatsapp-link') as HTMLAnchorElement).href).toBe(SITE_CONTENT.contact.whatsappHref);
        expect((document.getElementById('tracking-input') as HTMLInputElement).placeholder).toBe(SITE_CONTENT.tracking.inputPlaceholder);
        expect((document.getElementById('hero-bg') as HTMLImageElement).src).toContain(
            SITE_CONTENT.media.heroBackgroundSrc
        );
        expect(document.getElementById('hero-bg-avif-source')?.getAttribute('srcset')).toContain('/media/optimized/hero-warehouse-640.avif');
        expect(document.getElementById('hero-bg-webp-source')?.getAttribute('srcset')).toContain('/media/optimized/hero-warehouse-960.webp');
        expect(document.getElementById('apple-bg-avif-source')?.getAttribute('srcset')).toContain(
            '/media/optimized/furgoneta-hero-1920.avif'
        );
        expect(document.getElementById('apple-bg-webp-source')?.getAttribute('srcset')).toContain(
            '/media/optimized/furgoneta-hero-1280.webp'
        );
        expect(document.getElementById('apple-heading')?.innerHTML.replace(/\s+/g, ' ').trim()).toBe(
            SITE_CONTENT.apple.headingHtml
        );

        expect(document.querySelectorAll('#hero-copy [data-magnetic]')).toHaveLength(2);
        expect(document.querySelectorAll('#tracking-timeline .timeline-item')).toHaveLength(SITE_CONTENT.tracking.timeline.length);
        expect(document.querySelectorAll('#truck-waypoints .ts-waypoint')).toHaveLength(SITE_CONTENT.truck.waypoints.length);
        expect(document.querySelectorAll('#uf-feature-list .feature-item')).toHaveLength(SITE_CONTENT.features.items.length);
        expect(document.querySelectorAll('#uf-nav-dots .uf-nav-dot')).toHaveLength(SITE_CONTENT.features.items.length);
        expect(document.querySelector('#uf-nav-dots .uf-nav-dot')?.getAttribute('role')).toBe('tab');
        expect(document.querySelector('#uf-nav-dots .uf-nav-dot')?.getAttribute('aria-selected')).toBe('true');
        expect(document.querySelectorAll('#uf-mockup-screens .mockup-screen')).toHaveLength(4);
        expect(document.querySelectorAll('#carousel-track .carousel-slide')).toHaveLength(3);
        expect(document.querySelectorAll('#carousel-dots .carousel-dot')).toHaveLength(3);
        expect(document.getElementById('slide-1')?.getAttribute('role')).toBe('tabpanel');
        expect(document.getElementById('slide-1')?.getAttribute('aria-labelledby')).toBe('carousel-tab-1');
        expect(document.getElementById('carousel-tab-1')?.getAttribute('aria-controls')).toBe('slide-1');
        expect(document.getElementById('carousel-tab-1')?.getAttribute('role')).toBe('tab');
        expect(document.querySelectorAll('#services-grid .parallax-img')).toHaveLength(SITE_CONTENT.services.cards.length);
        expect(document.querySelector('#services-grid picture source[type="image/avif"]')?.getAttribute('srcset')).toContain('/media/optimized/docs-cinematic-320.avif');
        expect(document.querySelector('#services-grid picture source[type="image/webp"]')?.getAttribute('srcset')).toContain('/media/optimized/docs-cinematic-640.webp');
        expect(document.querySelectorAll('#service-characteristics-list li')).toHaveLength(SITE_CONTENT.serviceCharacteristics.items.length);
        expect(document.querySelectorAll('#flow-steps .reveal')).toHaveLength(SITE_CONTENT.flow.steps.length);
        expect(document.querySelectorAll('#stats-grid .counter')).toHaveLength(SITE_CONTENT.stats.items.length);
        expect(document.querySelectorAll('#faq-list details')).toHaveLength(SITE_CONTENT.faq.items.length);
        expect(document.querySelectorAll('#footer-company-list li')).toHaveLength(SITE_CONTENT.footer.companyItems.length);
        expect(document.querySelectorAll('#footer-coverage-list li')).toHaveLength(SITE_CONTENT.footer.coverageItems.length);
        expect(document.querySelectorAll('#footer-signoff span')).toHaveLength(SITE_CONTENT.footer.signoff.length);

        expect(document.getElementById('carousel-slide-3-delivered-message')?.textContent).toBe(SITE_CONTENT.carousel.slideThree.deliveredMessage);
        expect(document.getElementById('uf-mockup-chip')?.textContent).toBe(SITE_CONTENT.features.mockup.coverageChip);
        expect(document.getElementById('footer-contracts-heading')?.textContent).toBe(SITE_CONTENT.footer.contractsHeading);

        const tickerTemplate = document.getElementById('ticker-content') as HTMLTemplateElement;
        const firstTickerItem = SITE_CONTENT.ticker.items[0];
        expect(firstTickerItem).toBeDefined();
        if (!firstTickerItem) {
            throw new Error('ticker items should not be empty');
        }
        expect(tickerTemplate.innerHTML).toContain(firstTickerItem.label);
    });

    it('no falla si faltan nodos en el DOM', () => {
        document.body.innerHTML = '';
        const hydrator = new ContentHydrator();
        expect(() => hydrator.init()).not.toThrow();
    });
});
