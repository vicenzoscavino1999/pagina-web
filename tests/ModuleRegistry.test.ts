import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAppModuleRegistrations } from '../src/app/moduleRegistry';
import { ParallaxEngine } from '../src/modules/ParallaxEngine';

describe('module registry', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('expone ids unicos y habilita registros segun el DOM', () => {
        document.body.innerHTML = `
            <section id="hero-section"></section>
            <nav id="navbar"></nav>
            <section id="features-carousel"></section>
            <div class="reveal"></div>
        `;

        const registrations = getAppModuleRegistrations();
        const ids = registrations.map((registration) => registration.id);

        expect(new Set(ids).size).toBe(ids.length);

        const enabledIds = registrations
            .filter((registration) => registration.isEnabled(document))
            .map((registration) => registration.id);

        expect(enabledIds).toEqual(
            expect.arrayContaining(['smooth-scroll', 'hero-effects', 'navbar', 'horizontal-carousel', 'scroll-reveal'])
        );
        expect(enabledIds).not.toContain('tracking-form');
    });

    it('ejecuta afterMount de parallax registrando cada imagen', () => {
        document.body.innerHTML = `
            <section>
                <div class="image-shell"><img class="parallax-img" /></div>
                <div class="image-shell"><img class="parallax-img" /></div>
            </section>
        `;

        const parallaxRegistration = getAppModuleRegistrations().find(
            (registration) => registration.id === 'parallax'
        );

        expect(parallaxRegistration).toBeDefined();
        if (!parallaxRegistration) {
            throw new Error('parallax registration should exist');
        }

        const module = new ParallaxEngine({ mobileBreakpoint: 0 });
        const registerSpy = vi.spyOn(module, 'register');

        parallaxRegistration.afterMount?.(module, document);

        expect(registerSpy).toHaveBeenCalledTimes(2);
        expect(registerSpy.mock.calls[0]?.[0]).toBeInstanceOf(HTMLElement);

        module.destroy();
    });

    it('omite afterMount de parallax si recibe un modulo que no es ParallaxEngine', () => {
        document.body.innerHTML = `
            <section>
                <div class="image-shell"><img class="parallax-img" /></div>
            </section>
        `;

        const parallaxRegistration = getAppModuleRegistrations().find(
            (registration) => registration.id === 'parallax'
        );

        expect(parallaxRegistration).toBeDefined();
        if (!parallaxRegistration) {
            throw new Error('parallax registration should exist');
        }

        const fakeModule = {
            destroy: vi.fn(),
            register: vi.fn(),
        };

        expect(() => parallaxRegistration.afterMount?.(fakeModule as never, document)).not.toThrow();
        expect(fakeModule.register).not.toHaveBeenCalled();
    });

    it('puede crear los modulos habilitados con un DOM consistente', () => {
        document.body.innerHTML = `
            <section id="hero-section"></section>
            <nav id="navbar"></nav>
            <button id="mobile-btn"></button>
            <div id="mobile-menu" class="hidden"><a href="#services">Services</a></div>
            <section id="servicios">
                <div id="services-grid">
                    <article data-service-card>
                        <div data-service-depth="0.4"></div>
                    </article>
                </div>
            </section>
            <div class="parallax-shell"><img class="parallax-img" /></div>
            <form id="tracking-form">
                <input id="tracking-input" type="text" />
                <button id="tracking-btn">Track</button>
            </form>
            <div id="tracking-result" class="hidden">
                <span id="result-id"></span>
                <span id="result-date"></span>
                <button id="reset-tracking-btn"></button>
            </div>
            <section id="apple-section"></section>
            <img id="apple-bg-image" />
            <section id="features-carousel"></section>
            <div id="carousel-track"><div class="carousel-slide"></div></div>
            <div class="carousel-dot"></div>
            <button id="carousel-prev"></button>
            <button id="carousel-next"></button>
            <section>
                <h2 id="flow-title"></h2>
                <div id="flow-steps"></div>
            </section>
            <section id="university-features"></section>
            <div class="feature-item"></div>
            <div class="mockup-screen"></div>
            <div id="uf-nav-label"></div>
            <button id="uf-nav-prev"></button>
            <button id="uf-nav-next"></button>
            <div class="uf-nav-dot" data-index="0"></div>
            <div id="truck-scene"></div>
            <div id="delivery-truck"></div>
            <div id="ts-progress-fill"></div>
            <div id="ts-status"></div>
            <div class="ts-waypoint"></div>
            <div id="ticker-container"></div>
            <template id="ticker-content"><div>ticker</div></template>
            <section id="stats-section"></section>
            <span class="counter" data-target="10" data-suffix="+"></span>
            <div class="reveal"></div>
        `;

        const modules = getAppModuleRegistrations()
            .filter((registration) => registration.isEnabled(document))
            .map((registration) => registration.create(document));

        expect(modules).toHaveLength(15);

        modules.forEach((module) => {
            module.destroy();
        });
    });
});
