import { qsa } from '../utils/dom';
import { createMagneticBinding, resetMagneticState, type MagneticBinding } from './hero/magnetic';
import { triggerHeroReveal } from './hero/reveal';
import { createHeroStageScene, type HeroStageScene } from './hero/stage';

export class HeroCinematicEffects {
    #heroSection: HTMLElement | null;
    #heroBackground: HTMLElement | null;
    #heroLayout: HTMLElement | null;
    #magneticElements: HTMLElement[];
    #bindings: MagneticBinding[] = [];
    #heroStageScene: HeroStageScene | null = null;
    #prefersReducedMotion: boolean;
    #supportsFinePointer: boolean;

    constructor() {
        this.#heroSection = document.getElementById('hero-section');
        this.#heroBackground = document.getElementById('hero-bg');
        this.#heroLayout = document.getElementById('hero-layout');
        this.#magneticElements = qsa('[data-magnetic]');
        this.#prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.#supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    }

    init(): void {
        this.#triggerHeroReveal();
        this.#heroStageScene = createHeroStageScene({
            background: this.#heroBackground,
            layout: this.#heroLayout,
            prefersReducedMotion: this.#prefersReducedMotion,
            section: this.#heroSection,
            supportsFinePointer: this.#supportsFinePointer,
        });

        if (this.#prefersReducedMotion || !this.#supportsFinePointer) {
            return;
        }

        this.#bindMagneticElements();
    }

    destroy(): void {
        this.#heroStageScene?.destroy();
        this.#heroStageScene = null;

        this.#bindings.forEach(({ element, onPointerEnter, onPointerMove, onPointerLeave }) => {
            element.removeEventListener('pointerenter', onPointerEnter);
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerleave', onPointerLeave);
            resetMagneticState(element);
        });
        this.#bindings = [];
    }

    #triggerHeroReveal(): void {
        triggerHeroReveal(this.#heroSection, this.#prefersReducedMotion);
    }

    #bindMagneticElements(): void {
        this.#magneticElements.forEach((element) => {
            const binding = createMagneticBinding(element);

            element.addEventListener('pointerenter', binding.onPointerEnter);
            element.addEventListener('pointermove', binding.onPointerMove);
            element.addEventListener('pointerleave', binding.onPointerLeave);

            this.#bindings.push(binding);
        });
    }
}
