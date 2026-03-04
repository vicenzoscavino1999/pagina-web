import { beforeEach, describe, expect, it } from 'vitest';
import { getServicesScrollVisualState } from '../src/modules/services/scroll';
import {
    applyServicesScrollVisualState,
    resetServicesScrollVisualState,
} from '../src/modules/services/view';

describe('services scroll helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('calcula un estado visual scroll-driven dentro de rango', () => {
        const state = getServicesScrollVisualState({
            rectTop: 120,
            sectionHeight: 960,
            viewportHeight: 900,
        });

        expect(state).not.toBeNull();
        if (!state) {
            throw new Error('services state should exist');
        }

        expect(Number.parseFloat(state.progress)).toBeGreaterThan(0.3);
        expect(Number.parseFloat(state.energy)).toBeGreaterThan(0.3);
        expect(state.sweepX).not.toBe('48.00%');
        expect(state.gridShift).toContain('px');
    });

    it('aplica y resetea variables CSS de la escena', () => {
        document.body.innerHTML = '<section id="servicios"></section>';
        const section = document.getElementById('servicios') as HTMLElement;

        applyServicesScrollVisualState(section, {
            energy: '0.620',
            glowOpacity: '0.180',
            gridShift: '-4.00px',
            progress: '0.780',
            sweepX: '63.00%',
            sweepY: '36.00%',
        });

        expect(section.style.getPropertyValue('--services-scroll-energy')).toBe('0.620');
        expect(section.style.getPropertyValue('--services-grid-shift')).toBe('-4.00px');
        expect(section.style.getPropertyValue('--services-scroll-sweep-x')).toBe('63.00%');

        resetServicesScrollVisualState(section);

        expect(section.style.getPropertyValue('--services-scroll-energy')).toBe('0.160');
        expect(section.style.getPropertyValue('--services-grid-shift')).toBe('18.00px');
        expect(section.style.getPropertyValue('--services-scroll-sweep-x')).toBe('48.00%');
    });

    it('omite rects invalidos', () => {
        expect(
            getServicesScrollVisualState({
                rectTop: 0,
                sectionHeight: 0,
                viewportHeight: 900,
            })
        ).toBeNull();
        expect(
            getServicesScrollVisualState({
                rectTop: 0,
                sectionHeight: 900,
                viewportHeight: 0,
            })
        ).toBeNull();
    });
});
