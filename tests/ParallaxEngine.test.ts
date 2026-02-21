import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ParallaxEngine } from '@modules/ParallaxEngine';

describe('ParallaxEngine', () => {
    let element: HTMLElement;

    const mockRect = (top: number): void => {
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            top,
            height: 200,
            bottom: top + 200,
            left: 0,
            right: 100,
            width: 100,
            x: 0,
            y: top,
            toJSON: () => { },
        });
    };

    beforeEach(() => {
        document.body.innerHTML = '<div id="parallax-el"></div>';
        element = document.getElementById('parallax-el') as HTMLElement;

        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
        Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });

        mockRect(500);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('no actualiza transforms en mobile', () => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });

        const engine = new ParallaxEngine({ mobileBreakpoint: 768 });
        engine.register(element);
        engine.update(100);

        expect(element.style.getPropertyValue('--parallax-y')).toBe('');
        engine.destroy();
    });

    it('recalculate() actualiza offsetTop correctamente', () => {
        const engine = new ParallaxEngine();
        engine.register(element);

        mockRect(600);
        engine.recalculate();
        engine.update(0);

        expect(element.style.getPropertyValue('--parallax-y')).toBe('30px');
        engine.destroy();
    });

    it('destroy() limpia todas las entradas', () => {
        const engine = new ParallaxEngine();
        engine.register(element);

        engine.update(0);
        expect(element.style.getPropertyValue('--parallax-y')).toBe('15px');

        engine.destroy();
        element.style.removeProperty('--parallax-y');

        engine.update(0);
        expect(element.style.getPropertyValue('--parallax-y')).toBe('');
    });
});
