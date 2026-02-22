import { qsa } from '../utils/dom';

interface MagneticBinding {
    element: HTMLElement;
    onPointerEnter: (event: PointerEvent) => void;
    onPointerMove: (event: PointerEvent) => void;
    onPointerLeave: () => void;
}

export class HeroCinematicEffects {
    #heroSection: HTMLElement | null;
    #magneticElements: HTMLElement[];
    #bindings: MagneticBinding[] = [];
    #prefersReducedMotion: boolean;
    #supportsFinePointer: boolean;

    constructor() {
        this.#heroSection = document.getElementById('hero-section');
        this.#magneticElements = qsa('[data-magnetic]');
        this.#prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.#supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    }

    init(): void {
        this.#triggerHeroReveal();

        if (this.#prefersReducedMotion || !this.#supportsFinePointer) {
            return;
        }

        this.#bindMagneticElements();
    }

    destroy(): void {
        this.#bindings.forEach(({ element, onPointerEnter, onPointerMove, onPointerLeave }) => {
            element.removeEventListener('pointerenter', onPointerEnter);
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerleave', onPointerLeave);
            this.#resetMagneticState(element);
        });
        this.#bindings = [];
    }

    #triggerHeroReveal(): void {
        if (!this.#heroSection) return;

        if (this.#prefersReducedMotion) {
            this.#heroSection.classList.add('hero-stage-ready');
            return;
        }

        this.#heroSection.classList.remove('hero-stage-ready');
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                this.#heroSection?.classList.add('hero-stage-ready');
            });
        });
    }

    #bindMagneticElements(): void {
        this.#magneticElements.forEach((element) => {
            const onPointerEnter = (event: PointerEvent): void => {
                element.classList.add('is-magnetic-hover');
                this.#setMagneticState(element, event);
            };

            const onPointerMove = (event: PointerEvent): void => {
                this.#setMagneticState(element, event);
            };

            const onPointerLeave = (): void => {
                element.classList.remove('is-magnetic-hover');
                this.#resetMagneticState(element);
            };

            element.addEventListener('pointerenter', onPointerEnter);
            element.addEventListener('pointermove', onPointerMove);
            element.addEventListener('pointerleave', onPointerLeave);

            this.#bindings.push({
                element,
                onPointerEnter,
                onPointerMove,
                onPointerLeave,
            });
        });
    }

    #setMagneticState(element: HTMLElement, event: PointerEvent): void {
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const offsetX = (localX - rect.width / 2) / (rect.width / 2);
        const offsetY = (localY - rect.height / 2) / (rect.height / 2);

        const translateX = offsetX * 7;
        const translateY = offsetY * 5;
        const rotate = offsetX * 1.25;

        element.style.setProperty('--magnetic-x', `${translateX.toFixed(2)}px`);
        element.style.setProperty('--magnetic-y', `${translateY.toFixed(2)}px`);
        element.style.setProperty('--magnetic-rotate', `${rotate.toFixed(2)}deg`);
        element.style.setProperty('--magnetic-glow-x', `${((localX / rect.width) * 100).toFixed(2)}%`);
        element.style.setProperty('--magnetic-glow-y', `${((localY / rect.height) * 100).toFixed(2)}%`);
    }

    #resetMagneticState(element: HTMLElement): void {
        element.style.setProperty('--magnetic-x', '0px');
        element.style.setProperty('--magnetic-y', '0px');
        element.style.setProperty('--magnetic-rotate', '0deg');
        element.style.setProperty('--magnetic-glow-x', '50%');
        element.style.setProperty('--magnetic-glow-y', '50%');
    }
}
