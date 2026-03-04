import type { FlowScrollVisualState } from './scroll';

const DEFAULT_FLOW_SCROLL_STATE: FlowScrollVisualState = {
    cardShift: '20.00px',
    connectorFill: '0.120',
    energy: '0.160',
    glowOpacity: '0.040',
    imageShift: '-10.00px',
    progress: '0.000',
    sweepX: '18.00%',
};

export function applyFlowScrollVisualState(
    container: HTMLElement,
    state: FlowScrollVisualState
): void {
    container.style.setProperty('--flow-card-shift', state.cardShift);
    container.style.setProperty('--flow-connector-fill', state.connectorFill);
    container.style.setProperty('--flow-scroll-energy', state.energy);
    container.style.setProperty('--flow-glow-opacity', state.glowOpacity);
    container.style.setProperty('--flow-image-shift', state.imageShift);
    container.style.setProperty('--flow-scroll-progress', state.progress);
    container.style.setProperty('--flow-sweep-x', state.sweepX);
}

export function resetFlowScrollVisualState(container: HTMLElement): void {
    applyFlowScrollVisualState(container, DEFAULT_FLOW_SCROLL_STATE);
}
