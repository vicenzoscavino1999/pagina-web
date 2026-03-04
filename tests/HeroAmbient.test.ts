import { describe, expect, it } from 'vitest';
import {
    getHeroStageMetrics,
    getHeroStageRenderState,
    type HeroStageBaseState,
} from '../src/modules/hero/ambient';

const baseState: HeroStageBaseState = {
    backgroundX: 0,
    backgroundY: 0,
    focusX: 0.52,
    focusY: 0.44,
    intensity: 0.58,
    layoutX: 0,
    layoutY: 0,
};

describe('hero ambient helpers', () => {
    it('calcula progreso y visibilidad del hero segun scroll', () => {
        const topMetrics = getHeroStageMetrics({ height: 960, top: 0 }, 900);
        const scrolledMetrics = getHeroStageMetrics({ height: 960, top: -480 }, 900);

        expect(topMetrics).toEqual({
            progress: 0,
            visibility: 1,
        });
        expect(scrolledMetrics.progress).toBe(0.5);
        expect(scrolledMetrics.visibility).toBeCloseTo(480 / 900, 5);
    });

    it('deriva un estado visual mas energetico al avanzar en scroll', () => {
        const renderState = getHeroStageRenderState(baseState, {
            progress: 0.56,
            visibility: 0.82,
        });

        expect(renderState.backgroundY).toBeCloseTo(-10.08, 2);
        expect(renderState.layoutY).toBeCloseTo(-5.6, 2);
        expect(renderState.focusX).toBeGreaterThan(baseState.focusX);
        expect(renderState.focusY).toBeLessThan(baseState.focusY);
        expect(renderState.intensity).toBeGreaterThan(baseState.intensity);
        expect(renderState.stageEnergy).toBeGreaterThan(0.7);
        expect(renderState.stageDepth).toBeGreaterThan(0.5);
    });

    it('mantiene clamps si el estado base ya esta cerca de los bordes', () => {
        const renderState = getHeroStageRenderState(
            {
                ...baseState,
                focusX: 0.99,
                focusY: 0.04,
                intensity: 0.96,
            },
            {
                progress: 1,
                visibility: 1,
            }
        );

        expect(renderState.focusX).toBe(1);
        expect(renderState.focusY).toBe(0);
        expect(renderState.intensity).toBe(1);
        expect(renderState.stageEnergy).toBe(1);
    });
});
