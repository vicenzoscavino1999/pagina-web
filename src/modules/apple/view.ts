import { clamp, lerp } from '../../utils/math';

export interface AppleSceneElements {
    heading: HTMLElement | null;
    section: HTMLElement;
    subheading: HTMLElement | null;
}

export interface AppleSceneVisualState {
    blurPx: number;
    copyBlurPx: number;
    copyOpacity: number;
    copyRotateXDeg: number;
    copyScale: number;
    copyTranslateYPx: number;
    focusGlowOpacity: number;
    headingOpacity: number;
    headingTranslateYPx: number;
    imageScale: number;
    imageTranslateYPx: number;
    overlayOpacity: number;
    subheadingOpacity: number;
    subheadingTranslateYPx: number;
    vignetteOpacity: number;
}

export function getAppleSceneVisualState(progress: number): AppleSceneVisualState {
    const normalizedProgress = clamp(progress, 0, 1);
    const darkenProgress = getAppleSceneRangeProgress(normalizedProgress, 0.04, 0.62);
    const copyProgress = easeOutCubic(getAppleSceneRangeProgress(normalizedProgress, 0.18, 0.56));
    const headingProgress = easeOutCubic(getAppleSceneRangeProgress(normalizedProgress, 0.26, 0.52));
    const subheadingProgress = easeOutCubic(getAppleSceneRangeProgress(normalizedProgress, 0.4, 0.7));

    return {
        blurPx: lerp(0, 18, darkenProgress),
        copyBlurPx: lerp(14, 0, copyProgress),
        copyOpacity: copyProgress,
        copyRotateXDeg: lerp(8, 0, copyProgress),
        copyScale: lerp(0.94, 1, copyProgress),
        copyTranslateYPx: lerp(52, 0, copyProgress),
        focusGlowOpacity: lerp(0.2, 0.9, darkenProgress),
        headingOpacity: headingProgress,
        headingTranslateYPx: lerp(24, 0, headingProgress),
        imageScale: lerp(1.04, 1.16, darkenProgress),
        imageTranslateYPx: lerp(22, -32, normalizedProgress),
        overlayOpacity: lerp(0, 0.82, darkenProgress),
        subheadingOpacity: subheadingProgress,
        subheadingTranslateYPx: lerp(20, 0, subheadingProgress),
        vignetteOpacity: lerp(0.26, 0.88, darkenProgress),
    };
}

export function applyAppleSceneVisualState(elements: AppleSceneElements, state: AppleSceneVisualState): void {
    elements.section.style.setProperty('--apple-blur', `${state.blurPx.toFixed(2)}px`);
    elements.section.style.setProperty('--apple-copy-blur', `${state.copyBlurPx.toFixed(2)}px`);
    elements.section.style.setProperty('--apple-copy-opacity', state.copyOpacity.toFixed(3));
    elements.section.style.setProperty('--apple-copy-rotate', `${state.copyRotateXDeg.toFixed(2)}deg`);
    elements.section.style.setProperty('--apple-copy-scale', state.copyScale.toFixed(3));
    elements.section.style.setProperty('--apple-copy-y', `${state.copyTranslateYPx.toFixed(2)}px`);
    elements.section.style.setProperty('--apple-glow-opacity', state.focusGlowOpacity.toFixed(3));
    elements.section.style.setProperty('--apple-heading-opacity', state.headingOpacity.toFixed(3));
    elements.section.style.setProperty('--apple-heading-y', `${state.headingTranslateYPx.toFixed(2)}px`);
    elements.section.style.setProperty('--apple-overlay-opacity', state.overlayOpacity.toFixed(3));
    elements.section.style.setProperty('--apple-scale', state.imageScale.toFixed(3));
    elements.section.style.setProperty('--apple-subheading-opacity', state.subheadingOpacity.toFixed(3));
    elements.section.style.setProperty('--apple-subheading-y', `${state.subheadingTranslateYPx.toFixed(2)}px`);
    elements.section.style.setProperty('--apple-vignette-opacity', state.vignetteOpacity.toFixed(3));
    elements.section.style.setProperty('--apple-image-y', `${state.imageTranslateYPx.toFixed(2)}px`);

    if (elements.heading) {
        elements.heading.classList.toggle('apple-text-visible', state.headingOpacity >= 0.22);
    }

    if (elements.subheading) {
        elements.subheading.classList.toggle('apple-text-visible', state.subheadingOpacity >= 0.2);
    }
}

export function resetAppleSceneVisualState(elements: AppleSceneElements): void {
    [
        '--apple-blur',
        '--apple-copy-blur',
        '--apple-copy-opacity',
        '--apple-copy-rotate',
        '--apple-copy-scale',
        '--apple-copy-y',
        '--apple-glow-opacity',
        '--apple-heading-opacity',
        '--apple-heading-y',
        '--apple-image-y',
        '--apple-overlay-opacity',
        '--apple-scale',
        '--apple-subheading-opacity',
        '--apple-subheading-y',
        '--apple-vignette-opacity',
    ].forEach((propertyName) => {
        elements.section.style.removeProperty(propertyName);
    });

    elements.heading?.classList.remove('apple-text-visible');
    elements.subheading?.classList.remove('apple-text-visible');
}

export function getAppleSceneRangeProgress(value: number, start: number, end: number): number {
    if (end <= start) return 1;
    return clamp((value - start) / (end - start), 0, 1);
}

function easeOutCubic(value: number): number {
    return 1 - (1 - value) ** 3;
}
