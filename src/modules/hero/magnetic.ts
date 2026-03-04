export interface MagneticBinding {
    element: HTMLElement;
    onPointerEnter: (event: PointerEvent) => void;
    onPointerMove: (event: PointerEvent) => void;
    onPointerLeave: () => void;
}

type MagneticStyleValues = {
    translateX: string;
    translateY: string;
    rotate: string;
    glowX: string;
    glowY: string;
};

export function getMagneticStyleValues(
    rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
    clientX: number,
    clientY: number,
): MagneticStyleValues | null {
    if (rect.width <= 0 || rect.height <= 0) {
        return null;
    }

    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const offsetX = (localX - rect.width / 2) / (rect.width / 2);
    const offsetY = (localY - rect.height / 2) / (rect.height / 2);

    return {
        translateX: `${(offsetX * 7).toFixed(2)}px`,
        translateY: `${(offsetY * 5).toFixed(2)}px`,
        rotate: `${(offsetX * 1.25).toFixed(2)}deg`,
        glowX: `${((localX / rect.width) * 100).toFixed(2)}%`,
        glowY: `${((localY / rect.height) * 100).toFixed(2)}%`,
    };
}

export function applyMagneticState(element: HTMLElement, clientX: number, clientY: number): void {
    const values = getMagneticStyleValues(element.getBoundingClientRect(), clientX, clientY);
    if (!values) return;

    element.style.setProperty('--magnetic-x', values.translateX);
    element.style.setProperty('--magnetic-y', values.translateY);
    element.style.setProperty('--magnetic-rotate', values.rotate);
    element.style.setProperty('--magnetic-glow-x', values.glowX);
    element.style.setProperty('--magnetic-glow-y', values.glowY);
}

export function resetMagneticState(element: HTMLElement): void {
    element.style.setProperty('--magnetic-x', '0px');
    element.style.setProperty('--magnetic-y', '0px');
    element.style.setProperty('--magnetic-rotate', '0deg');
    element.style.setProperty('--magnetic-glow-x', '50%');
    element.style.setProperty('--magnetic-glow-y', '50%');
}

export function createMagneticBinding(element: HTMLElement): MagneticBinding {
    const onPointerEnter = (event: PointerEvent): void => {
        element.classList.add('is-magnetic-hover');
        applyMagneticState(element, event.clientX, event.clientY);
    };

    const onPointerMove = (event: PointerEvent): void => {
        applyMagneticState(element, event.clientX, event.clientY);
    };

    const onPointerLeave = (): void => {
        element.classList.remove('is-magnetic-hover');
        resetMagneticState(element);
    };

    return {
        element,
        onPointerEnter,
        onPointerMove,
        onPointerLeave,
    };
}
