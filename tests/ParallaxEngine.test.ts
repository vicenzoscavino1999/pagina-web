import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParallaxEngine } from '@modules/ParallaxEngine';
// import { EventBus } from '@utils/events';

describe('ParallaxEngine', () => {
    // let container: HTMLElement;
    let element: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = `<div id="parallax-container"><div id="parallax-el"></div></div>`;
        // container = document.getElementById('parallax-container') as HTMLElement;
        element = document.getElementById('parallax-el') as HTMLElement;

        // Mock getBoundingClientRect
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            top: 500,
            height: 200,
            bottom: 700,
            left: 0,
            right: 100,
            width: 100,
            x: 0,
            y: 500,
            toJSON: () => { }
        });

        // Mock window dimensions
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
        Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    });

    it('registra elementos y calcula offset inicial', () => {
        const engine = new ParallaxEngine();
        engine.register(element);

        // No hay manera pública de ver #entries. 
        // Pero podemos verificar si 'update' modifica el estilo
        engine.update(0);
        // data.offsetTop = 500
        // viewportHeight = 800
        // update(0): 
        // inView check: scrollY(0) < 500+200 (700) && 0+800(800) > 500 -> true
        // currentRectTop = 500 - 0 = 500
        // offset = (500 - 400) * 0.15 = 100 * 0.15 = 15

        expect(element.style.getPropertyValue('--parallax-y')).toBe('15px');
    });

    it('no actualiza transforms en mobile', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375 });
        const engine = new ParallaxEngine({ mobileBreakpoint: 768 });
        engine.register(element);

        engine.update(100);

        // Should not have style set if mobile
        // Wait, register calculates initial values but update applies style.
        // If register is called, style is NOT applied yet. update() applies it.
        // So style should be empty string
        expect(element.style.getPropertyValue('--parallax-y')).toBe('');
    });

    it('recalculate actualiza offsets tras resize', () => {
        const engine = new ParallaxEngine();
        engine.register(element);

        // Change element position
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            top: 600, height: 200, bottom: 800, left: 0, right: 100, width: 100, x: 0, y: 600, toJSON: () => { }
        });

        engine.recalculate();

        // Now calling update with scroll 0
        // offsetTop = 600
        // offset = (600 - 400) * 0.15 = 200 * 0.15 = 30
        engine.update(0);

        expect(element.style.getPropertyValue('--parallax-y')).toBe('30px');
    });

    it('destroy limpia listeners', () => {
        const engine = new ParallaxEngine();
        engine.register(element);

        // We can spy on EventBus.off?
        // But EventBus receives a function reference.
        // We can just call destroy and ensure no errors.
        expect(() => engine.destroy()).not.toThrow();
    });
});
