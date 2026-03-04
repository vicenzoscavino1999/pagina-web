import { clamp } from '../../utils/math';

const DEFAULT_SERVICE_ACCENT = 'rgba(14, 165, 233, 0.18)';

const SERVICE_ACCENTS: Record<string, string> = {
    docs: 'rgba(56, 189, 248, 0.24)',
    parcel: 'rgba(96, 165, 250, 0.24)',
    valued: 'rgba(52, 211, 153, 0.24)',
};

export interface ServiceCardLayer {
    dataset: DOMStringMap;
    style: CSSStyleDeclaration;
}

export interface ServiceCardMotionState {
    glowX: string;
    glowY: string;
    shiftX: string;
    shiftY: string;
    tiltX: string;
    tiltY: string;
    x: number;
    y: number;
}

export interface ServiceSpotlightState {
    accent: string;
    opacity: string;
    x: string;
    y: string;
}

export function getServiceCardMotionState(
    rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
    clientX: number,
    clientY: number
): ServiceCardMotionState | null {
    if (rect.width <= 0 || rect.height <= 0) {
        return null;
    }

    const ratioX = clamp((clientX - rect.left) / rect.width, 0, 1);
    const ratioY = clamp((clientY - rect.top) / rect.height, 0, 1);
    const normalizedX = ratioX - 0.5;
    const normalizedY = ratioY - 0.5;
    const shiftX = normalizedX * 16;
    const shiftY = normalizedY * 12;

    return {
        glowX: `${(ratioX * 100).toFixed(2)}%`,
        glowY: `${(ratioY * 100).toFixed(2)}%`,
        shiftX: `${shiftX.toFixed(2)}px`,
        shiftY: `${shiftY.toFixed(2)}px`,
        tiltX: `${(normalizedY * -8).toFixed(2)}deg`,
        tiltY: `${(normalizedX * 9).toFixed(2)}deg`,
        x: shiftX,
        y: shiftY,
    };
}

export function applyServiceCardMotionState(
    card: HTMLElement,
    layers: readonly ServiceCardLayer[],
    state: ServiceCardMotionState
): void {
    card.style.setProperty('--svc-tilt-x', state.tiltX);
    card.style.setProperty('--svc-tilt-y', state.tiltY);
    card.style.setProperty('--svc-shift-x', state.shiftX);
    card.style.setProperty('--svc-shift-y', state.shiftY);
    card.style.setProperty('--svc-glow-x', state.glowX);
    card.style.setProperty('--svc-glow-y', state.glowY);

    layers.forEach((layer) => {
        const depthRaw = layer.dataset['serviceDepth'] ?? '0.35';
        const depth = Number.parseFloat(depthRaw);
        const depthFactor = Number.isFinite(depth) ? depth : 0.35;
        layer.style.setProperty('--svc-layer-x', `${(state.x * depthFactor).toFixed(2)}px`);
        layer.style.setProperty('--svc-layer-y', `${(state.y * depthFactor).toFixed(2)}px`);
    });
}

export function resetServiceCardMotionState(card: HTMLElement, layers: readonly ServiceCardLayer[]): void {
    card.style.setProperty('--svc-tilt-x', '0deg');
    card.style.setProperty('--svc-tilt-y', '0deg');
    card.style.setProperty('--svc-shift-x', '0px');
    card.style.setProperty('--svc-shift-y', '0px');
    card.style.setProperty('--svc-glow-x', '50%');
    card.style.setProperty('--svc-glow-y', '50%');

    layers.forEach((layer) => {
        layer.style.setProperty('--svc-layer-x', '0px');
        layer.style.setProperty('--svc-layer-y', '0px');
    });
}

export function getServiceSpotlightState(
    rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
    clientX: number,
    clientY: number,
    kind: string
): ServiceSpotlightState | null {
    if (rect.width <= 0 || rect.height <= 0) {
        return null;
    }

    const ratioX = clamp((clientX - rect.left) / rect.width, 0, 1);
    const ratioY = clamp((clientY - rect.top) / rect.height, 0, 1);
    const centerDistance = Math.abs(ratioX - 0.5) + Math.abs(ratioY - 0.46);
    const opacity = clamp(0.22 + (1 - centerDistance) * 0.34, 0.18, 0.54);

    return {
        accent: SERVICE_ACCENTS[kind] ?? DEFAULT_SERVICE_ACCENT,
        opacity: opacity.toFixed(3),
        x: `${(ratioX * 100).toFixed(2)}%`,
        y: `${(ratioY * 100).toFixed(2)}%`,
    };
}

export function applyServiceSpotlightState(section: HTMLElement, state: ServiceSpotlightState): void {
    section.style.setProperty('--services-accent', state.accent);
    section.style.setProperty('--services-spotlight-opacity', state.opacity);
    section.style.setProperty('--services-spotlight-x', state.x);
    section.style.setProperty('--services-spotlight-y', state.y);
}

export function resetServiceSpotlightState(section: HTMLElement): void {
    section.style.setProperty('--services-accent', DEFAULT_SERVICE_ACCENT);
    section.style.setProperty('--services-spotlight-opacity', '0');
    section.style.setProperty('--services-spotlight-x', '50%');
    section.style.setProperty('--services-spotlight-y', '22%');
}
