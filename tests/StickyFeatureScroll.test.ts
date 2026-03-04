import { describe, expect, it } from 'vitest';
import {
    getStickyFeatureScrollIndex,
    getStickyFeatureScrollTarget,
    hasStickyFeatureScrollableRange,
} from '../src/modules/sticky-features/scroll';

describe('sticky feature scroll helpers', () => {
    it('detecta si la seccion tiene rango real de scroll sticky', () => {
        expect(hasStickyFeatureScrollableRange(4000, 1000)).toBe(true);
        expect(hasStickyFeatureScrollableRange(1000, 1000)).toBe(false);
        expect(hasStickyFeatureScrollableRange(800, 1000)).toBe(false);
    });

    it('usa el sectionTop cuando no hay suficientes items para interpolar', () => {
        const target = getStickyFeatureScrollTarget({
            index: 0,
            totalItems: 1,
            sectionTop: 1400,
            sectionHeight: 4000,
            windowHeight: 1000,
        });

        expect(target).toBe(1400);
    });

    it('calcula el target scroll para un indice intermedio', () => {
        const target = getStickyFeatureScrollTarget({
            index: 2,
            totalItems: 4,
            sectionTop: 1000,
            sectionHeight: 4000,
            windowHeight: 1000,
        });

        expect(target).toBe(3000);
    });

    it('retorna null cuando la seccion aun no entra en rango', () => {
        const index = getStickyFeatureScrollIndex({
            totalItems: 4,
            rectTop: 100,
            sectionHeight: 4000,
            windowHeight: 1000,
        });

        expect(index).toBeNull();
    });

    it('retorna null si no hay items y 0 si la seccion no tiene scroll util', () => {
        const emptyIndex = getStickyFeatureScrollIndex({
            totalItems: 0,
            rectTop: -50,
            sectionHeight: 4000,
            windowHeight: 1000,
        });

        const flatIndex = getStickyFeatureScrollIndex({
            totalItems: 4,
            rectTop: 0,
            sectionHeight: 1000,
            windowHeight: 1000,
        });

        expect(emptyIndex).toBeNull();
        expect(flatIndex).toBe(0);
    });

    it('calcula el indice activo segun el progreso del scroll', () => {
        const index = getStickyFeatureScrollIndex({
            totalItems: 4,
            rectTop: -1500,
            sectionHeight: 4000,
            windowHeight: 1000,
        });

        expect(index).toBe(2);
    });

    it('promueve al siguiente slot cuando supera el umbral fraccional', () => {
        const index = getStickyFeatureScrollIndex({
            totalItems: 4,
            rectTop: -1300,
            sectionHeight: 4000,
            windowHeight: 1000,
        });

        expect(index).toBe(2);
    });

    it('cubre la rama del ultimo slot y la rama inferior al umbral', () => {
        const lastIndex = getStickyFeatureScrollIndex({
            totalItems: 4,
            rectTop: -3000,
            sectionHeight: 4000,
            windowHeight: 1000,
        });

        const lowerThresholdIndex = getStickyFeatureScrollIndex({
            totalItems: 4,
            rectTop: -1100,
            sectionHeight: 4000,
            windowHeight: 1000,
        });

        expect(lastIndex).toBe(3);
        expect(lowerThresholdIndex).toBe(1);
    });
});
