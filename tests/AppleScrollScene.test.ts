import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppleScrollScene } from '../src/modules/AppleScrollScene';
import { EventBus } from '../src/utils/events';

describe('AppleScrollScene', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section id="apple-section">
                <div id="apple-copy">
                    <h2 id="apple-heading"></h2>
                    <p id="apple-subheading"></p>
                </div>
            </section>
            <img id="apple-bg-image">
        `;

        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
        EventBus.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        EventBus.clear();
    });

    it('aplica estado visual al recibir scroll en desktop', () => {
        const section = document.getElementById('apple-section') as HTMLElement;
        Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 2600 });
        vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
            top: -720,
            bottom: 1880,
            left: 0,
            right: 1200,
            width: 1200,
            height: 2600,
            x: 0,
            y: -720,
            toJSON: () => '',
        } as DOMRect);

        const scene = new AppleScrollScene();
        EventBus.emit('scroll', { delta: 30, direction: 'down', y: 720 });

        expect(parseFloat(section.style.getPropertyValue('--apple-overlay-opacity'))).toBeGreaterThan(0.4);
        expect(parseFloat(section.style.getPropertyValue('--apple-copy-opacity'))).toBeGreaterThan(0.5);
        expect(document.getElementById('apple-heading')?.classList.contains('apple-text-visible')).toBe(true);

        scene.destroy();
    });

    it('resetea estilos al destruir y omite updates en mobile', () => {
        const section = document.getElementById('apple-section') as HTMLElement;
        Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 2600 });
        vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
            top: -720,
            bottom: 1880,
            left: 0,
            right: 1200,
            width: 1200,
            height: 2600,
            x: 0,
            y: -720,
            toJSON: () => '',
        } as DOMRect);

        const scene = new AppleScrollScene({ mobileBreakpoint: 768 });
        EventBus.emit('scroll', { delta: 30, direction: 'down', y: 720 });
        expect(section.style.getPropertyValue('--apple-overlay-opacity')).not.toBe('');

        scene.destroy();
        expect(section.style.getPropertyValue('--apple-overlay-opacity')).toBe('');

        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
        const mobileScene = new AppleScrollScene({ mobileBreakpoint: 768 });
        mobileScene.update(720);

        expect(section.style.getPropertyValue('--apple-overlay-opacity')).toBe('');
        mobileScene.destroy();
    });

    it('recalcula el modo al hacer resize y no falla si faltan elementos', () => {
        const section = document.getElementById('apple-section') as HTMLElement;
        Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 2600 });
        vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
            top: -720,
            bottom: 1880,
            left: 0,
            right: 1200,
            width: 1200,
            height: 2600,
            x: 0,
            y: -720,
            toJSON: () => '',
        } as DOMRect);

        Object.defineProperty(window, 'scrollY', { configurable: true, value: 720 });
        const scene = new AppleScrollScene({ mobileBreakpoint: 768 });

        EventBus.emit('resize', { width: 390, height: 844 });
        expect(section.style.getPropertyValue('--apple-overlay-opacity')).toBe('');

        EventBus.emit('resize', { width: 1280, height: 900 });
        expect(parseFloat(section.style.getPropertyValue('--apple-overlay-opacity'))).toBeGreaterThan(0.4);

        scene.destroy();

        document.body.innerHTML = '<main id="app"></main>';
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        expect(() => {
            const emptyScene = new AppleScrollScene();
            EventBus.emit('scroll', { delta: 20, direction: 'down', y: 120 });
            EventBus.emit('resize', { width: 1440, height: 900 });
            emptyScene.destroy();
        }).not.toThrow();

        expect(warnSpy).toHaveBeenCalledWith('[AppleScrollScene] Elements not found');
    });
});
