import { clamp } from '../utils/math';
import { qsa } from '../utils/dom';

interface ServiceCardBinding {
    card: HTMLElement;
    layers: HTMLElement[];
    pointerX: number;
    pointerY: number;
    rect: DOMRect;
    rafId: number | null;
    onPointerEnter: (event: PointerEvent) => void;
    onPointerMove: (event: PointerEvent) => void;
    onPointerLeave: () => void;
}

export class ServiceCardMotion {
    #bindings: ServiceCardBinding[] = [];
    #isInteractive: boolean;

    constructor() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
        this.#isInteractive = !prefersReducedMotion && hasFinePointer;
    }

    init(): void {
        if (!this.#isInteractive) return;

        const cards = qsa('[data-service-card]');
        cards.forEach((card) => this.#bindCard(card));
    }

    destroy(): void {
        this.#bindings.forEach((binding) => {
            const { card, onPointerEnter, onPointerMove, onPointerLeave, rafId } = binding;
            card.removeEventListener('pointerenter', onPointerEnter);
            card.removeEventListener('pointermove', onPointerMove);
            card.removeEventListener('pointerleave', onPointerLeave);

            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
            }

            this.#resetCard(binding);
        });

        this.#bindings = [];
    }

    #bindCard(card: HTMLElement): void {
        const layers = qsa('[data-service-depth]', card);
        const rect = card.getBoundingClientRect();

        const binding: ServiceCardBinding = {
            card,
            layers,
            pointerX: rect.left + rect.width / 2,
            pointerY: rect.top + rect.height / 2,
            rect,
            rafId: null,
            onPointerEnter: (_event): void => {
                void _event;
            },
            onPointerMove: (_event): void => {
                void _event;
            },
            onPointerLeave: (): void => undefined,
        };

        const onPointerEnter = (event: PointerEvent): void => {
            binding.rect = card.getBoundingClientRect();
            binding.pointerX = event.clientX;
            binding.pointerY = event.clientY;
            card.classList.add('is-interacting');
            this.#scheduleUpdate(binding);
        };

        const onPointerMove = (event: PointerEvent): void => {
            binding.pointerX = event.clientX;
            binding.pointerY = event.clientY;
            this.#scheduleUpdate(binding);
        };

        const onPointerLeave = (): void => {
            card.classList.remove('is-interacting');
            this.#resetCard(binding);
        };

        binding.onPointerEnter = onPointerEnter;
        binding.onPointerMove = onPointerMove;
        binding.onPointerLeave = onPointerLeave;

        card.addEventListener('pointerenter', onPointerEnter);
        card.addEventListener('pointermove', onPointerMove);
        card.addEventListener('pointerleave', onPointerLeave);

        this.#bindings.push(binding);
    }

    #scheduleUpdate(binding: ServiceCardBinding): void {
        if (binding.rafId !== null) return;

        binding.rafId = window.requestAnimationFrame(() => {
            binding.rafId = null;
            this.#applyMotion(binding);
        });
    }

    #applyMotion(binding: ServiceCardBinding): void {
        const { card } = binding;
        const rect = binding.rect;

        if (rect.width <= 0 || rect.height <= 0) return;

        const ratioX = clamp((binding.pointerX - rect.left) / rect.width, 0, 1);
        const ratioY = clamp((binding.pointerY - rect.top) / rect.height, 0, 1);

        const normalizedX = ratioX - 0.5;
        const normalizedY = ratioY - 0.5;

        const tiltY = normalizedX * 9;
        const tiltX = normalizedY * -8;
        const shiftX = normalizedX * 16;
        const shiftY = normalizedY * 12;

        card.style.setProperty('--svc-tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--svc-tilt-y', `${tiltY.toFixed(2)}deg`);
        card.style.setProperty('--svc-shift-x', `${shiftX.toFixed(2)}px`);
        card.style.setProperty('--svc-shift-y', `${shiftY.toFixed(2)}px`);
        card.style.setProperty('--svc-glow-x', `${(ratioX * 100).toFixed(2)}%`);
        card.style.setProperty('--svc-glow-y', `${(ratioY * 100).toFixed(2)}%`);

        binding.layers.forEach((layer) => {
            const depthRaw = layer.dataset['serviceDepth'] ?? '0.35';
            const depth = Number.parseFloat(depthRaw);
            const depthFactor = Number.isFinite(depth) ? depth : 0.35;
            const layerX = shiftX * depthFactor;
            const layerY = shiftY * depthFactor;

            layer.style.setProperty('--svc-layer-x', `${layerX.toFixed(2)}px`);
            layer.style.setProperty('--svc-layer-y', `${layerY.toFixed(2)}px`);
        });
    }

    #resetCard(binding: ServiceCardBinding): void {
        const { card, layers } = binding;
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
}
