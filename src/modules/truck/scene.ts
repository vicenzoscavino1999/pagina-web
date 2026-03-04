import { clamp, lerp } from '../../utils/math';

export interface TruckSceneVisualState {
    cityShiftPx: number;
    cueOpacity: number;
    cueTranslateYPx: number;
    dashDurationSec: number;
    overlayOpacity: number;
    overlayTranslateYPx: number;
    progressGlowOpacity: number;
    roadGlowOpacity: number;
    skyBrightness: number;
    skySaturate: number;
    sunScale: number;
    truckGlowOpacity: number;
    truckLiftPx: number;
    truckRotateDeg: number;
    truckScale: number;
}

export function getTruckSceneVisualState(progress: number): TruckSceneVisualState {
    const normalizedProgress = clamp(progress, 0, 1);
    const revealProgress = easeOutCubic(getTruckSceneRangeProgress(normalizedProgress, 0.02, 0.24));
    const cruiseProgress = easeInOutSine(getTruckSceneRangeProgress(normalizedProgress, 0.1, 0.86));
    const arrivalProgress = easeOutCubic(getTruckSceneRangeProgress(normalizedProgress, 0.82, 1));
    const bounceWave = Math.sin(normalizedProgress * Math.PI * 10) * (1 - arrivalProgress);

    return {
        cityShiftPx: lerp(0, -48, cruiseProgress),
        cueOpacity: 1 - getTruckSceneRangeProgress(normalizedProgress, 0.05, 0.22),
        cueTranslateYPx: lerp(0, 16, getTruckSceneRangeProgress(normalizedProgress, 0.05, 0.22)),
        dashDurationSec: lerp(0.84, 0.42, cruiseProgress),
        overlayOpacity: lerp(0.78, 1, revealProgress),
        overlayTranslateYPx: lerp(18, 0, revealProgress),
        progressGlowOpacity: lerp(0.4, 0.96, cruiseProgress),
        roadGlowOpacity: lerp(0.14, 0.82, cruiseProgress),
        skyBrightness: lerp(0.94, 1.08, cruiseProgress),
        skySaturate: lerp(0.92, 1.14, cruiseProgress),
        sunScale: lerp(0.9, 1.18, revealProgress) - arrivalProgress * 0.08,
        truckGlowOpacity: lerp(0.2, 0.88, cruiseProgress),
        truckLiftPx: bounceWave * 4 - arrivalProgress * 2,
        truckRotateDeg: bounceWave * 1.4,
        truckScale: lerp(0.96, 1.04, revealProgress) - arrivalProgress * 0.03,
    };
}

export function applyTruckSceneVisualState(section: HTMLElement, state: TruckSceneVisualState): void {
    section.style.setProperty('--ts-city-shift', `${state.cityShiftPx.toFixed(2)}px`);
    section.style.setProperty('--ts-cue-opacity', state.cueOpacity.toFixed(3));
    section.style.setProperty('--ts-cue-y', `${state.cueTranslateYPx.toFixed(2)}px`);
    section.style.setProperty('--ts-dash-duration', `${state.dashDurationSec.toFixed(3)}s`);
    section.style.setProperty('--ts-overlay-opacity', state.overlayOpacity.toFixed(3));
    section.style.setProperty('--ts-overlay-y', `${state.overlayTranslateYPx.toFixed(2)}px`);
    section.style.setProperty('--ts-progress-glow', state.progressGlowOpacity.toFixed(3));
    section.style.setProperty('--ts-road-glow-opacity', state.roadGlowOpacity.toFixed(3));
    section.style.setProperty('--ts-sky-brightness', state.skyBrightness.toFixed(3));
    section.style.setProperty('--ts-sky-saturate', state.skySaturate.toFixed(3));
    section.style.setProperty('--ts-sun-scale', state.sunScale.toFixed(3));
    section.style.setProperty('--ts-truck-glow', state.truckGlowOpacity.toFixed(3));
    section.style.setProperty('--ts-truck-rotate', `${state.truckRotateDeg.toFixed(2)}deg`);
    section.style.setProperty('--ts-truck-scale', state.truckScale.toFixed(3));
    section.style.setProperty('--ts-truck-y', `${state.truckLiftPx.toFixed(2)}px`);
}

export function resetTruckSceneVisualState(section: HTMLElement): void {
    [
        '--ts-city-shift',
        '--ts-cue-opacity',
        '--ts-cue-y',
        '--ts-dash-duration',
        '--ts-overlay-opacity',
        '--ts-overlay-y',
        '--ts-progress-glow',
        '--ts-road-glow-opacity',
        '--ts-sky-brightness',
        '--ts-sky-saturate',
        '--ts-sun-scale',
        '--ts-truck-glow',
        '--ts-truck-rotate',
        '--ts-truck-scale',
        '--ts-truck-y',
    ].forEach((propertyName) => {
        section.style.removeProperty(propertyName);
    });
}

export function getTruckSceneRangeProgress(value: number, start: number, end: number): number {
    if (end <= start) return 1;
    return clamp((value - start) / (end - start), 0, 1);
}

function easeOutCubic(value: number): number {
    return 1 - (1 - value) ** 3;
}

function easeInOutSine(value: number): number {
    return -(Math.cos(Math.PI * value) - 1) / 2;
}
