import { beforeEach, describe, expect, it } from 'vitest';
import { getFlowScrollVisualState } from '../src/modules/flow/scroll';
import { applyFlowScrollVisualState, resetFlowScrollVisualState } from '../src/modules/flow/view';

describe('flow scroll helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('calcula estado visual scroll-driven del flujo', () => {
        const state = getFlowScrollVisualState({
            rectTop: 140,
            sectionHeight: 760,
            viewportHeight: 900,
        });

        expect(state).not.toBeNull();
        if (!state) {
            throw new Error('flow state should exist');
        }

        expect(Number.parseFloat(state.progress)).toBeGreaterThan(0.3);
        expect(Number.parseFloat(state.energy)).toBeGreaterThan(0.3);
        expect(Number.parseFloat(state.connectorFill)).toBeGreaterThan(0.2);
        expect(state.cardShift).toContain('px');
    });

    it('aplica y resetea variables CSS del flujo', () => {
        document.body.innerHTML = '<div id="flow-steps"></div>';
        const container = document.getElementById('flow-steps') as HTMLElement;

        applyFlowScrollVisualState(container, {
            cardShift: '-4.00px',
            connectorFill: '0.820',
            energy: '0.720',
            glowOpacity: '0.180',
            imageShift: '6.00px',
            progress: '0.780',
            sweepX: '66.00%',
        });

        expect(container.style.getPropertyValue('--flow-card-shift')).toBe('-4.00px');
        expect(container.style.getPropertyValue('--flow-connector-fill')).toBe('0.820');
        expect(container.style.getPropertyValue('--flow-sweep-x')).toBe('66.00%');

        resetFlowScrollVisualState(container);

        expect(container.style.getPropertyValue('--flow-card-shift')).toBe('20.00px');
        expect(container.style.getPropertyValue('--flow-connector-fill')).toBe('0.120');
        expect(container.style.getPropertyValue('--flow-sweep-x')).toBe('18.00%');
    });

    it('omite input invalido', () => {
        expect(
            getFlowScrollVisualState({
                rectTop: 0,
                sectionHeight: 0,
                viewportHeight: 900,
            })
        ).toBeNull();
        expect(
            getFlowScrollVisualState({
                rectTop: 0,
                sectionHeight: 700,
                viewportHeight: 0,
            })
        ).toBeNull();
    });
});
