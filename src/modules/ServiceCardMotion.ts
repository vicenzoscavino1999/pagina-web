import { qsa } from '../utils/dom';
import {
    applyServiceCardMotionState,
    applyServiceSpotlightState,
    getServiceCardMotionState,
    getServiceSpotlightState,
    resetServiceCardMotionState,
    resetServiceSpotlightState,
} from './services/motion';

interface ServiceCardBinding {
    card: HTMLElement;
    kind: string;
    layers: HTMLElement[];
    pointerX: number;
    pointerY: number;
    rect: DOMRect;
    rafId: number | null;
    onPointerEnter?: (event: PointerEvent) => void;
    onPointerMove?: (event: PointerEvent) => void;
    onPointerLeave?: () => void;
    onTap?: (event: MouseEvent) => void;
}

export class ServiceCardMotion {
    #bindings: ServiceCardBinding[] = [];
    #isFinePointer: boolean;
    #prefersReducedMotion: boolean;
    #section: HTMLElement | null;
    #touchResetHandle: number | null = null;

    constructor() {
        this.#prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.#isFinePointer = window.matchMedia('(pointer: fine)').matches;
        this.#section = document.getElementById('servicios');
    }

    init(): void {
        if (this.#prefersReducedMotion) return;

        const cards = qsa('[data-service-card]');
        cards.forEach((card) => this.#bindCard(card));
    }

    destroy(): void {
        if (this.#touchResetHandle !== null) {
            window.clearTimeout(this.#touchResetHandle);
            this.#touchResetHandle = null;
        }

        this.#bindings.forEach((binding) => {
            const { card, onPointerEnter, onPointerMove, onPointerLeave, onTap, rafId } = binding;

            if (onPointerEnter) {
                card.removeEventListener('pointerenter', onPointerEnter);
            }
            if (onPointerMove) {
                card.removeEventListener('pointermove', onPointerMove);
            }
            if (onPointerLeave) {
                card.removeEventListener('pointerleave', onPointerLeave);
            }
            if (onTap) {
                card.removeEventListener('click', onTap);
            }

            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
            }

            card.classList.remove('is-interacting', 'is-active-service', 'is-touch-active');
            this.#resetCard(binding);
        });

        this.#bindings = [];
    }

    #bindCard(card: HTMLElement): void {
        const layers = qsa('[data-service-depth]', card);
        const rect = card.getBoundingClientRect();

        let binding: ServiceCardBinding;

        let onPointerEnter: ((event: PointerEvent) => void) | undefined;
        let onPointerMove: ((event: PointerEvent) => void) | undefined;
        let onPointerLeave: (() => void) | undefined;
        let onTap: ((event: MouseEvent) => void) | undefined;

        if (this.#isFinePointer) {
            onPointerEnter = (event: PointerEvent): void => {
                binding.rect = card.getBoundingClientRect();
                binding.pointerX = event.clientX;
                binding.pointerY = event.clientY;
                card.classList.add('is-interacting');
                this.#setActiveCard(card);
                this.#scheduleUpdate(binding);
            };

            onPointerMove = (event: PointerEvent): void => {
                binding.pointerX = event.clientX;
                binding.pointerY = event.clientY;
                this.#scheduleUpdate(binding);
            };

            onPointerLeave = (): void => {
                card.classList.remove('is-interacting');
                this.#setActiveCard(null);
                this.#resetCard(binding);
            };
        } else {
            onTap = (event: MouseEvent): void => {
                binding.rect = card.getBoundingClientRect();
                binding.pointerX = Number.isFinite(event.clientX)
                    ? event.clientX
                    : binding.rect.left + binding.rect.width / 2;
                binding.pointerY = Number.isFinite(event.clientY)
                    ? event.clientY
                    : binding.rect.top + binding.rect.height / 2;

                this.#resetInactiveCards(card);

                card.classList.add('is-interacting', 'is-touch-active');
                this.#setActiveCard(card);
                this.#applyMotion(binding);
                this.#queueTouchReset();
            };
        }

        binding = {
            card,
            kind: card.dataset['serviceKind'] ?? 'docs',
            layers,
            pointerX: rect.left + rect.width / 2,
            pointerY: rect.top + rect.height / 2,
            rect,
            rafId: null,
        };

        if (onPointerEnter) {
            binding.onPointerEnter = onPointerEnter;
        }
        if (onPointerMove) {
            binding.onPointerMove = onPointerMove;
        }
        if (onPointerLeave) {
            binding.onPointerLeave = onPointerLeave;
        }
        if (onTap) {
            binding.onTap = onTap;
        }

        if (onPointerEnter) {
            card.addEventListener('pointerenter', onPointerEnter);
        }
        if (onPointerMove) {
            card.addEventListener('pointermove', onPointerMove);
        }
        if (onPointerLeave) {
            card.addEventListener('pointerleave', onPointerLeave);
        }
        if (onTap) {
            card.addEventListener('click', onTap);
        }

        this.#bindings.push(binding);
    }

    #queueTouchReset(): void {
        if (this.#touchResetHandle !== null) {
            window.clearTimeout(this.#touchResetHandle);
        }

        this.#touchResetHandle = window.setTimeout(() => {
            this.#bindings.forEach((binding) => {
                binding.card.classList.remove('is-interacting', 'is-active-service', 'is-touch-active');
                this.#resetCard(binding);
            });

            this.#touchResetHandle = null;
        }, 900);
    }

    #scheduleUpdate(binding: ServiceCardBinding): void {
        if (binding.rafId !== null) return;

        binding.rafId = window.requestAnimationFrame(() => {
            binding.rafId = null;
            this.#applyMotion(binding);
        });
    }

    #applyMotion(binding: ServiceCardBinding): void {
        const motionState = getServiceCardMotionState(binding.rect, binding.pointerX, binding.pointerY);
        if (!motionState) return;

        applyServiceCardMotionState(binding.card, binding.layers, motionState);

        if (this.#section) {
            const spotlightState = getServiceSpotlightState(
                this.#section.getBoundingClientRect(),
                binding.pointerX,
                binding.pointerY,
                binding.kind
            );

            if (spotlightState) {
                applyServiceSpotlightState(this.#section, spotlightState);
            }
        }
    }

    #resetCard(binding: ServiceCardBinding): void {
        resetServiceCardMotionState(binding.card, binding.layers);

        if (this.#section) {
            resetServiceSpotlightState(this.#section);
        }
    }

    #setActiveCard(activeCard: HTMLElement | null): void {
        this.#bindings.forEach(({ card }) => {
            card.classList.toggle('is-active-service', card === activeCard);
        });
    }

    #resetInactiveCards(activeCard: HTMLElement): void {
        this.#bindings.forEach((binding) => {
            if (binding.card === activeCard) return;

            binding.card.classList.remove('is-interacting', 'is-touch-active');
            this.#resetCard(binding);
        });
    }
}
