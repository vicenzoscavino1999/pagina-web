import { EventBus } from '../utils/events';
import { getServicesScrollVisualState } from './services/scroll';
import { applyServicesScrollVisualState, resetServicesScrollVisualState } from './services/view';

export class ServicesScrollScene {
    #section: HTMLElement | null;
    #unsubscribeResize: () => void;
    #unsubscribeScroll: () => void;

    constructor() {
        this.#section = document.getElementById('servicios');
        this.#unsubscribeResize = (): void => {};
        this.#unsubscribeScroll = (): void => {};

        if (!this.#section) {
            return;
        }

        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }): void => {
            void y;
            this.#update();
        });

        this.#unsubscribeResize = EventBus.on('resize', ({ width, height }): void => {
            void width;
            void height;
            this.#update();
        });

        this.#update();
    }

    #update(): void {
        if (!this.#section) return;

        const state = getServicesScrollVisualState({
            rectTop: this.#section.getBoundingClientRect().top,
            sectionHeight: this.#section.offsetHeight,
            viewportHeight: window.innerHeight,
        });

        if (!state) {
            resetServicesScrollVisualState(this.#section);
            return;
        }

        applyServicesScrollVisualState(this.#section, state);
    }

    destroy(): void {
        this.#unsubscribeScroll();
        this.#unsubscribeResize();

        if (this.#section) {
            resetServicesScrollVisualState(this.#section);
        }
    }
}
