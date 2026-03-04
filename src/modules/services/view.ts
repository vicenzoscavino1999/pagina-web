import type { ServicesScrollVisualState } from './scroll';

const DEFAULT_SERVICES_SCROLL_STATE: ServicesScrollVisualState = {
    energy: '0.160',
    glowOpacity: '0.050',
    gridShift: '18.00px',
    progress: '0.000',
    sweepX: '48.00%',
    sweepY: '20.00%',
};

export function applyServicesScrollVisualState(
    section: HTMLElement,
    state: ServicesScrollVisualState
): void {
    section.style.setProperty('--services-scroll-energy', state.energy);
    section.style.setProperty('--services-scroll-glow-opacity', state.glowOpacity);
    section.style.setProperty('--services-grid-shift', state.gridShift);
    section.style.setProperty('--services-scroll-progress', state.progress);
    section.style.setProperty('--services-scroll-sweep-x', state.sweepX);
    section.style.setProperty('--services-scroll-sweep-y', state.sweepY);
}

export function resetServicesScrollVisualState(section: HTMLElement): void {
    applyServicesScrollVisualState(section, DEFAULT_SERVICES_SCROLL_STATE);
}
