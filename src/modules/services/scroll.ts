import { clamp } from '../../utils/math';

export interface ServicesScrollInput {
    rectTop: number;
    sectionHeight: number;
    viewportHeight: number;
}

export interface ServicesScrollVisualState {
    energy: string;
    glowOpacity: string;
    gridShift: string;
    progress: string;
    sweepX: string;
    sweepY: string;
}

export function getServicesScrollVisualState({
    rectTop,
    sectionHeight,
    viewportHeight,
}: ServicesScrollInput): ServicesScrollVisualState | null {
    const safeSectionHeight = Math.max(sectionHeight, 0);
    const safeViewportHeight = Math.max(viewportHeight, 0);

    if (safeSectionHeight <= 0 || safeViewportHeight <= 0) {
        return null;
    }

    const rectBottom = rectTop + safeSectionHeight;
    const visibleTop = clamp(rectTop, 0, safeViewportHeight);
    const visibleBottom = clamp(rectBottom, 0, safeViewportHeight);
    const visibleHeight = Math.max(visibleBottom - visibleTop, 0);
    const visibility = clamp(visibleHeight / Math.max(Math.min(safeSectionHeight, safeViewportHeight), 1), 0, 1);
    const travelDistance = safeSectionHeight + safeViewportHeight * 0.72;
    const progress = clamp((safeViewportHeight - rectTop) / Math.max(travelDistance, 1), 0, 1);
    const energy = clamp(0.16 + visibility * 0.46 + progress * 0.34, 0.16, 1);
    const glowOpacity = clamp(0.05 + visibility * 0.08 + progress * 0.08, 0.05, 0.26);
    const sweepX = clamp(18 + progress * 62, 18, 84);
    const sweepY = clamp(18 + visibility * 18 + progress * 6, 18, 56);
    const gridShift = 18 - progress * 26;

    return {
        energy: energy.toFixed(3),
        glowOpacity: glowOpacity.toFixed(3),
        gridShift: `${gridShift.toFixed(2)}px`,
        progress: progress.toFixed(3),
        sweepX: `${sweepX.toFixed(2)}%`,
        sweepY: `${sweepY.toFixed(2)}%`,
    };
}
