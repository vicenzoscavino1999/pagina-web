import { EventBus } from '../utils/events';
import type { AppleScrollOptions } from '../types';
import { getAppleScrollProgress } from './apple/progress';
import { applyAppleSceneVisualState, getAppleSceneVisualState, resetAppleSceneVisualState } from './apple/view';


export class AppleScrollScene {
    #section: HTMLElement | null;
    #heading: HTMLElement | null;
    #mobileBreakpoint: number;
    #isMobile = false;
    #subheading: HTMLElement | null;
    #unsubscribeScroll: () => void;
    #unsubscribeResize: () => void;

    constructor({ mobileBreakpoint = 768 }: AppleScrollOptions = {}) {
        this.#section = document.getElementById('apple-section');
        this.#heading = document.getElementById('apple-heading');
        this.#mobileBreakpoint = mobileBreakpoint;
        this.#isMobile = window.innerWidth < mobileBreakpoint;
        this.#subheading = document.getElementById('apple-subheading');

        // Initialize empty cleanup functions in case elements aren't found
        this.#unsubscribeScroll = (): void => { };
        this.#unsubscribeResize = (): void => { };

        if (!this.#section) {
            console.warn('[AppleScrollScene] Elements not found');
            return;
        }

        this.update = this.update.bind(this);

        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }): void => { this.update(y); });
        this.#unsubscribeResize = EventBus.on('resize', ({ width }): void => {
            this.#isMobile = width < this.#mobileBreakpoint;
            this.update(window.scrollY);
        });
    }

    update(_scrollY: number): void {
        void _scrollY;
        if (this.#isMobile || !this.#section) return;

        const rect = this.#section.getBoundingClientRect();
        const { progress } = getAppleScrollProgress(rect.top, this.#section.offsetHeight, window.innerHeight);

        applyAppleSceneVisualState(
            {
                heading: this.#heading,
                section: this.#section,
                subheading: this.#subheading,
            },
            getAppleSceneVisualState(progress)
        );
    }

    destroy(): void {
        this.#unsubscribeScroll();
        this.#unsubscribeResize();

        if (this.#section) {
            resetAppleSceneVisualState({
                heading: this.#heading,
                section: this.#section,
                subheading: this.#subheading,
            });
        }
    }
}

