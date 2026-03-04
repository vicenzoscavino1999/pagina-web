import { clamp } from '../../utils/math';

export interface AppleScrollProgress {
    progress: number;
    isActive: boolean;
}

export function getAppleScrollProgress(
    sectionRectTop: number,
    sectionHeight: number,
    viewportHeight: number
): AppleScrollProgress {
    const safeViewport = Math.max(viewportHeight, 1);
    const endOffset = Math.max(sectionHeight - safeViewport, 1);
    const scrollYRelative = -sectionRectTop;
    const progress = clamp(scrollYRelative / endOffset, 0, 1);
    const isActive = scrollYRelative >= -safeViewport && scrollYRelative <= endOffset + safeViewport;

    return {
        progress,
        isActive,
    };
}
