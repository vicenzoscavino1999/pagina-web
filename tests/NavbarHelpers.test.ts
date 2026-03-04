import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collectDarkSections, isNavbarScrolled, shouldUseDarkNavbar } from '../src/modules/navbar/contrast';
import {
    computeScrollProgress,
    normalizeHashFromHref,
    selectActiveSectionId,
} from '../src/modules/navbar/activeSection';
import { setMobileMenuState, shouldCloseMobileMenu, toggleMobileMenu } from '../src/modules/navbar/mobileMenu';

describe('navbar helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('detecta secciones oscuras y estado scrolled', () => {
        document.body.innerHTML = `
            <section id="apple-section"></section>
            <section id="stats-section"></section>
        `;

        expect(collectDarkSections()).toHaveLength(2);
        expect(isNavbarScrolled(60, 50)).toBe(true);
        expect(isNavbarScrolled(20, 50)).toBe(false);
    });

    it('calcula contraste de navbar segun interseccion visual', () => {
        const section = document.createElement('section');
        vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
            top: 20,
            bottom: 300,
            left: 0,
            right: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        expect(shouldUseDarkNavbar([section], 80)).toBe(true);
        expect(shouldUseDarkNavbar([section], 10)).toBe(false);
    });

    it('abre y cierra menu mobile y detecta clicks sobre links', () => {
        document.body.innerHTML = `
            <button id="mobile-btn"></button>
            <div id="mobile-menu" class="hidden">
                <a href="#servicios"><span id="menu-text">Servicios</span></a>
            </div>
        `;

        const button = document.getElementById('mobile-btn') as HTMLButtonElement;
        const menu = document.getElementById('mobile-menu') as HTMLElement;
        const innerTarget = document.getElementById('menu-text');

        setMobileMenuState({ button, menu }, false);
        expect(menu.classList.contains('hidden')).toBe(true);
        expect(button.getAttribute('aria-expanded')).toBe('false');

        toggleMobileMenu({ button, menu });
        expect(menu.classList.contains('hidden')).toBe(false);
        expect(button.getAttribute('aria-expanded')).toBe('true');

        expect(shouldCloseMobileMenu(innerTarget)).toBe(true);
        expect(shouldCloseMobileMenu(menu)).toBe(false);
    });

    it('ignora cambios si faltan elementos del menu mobile o el target no es un elemento', () => {
        document.body.innerHTML = `
            <button id="mobile-btn"></button>
            <div id="mobile-menu" class="hidden"></div>
        `;

        const button = document.getElementById('mobile-btn') as HTMLButtonElement;
        const menu = document.getElementById('mobile-menu') as HTMLElement;

        expect(() => setMobileMenuState({ button: null, menu }, true)).not.toThrow();
        expect(() => toggleMobileMenu({ button, menu: null })).not.toThrow();
        expect(menu.classList.contains('hidden')).toBe(true);
        expect(shouldCloseMobileMenu(null)).toBe(false);
        expect(shouldCloseMobileMenu(new EventTarget())).toBe(false);
    });

    it('normaliza hashes y calcula progreso de scroll', () => {
        expect(normalizeHashFromHref('#servicios')).toBe('servicios');
        expect(normalizeHashFromHref('https://postalexpress.demo/#coverage-section')).toBe(
            'coverage-section'
        );
        expect(normalizeHashFromHref('tel:+51996983530')).toBeNull();
        expect(normalizeHashFromHref('')).toBeNull();

        expect(computeScrollProgress(0, 2000, 1000)).toBe(0);
        expect(computeScrollProgress(500, 2000, 1000)).toBe(0.5);
        expect(computeScrollProgress(2000, 2000, 1000)).toBe(1);
        expect(computeScrollProgress(40, 800, 800)).toBe(0);
    });

    it('selecciona seccion activa por ancla visual', () => {
        const sections = [
            { id: 'hero-section', top: -80, bottom: 540 },
            { id: 'servicios', top: 540, bottom: 1180 },
            { id: 'coverage-section', top: 1180, bottom: 1760 },
        ];

        expect(selectActiveSectionId(sections, 100)).toBe('hero-section');
        expect(selectActiveSectionId(sections, 620)).toBe('servicios');
        expect(selectActiveSectionId(sections, 1900)).toBe('coverage-section');
        expect(selectActiveSectionId([], 200)).toBeNull();
    });
});
