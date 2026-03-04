import { clamp } from '../../utils/math';

export interface HeroStageBaseState {
    focusX: number;
    focusY: number;
    intensity: number;
    backgroundX: number;
    backgroundY: number;
    layoutX: number;
    layoutY: number;
}

export interface HeroStageMetrics {
    progress: number;
    visibility: number;
}

export interface HeroStageRenderState extends HeroStageBaseState {
    stageDepth: number;
    stageEnergy: number;
}

export function getHeroStageMetrics(
    rect: Pick<DOMRect, 'height' | 'top'>,
    viewportHeight: number
): HeroStageMetrics {
    const safeViewportHeight = Math.max(viewportHeight, 1);
    const safeHeight = Math.max(rect.height, 1);
    const rectBottom = rect.top + safeHeight;
    const visibleTop = clamp(rect.top, 0, safeViewportHeight);
    const visibleBottom = clamp(rectBottom, 0, safeViewportHeight);
    const visibleHeight = Math.max(visibleBottom - visibleTop, 0);

    return {
        progress: clamp((-rect.top) / safeHeight, 0, 1),
        visibility: clamp(visibleHeight / Math.max(Math.min(safeHeight, safeViewportHeight), 1), 0, 1),
    };
}

export function getHeroStageRenderState(
    baseState: HeroStageBaseState,
    metrics: HeroStageMetrics
): HeroStageRenderState {
    const progress = clamp(metrics.progress, 0, 1);
    const visibility = clamp(metrics.visibility, 0, 1);
    const scrollEnergy = progress * visibility;

    return {
        backgroundX: baseState.backgroundX + progress * 6 * visibility,
        backgroundY: baseState.backgroundY - progress * 18,
        focusX: clamp(baseState.focusX + progress * 0.025 * visibility, 0, 1),
        focusY: clamp(baseState.focusY - progress * 0.07, 0, 1),
        intensity: clamp(baseState.intensity + visibility * 0.05 + progress * 0.15, 0.2, 1),
        layoutX: baseState.layoutX - progress * 3.5 * visibility,
        layoutY: baseState.layoutY - progress * 10,
        stageDepth: clamp(progress * 0.78 + visibility * 0.1, 0, 1),
        stageEnergy: clamp(baseState.intensity * 0.74 + visibility * 0.22 + scrollEnergy * 0.24, 0.25, 1),
    };
}
