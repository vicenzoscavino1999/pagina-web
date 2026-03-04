import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServicesScrollScene } from '../src/modules/ServicesScrollScene';
import { EventBus } from '../src/utils/events';

describe('ServicesScrollScene', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section id="servicios">
                <div id="services-grid"></div>
            </section>
        `;
        vi.clearAllMocks();
        EventBus.clear();
    });

    afterEach(() => {
        EventBus.clear();
    });

    it('actualiza variables CSS con scroll y resize y resetea al destruir', () => {
        const section = document.getElementById('servicios') as HTMLElement;
        let currentTop = 220;

        Object.defineProperty(section, 'offsetHeight', {
            configurable: true,
            value: 960,
        });

        vi.spyOn(section, 'getBoundingClientRect').mockImplementation(
            () =>
                ({
                    top: currentTop,
                    left: 0,
                    width: 1280,
                    height: 960,
                    bottom: currentTop + 960,
                    right: 1280,
                    x: 0,
                    y: currentTop,
                    toJSON: () => '',
                }) as DOMRect
        );

        const scene = new ServicesScrollScene();
        const initialProgress = section.style.getPropertyValue('--services-scroll-progress');

        expect(initialProgress).not.toBe('');
        expect(section.style.getPropertyValue('--services-grid-shift')).not.toBe('');

        currentTop = -180;
        EventBus.emit('scroll', { y: 820, direction: 'down', delta: 220 });

        const nextProgress = Number.parseFloat(section.style.getPropertyValue('--services-scroll-progress'));
        const nextEnergy = Number.parseFloat(section.style.getPropertyValue('--services-scroll-energy'));

        expect(nextProgress).toBeGreaterThan(Number.parseFloat(initialProgress));
        expect(nextEnergy).toBeGreaterThan(0.4);

        currentTop = -80;
        EventBus.emit('resize', { width: 1440, height: 900 });
        expect(section.style.getPropertyValue('--services-scroll-sweep-x')).not.toBe('48.00%');

        scene.destroy();

        expect(section.style.getPropertyValue('--services-scroll-progress')).toBe('0.000');
        expect(section.style.getPropertyValue('--services-scroll-energy')).toBe('0.160');
    });

    it('resetea el estado visual cuando la seccion queda fuera de rango util', () => {
        const section = document.getElementById('servicios') as HTMLElement;

        Object.defineProperty(section, 'offsetHeight', {
            configurable: true,
            value: 0,
        });

        vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
            top: 220,
            left: 0,
            width: 1280,
            height: 0,
            bottom: 220,
            right: 1280,
            x: 0,
            y: 220,
            toJSON: () => '',
        } as DOMRect);

        const scene = new ServicesScrollScene();

        expect(section.style.getPropertyValue('--services-scroll-progress')).toBe('0.000');
        expect(section.style.getPropertyValue('--services-scroll-energy')).toBe('0.160');
        expect(section.style.getPropertyValue('--services-grid-shift')).toBe('18.00px');

        EventBus.emit('scroll', { y: 320, direction: 'down', delta: 120 });
        expect(section.style.getPropertyValue('--services-scroll-sweep-x')).toBe('48.00%');

        scene.destroy();
    });

    it('no falla si la seccion de servicios no existe', () => {
        document.body.innerHTML = '<main id="app"></main>';

        const scene = new ServicesScrollScene();

        expect(() => {
            EventBus.emit('scroll', { y: 120, direction: 'down', delta: 40 });
            EventBus.emit('resize', { width: 1440, height: 900 });
            scene.destroy();
        }).not.toThrow();
    });
});
