import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NavbarController } from '../src/modules/NavbarController';
import { EventBus } from '../src/utils/events';

function createRect(top: number, bottom: number): DOMRect {
    return {
        top,
        bottom,
        left: 0,
        right: 0,
        width: 100,
        height: Math.max(bottom - top, 0),
        x: 0,
        y: top,
        toJSON: () => '',
    } as DOMRect;
}

describe('NavbarController', () => {
    beforeEach(() => {
        EventBus.clear();
        document.body.innerHTML = `
            <nav id="navbar">
                <a id="nav-hero-link" class="nav-link" href="#hero-section"><span></span></a>
                <a id="nav-services-link" class="nav-link" href="#servicios"><span></span></a>
                <a id="nav-coverage-link" class="nav-link" href="#coverage-section"><span></span></a>
                <a id="nav-contract-link" href="tel:+51996983530">Contratos</a>
                <button id="mobile-btn"></button>
                <div id="mobile-menu" class="hidden">
                    <a id="mobile-hero-link" href="#hero-section">Hero</a>
                    <a id="mobile-services-link" href="#servicios">Servicios</a>
                </div>
            </nav>
            <section id="hero-section"></section>
            <section id="servicios"></section>
            <section id="coverage-section"></section>
        `;
    });

    afterEach(() => {
        EventBus.clear();
    });

    it('actualiza progreso, estado scrolled y link activo segun el scroll', () => {
        const navbar = document.getElementById('navbar') as HTMLElement;
        const hero = document.getElementById('hero-section') as HTMLElement;
        const services = document.getElementById('servicios') as HTMLElement;
        const coverage = document.getElementById('coverage-section') as HTMLElement;

        Object.defineProperty(navbar, 'offsetHeight', { value: 80, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });

        let heroRect = createRect(-40, 420);
        let servicesRect = createRect(420, 1080);
        let coverageRect = createRect(1080, 1680);

        hero.getBoundingClientRect = (): DOMRect => heroRect;
        services.getBoundingClientRect = (): DOMRect => servicesRect;
        coverage.getBoundingClientRect = (): DOMRect => coverageRect;

        const controller = new NavbarController(navbar, { scrollThreshold: 50 });

        const navHeroLink = document.getElementById('nav-hero-link') as HTMLAnchorElement;
        const navServicesLink = document.getElementById('nav-services-link') as HTMLAnchorElement;
        const mobileHeroLink = document.getElementById('mobile-hero-link') as HTMLAnchorElement;
        const mobileServicesLink = document.getElementById('mobile-services-link') as HTMLAnchorElement;

        expect(navbar.classList.contains('nav-scrolled')).toBe(false);
        expect(navHeroLink.classList.contains('nav-link-active')).toBe(true);
        expect(mobileHeroLink.getAttribute('aria-current')).toBe('page');

        heroRect = createRect(-600, -80);
        servicesRect = createRect(-80, 600);
        coverageRect = createRect(600, 1260);
        controller.handleScroll(700);

        expect(navbar.classList.contains('nav-scrolled')).toBe(true);
        expect(navbar.style.getPropertyValue('--nav-scroll-progress')).toBe('0.7000');
        expect(navServicesLink.classList.contains('nav-link-active')).toBe(true);
        expect(navHeroLink.classList.contains('nav-link-active')).toBe(false);
        expect(mobileServicesLink.getAttribute('aria-current')).toBe('page');

        controller.destroy();
        expect(navbar.style.getPropertyValue('--nav-scroll-progress')).toBe('');
        expect(navServicesLink.classList.contains('nav-link-active')).toBe(false);
    });

    it('abre/cierra menu mobile y resize desktop fuerza cierre', () => {
        const navbar = document.getElementById('navbar') as HTMLElement;
        const mobileButton = document.getElementById('mobile-btn') as HTMLButtonElement;
        const mobileMenu = document.getElementById('mobile-menu') as HTMLElement;

        const controller = new NavbarController(navbar);

        expect(mobileButton.getAttribute('aria-expanded')).toBe('false');
        mobileButton.click();
        expect(mobileButton.getAttribute('aria-expanded')).toBe('true');
        expect(mobileMenu.classList.contains('hidden')).toBe(false);

        EventBus.emit('resize', { width: 1024, height: 768 });
        expect(mobileButton.getAttribute('aria-expanded')).toBe('false');
        expect(mobileMenu.classList.contains('hidden')).toBe(true);

        controller.destroy();
    });
});
