import { beforeEach, describe, expect, it } from 'vitest';
import { ContentHydrator } from '@modules/ContentHydrator';
import { SITE_CONTENT } from '../src/content/siteContent';

describe('ContentHydrator', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <span id="logo-text"></span>
            <span id="logo-subtext"></span>
            <span id="uf-company-label"></span>
            <span id="footer-brand-name"></span>

            <img id="hero-bg">
            <img id="apple-bg-image">
            <img id="stats-bg">

            <a id="nav-services-link"></a>
            <a id="nav-tracking-link"></a>
            <a id="nav-coverage-link"></a>
            <a id="mobile-services-link"></a>
            <a id="mobile-tracking-link"></a>
            <a id="mobile-coverage-link"></a>

            <a id="nav-contract-link"></a>
            <a id="mobile-contract-link"></a>
            <a id="hero-contract-link"></a>
            <a id="contact-contract-link"></a>
            <a id="footer-contract-link"></a>
            <span id="hero-contract-text"></span>
            <span id="footer-contract-text"></span>
            <h2 id="contact-title"></h2>
            <span id="contact-subtitle-prefix"></span>

            <a id="footer-whatsapp-link"></a>
            <a id="floating-whatsapp-link"></a>
            <span id="footer-whatsapp-text"></span>
            <span id="floating-whatsapp-text"></span>

            <span id="hero-badge-text"></span>
            <span id="hero-title-main"></span>
            <span id="hero-title-sub"></span>
            <span id="hero-description"></span>
            <span id="hero-primary-cta-text"></span>

            <span id="tracking-title"></span>
            <span id="tracking-subtitle"></span>
            <input id="tracking-input">
            <span id="tracking-submit-text"></span>
            <span id="tracking-result-guide-label"></span>
            <span id="tracking-result-estimated-label"></span>
            <span id="tracking-reset-text"></span>
            <div id="tracking-timeline"></div>

            <h2 id="apple-heading"></h2>
            <p id="apple-subheading"></p>

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
            <span id="uf-mockup-chip"></span>
            <span id="uf-mockup-pickup-text"></span>
            <span id="uf-mockup-pickup-tag-one"></span>
            <span id="uf-mockup-pickup-tag-two"></span>
            <span id="uf-mockup-shield-text"></span>
            <span id="uf-mockup-shield-coverage"></span>
            <span id="uf-mockup-notif-one"></span>
            <span id="uf-mockup-notif-two"></span>
            <span id="uf-mockup-notif-three"></span>
            <span id="uf-mockup-method-one"></span>
            <span id="uf-mockup-method-two"></span>
            <span id="uf-mockup-method-three"></span>
            <span id="uf-mockup-method-four"></span>
            <span id="uf-mockup-receipt-one-label"></span>
            <span id="uf-mockup-receipt-one-value"></span>
            <span id="uf-mockup-receipt-two-label"></span>
            <span id="uf-mockup-receipt-two-value"></span>
            <span id="uf-mockup-receipt-three-label"></span>
            <span id="uf-mockup-receipt-three-value"></span>

            <span id="carousel-slide-1-label"></span>
            <h2 id="carousel-slide-1-title"></h2>
            <p id="carousel-slide-1-body"></p>
            <span id="carousel-slide-1-badge-one"></span>
            <span id="carousel-slide-1-badge-two"></span>
            <span id="carousel-slide-1-badge-three"></span>
            <span id="carousel-slide-1-phone-title"></span>
            <span id="carousel-slide-1-phone-label"></span>
            <span id="carousel-slide-1-phone-cta"></span>
            <span id="carousel-slide-2-label"></span>
            <h2 id="carousel-slide-2-title"></h2>
            <p id="carousel-slide-2-body"></p>
            <span id="carousel-slide-2-stat-one-label"></span>
            <span id="carousel-slide-2-stat-two-label"></span>
            <span id="carousel-slide-2-phone-title"></span>
            <span id="carousel-slide-2-route-one"></span>
            <span id="carousel-slide-2-route-two"></span>
            <span id="carousel-slide-2-route-three"></span>
            <span id="carousel-slide-2-eta-prefix"></span>
            <span id="carousel-slide-2-eta-value"></span>
            <span id="carousel-slide-3-label"></span>
            <h2 id="carousel-slide-3-title"></h2>
            <p id="carousel-slide-3-body"></p>
            <span id="carousel-slide-3-timer-one"></span>
            <span id="carousel-slide-3-timer-two"></span>
            <span id="carousel-slide-3-phone-title"></span>
            <span id="carousel-slide-3-delivered-message"></span>
            <span id="carousel-slide-3-delivered-time"></span>

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

            <p id="footer-intro"></p>
            <h4 id="footer-company-heading"></h4>
            <h4 id="footer-coverage-heading"></h4>
            <h4 id="footer-contracts-heading"></h4>
            <p id="footer-contracts-description"></p>
            <p id="footer-copyright"></p>
            <ul id="footer-company-list"></ul>
            <ul id="footer-coverage-list"></ul>
            <div id="footer-signoff"></div>
        `;
    });

    it('hidrata contenido clave y renderiza bloques dinamicos', () => {
        const hydrator = new ContentHydrator();
        hydrator.init();

        expect(document.getElementById('logo-text')?.textContent).toBe(SITE_CONTENT.brand.logoPrimary);
        expect(document.getElementById('hero-title-main')?.textContent).toBe(SITE_CONTENT.hero.titleMain);
        expect(document.getElementById('tracking-title')?.textContent).toBe(SITE_CONTENT.tracking.title);

        expect((document.getElementById('nav-contract-link') as HTMLAnchorElement).href).toBe(SITE_CONTENT.contact.phoneHref);
        expect((document.getElementById('footer-whatsapp-link') as HTMLAnchorElement).href).toBe(SITE_CONTENT.contact.whatsappHref);
        expect((document.getElementById('tracking-input') as HTMLInputElement).placeholder).toBe(SITE_CONTENT.tracking.inputPlaceholder);
        expect((document.getElementById('hero-bg') as HTMLImageElement).src).toContain('/media/hero-warehouse.png');

        expect(document.querySelectorAll('#tracking-timeline .timeline-item')).toHaveLength(SITE_CONTENT.tracking.timeline.length);
        expect(document.querySelectorAll('#truck-waypoints .ts-waypoint')).toHaveLength(SITE_CONTENT.truck.waypoints.length);
        expect(document.querySelectorAll('#uf-feature-list .feature-item')).toHaveLength(SITE_CONTENT.features.items.length);
        expect(document.querySelectorAll('#uf-nav-dots .uf-nav-dot')).toHaveLength(SITE_CONTENT.features.items.length);
        expect(document.querySelectorAll('#services-grid .parallax-img')).toHaveLength(SITE_CONTENT.services.cards.length);
        expect(document.querySelectorAll('#service-characteristics-list li')).toHaveLength(SITE_CONTENT.serviceCharacteristics.items.length);
        expect(document.querySelectorAll('#flow-steps .reveal')).toHaveLength(SITE_CONTENT.flow.steps.length);
        expect(document.querySelectorAll('#stats-grid .counter')).toHaveLength(SITE_CONTENT.stats.items.length);
        expect(document.querySelectorAll('#faq-list details')).toHaveLength(SITE_CONTENT.faq.items.length);
        expect(document.querySelectorAll('#footer-company-list li')).toHaveLength(SITE_CONTENT.footer.companyItems.length);
        expect(document.querySelectorAll('#footer-coverage-list li')).toHaveLength(SITE_CONTENT.footer.coverageItems.length);
        expect(document.querySelectorAll('#footer-signoff span')).toHaveLength(SITE_CONTENT.footer.signoff.length);

        expect(document.getElementById('carousel-slide-3-delivered-message')?.textContent).toBe(SITE_CONTENT.carousel.slideThree.deliveredMessage);
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
