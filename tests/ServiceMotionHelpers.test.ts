import { beforeEach, describe, expect, it } from 'vitest';
import {
    applyServiceCardMotionState,
    applyServiceSpotlightState,
    getServiceCardMotionState,
    getServiceSpotlightState,
    resetServiceCardMotionState,
    resetServiceSpotlightState,
} from '../src/modules/services/motion';

describe('service motion helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('calcula motion de tarjeta a partir del puntero', () => {
        const state = getServiceCardMotionState(
            { left: 100, top: 200, width: 240, height: 180 },
            340,
            380
        );

        expect(state).toEqual({
            glowX: '100.00%',
            glowY: '100.00%',
            shiftX: '8.00px',
            shiftY: '6.00px',
            tiltX: '-4.00deg',
            tiltY: '4.50deg',
            x: 8,
            y: 6,
        });
    });

    it('aplica y resetea motion de tarjeta y spotlight de seccion', () => {
        document.body.innerHTML = `
            <section id="servicios"></section>
            <article id="card">
                <div data-service-depth="0.5"></div>
            </article>
        `;

        const section = document.getElementById('servicios') as HTMLElement;
        const card = document.getElementById('card') as HTMLElement;
        const layer = card.querySelector('[data-service-depth]') as HTMLElement;
        const state = getServiceCardMotionState(
            { left: 0, top: 0, width: 200, height: 100 },
            200,
            100
        );
        const spotlight = getServiceSpotlightState(
            { left: 0, top: 0, width: 1000, height: 800 },
            700,
            240,
            'valued'
        );

        expect(state).not.toBeNull();
        expect(spotlight).not.toBeNull();
        if (!state || !spotlight) {
            throw new Error('states should exist');
        }

        applyServiceCardMotionState(card, [layer], state);
        applyServiceSpotlightState(section, spotlight);

        expect(card.style.getPropertyValue('--svc-tilt-y')).toBe('4.50deg');
        expect(layer.style.getPropertyValue('--svc-layer-x')).toBe('4.00px');
        expect(section.style.getPropertyValue('--services-spotlight-opacity')).not.toBe('');
        expect(section.style.getPropertyValue('--services-accent')).toContain('52, 211, 153');

        resetServiceCardMotionState(card, [layer]);
        resetServiceSpotlightState(section);

        expect(card.style.getPropertyValue('--svc-tilt-y')).toBe('0deg');
        expect(layer.style.getPropertyValue('--svc-layer-x')).toBe('0px');
        expect(section.style.getPropertyValue('--services-spotlight-opacity')).toBe('0');
        expect(section.style.getPropertyValue('--services-spotlight-x')).toBe('50%');
    });

    it('usa fallback de profundidad y accent por defecto cuando los datos no son validos', () => {
        document.body.innerHTML = `
            <section id="servicios"></section>
            <article id="card">
                <div id="layer-invalid" data-service-depth="bad-depth"></div>
                <div id="layer-missing"></div>
            </article>
        `;

        const section = document.getElementById('servicios') as HTMLElement;
        const card = document.getElementById('card') as HTMLElement;
        const invalidLayer = document.getElementById('layer-invalid') as HTMLElement;
        const missingLayer = document.getElementById('layer-missing') as HTMLElement;
        const state = getServiceCardMotionState(
            { left: 0, top: 0, width: 200, height: 100 },
            150,
            75
        );
        const spotlight = getServiceSpotlightState(
            { left: 0, top: 0, width: 1000, height: 800 },
            150,
            75,
            'unknown-kind'
        );

        expect(state).not.toBeNull();
        expect(spotlight).not.toBeNull();
        if (!state || !spotlight) {
            throw new Error('states should exist');
        }

        applyServiceCardMotionState(card, [invalidLayer, missingLayer], state);
        applyServiceSpotlightState(section, spotlight);

        expect(invalidLayer.style.getPropertyValue('--svc-layer-x')).toBe('1.40px');
        expect(invalidLayer.style.getPropertyValue('--svc-layer-y')).toBe('1.05px');
        expect(missingLayer.style.getPropertyValue('--svc-layer-x')).toBe('1.40px');
        expect(missingLayer.style.getPropertyValue('--svc-layer-y')).toBe('1.05px');
        expect(section.style.getPropertyValue('--services-accent')).toBe('rgba(14, 165, 233, 0.18)');
    });

    it('omite estados invalidos si el rect es inutil', () => {
        expect(getServiceCardMotionState({ left: 0, top: 0, width: 0, height: 100 }, 10, 10)).toBeNull();
        expect(getServiceSpotlightState({ left: 0, top: 0, width: 100, height: 0 }, 10, 10, 'docs')).toBeNull();
    });
});
