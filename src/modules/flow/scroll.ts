import { clamp } from '../../utils/math';

export interface FlowScrollInput {
    rectTop: number;
    sectionHeight: number;
    viewportHeight: number;
}

export interface FlowScrollVisualState {
    cardShift: string;
    connectorFill: string;
    energy: string;
    glowOpacity: string;
    imageShift: string;
    progress: string;
    sweepX: string;
}

export function getFlowScrollVisualState({
    rectTop,
    sectionHeight,
    viewportHeight,
}: FlowScrollInput): FlowScrollVisualState | null {
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
    const travelDistance = safeSectionHeight + safeViewportHeight * 0.68;
    const progress = clamp((safeViewportHeight - rectTop) / Math.max(travelDistance, 1), 0, 1);
    const energy = clamp(0.16 + visibility * 0.48 + progress * 0.24, 0.16, 1);
    const connectorFill = clamp(progress * 0.82 + visibility * 0.14, 0.12, 1);
    const glowOpacity = clamp(0.04 + energy * 0.18, 0.04, 0.22);
    const cardShift = 20 - progress * 28;
    const imageShift = -10 + progress * 18;
    const sweepX = 18 + progress * 64;

    return {
        cardShift: `${cardShift.toFixed(2)}px`,
        connectorFill: connectorFill.toFixed(3),
        energy: energy.toFixed(3),
        glowOpacity: glowOpacity.toFixed(3),
        imageShift: `${imageShift.toFixed(2)}px`,
        progress: progress.toFixed(3),
        sweepX: `${sweepX.toFixed(2)}%`,
    };
}
