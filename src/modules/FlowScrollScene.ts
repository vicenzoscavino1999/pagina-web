import { EventBus } from '../utils/events';
import { getFlowScrollVisualState } from './flow/scroll';
import { applyFlowScrollVisualState, resetFlowScrollVisualState } from './flow/view';

export class FlowScrollScene {
    #container: HTMLElement | null;
    #unsubscribeResize: () => void;
    #unsubscribeScroll: () => void;

    constructor() {
        this.#container = document.getElementById('flow-steps');
        this.#unsubscribeResize = (): void => {};
        this.#unsubscribeScroll = (): void => {};

        if (!this.#container) {
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
        if (!this.#container) return;

        const state = getFlowScrollVisualState({
            rectTop: this.#container.getBoundingClientRect().top,
            sectionHeight: this.#container.offsetHeight,
            viewportHeight: window.innerHeight,
        });

        if (!state) {
            resetFlowScrollVisualState(this.#container);
            return;
        }

        applyFlowScrollVisualState(this.#container, state);
    }

    destroy(): void {
        this.#unsubscribeScroll();
        this.#unsubscribeResize();

        if (this.#container) {
            resetFlowScrollVisualState(this.#container);
        }
    }
}
