import { EventBus } from '../utils/events';
import { clamp } from '../utils/math';

export class StickyFeatureList {
    #section: HTMLElement | null;
    #items: NodeListOf<HTMLElement>;
    #mockupScreens: NodeListOf<HTMLElement>;
    #currentIndex: number = 0;
    #unsubscribeScroll: () => void;
    #clickHandlers: Array<() => void> = [];

    constructor() {
        this.#section = document.getElementById('university-features');
        this.#items = document.querySelectorAll<HTMLElement>('.feature-item');
        this.#mockupScreens = document.querySelectorAll<HTMLElement>('.mockup-screen');
        this.#unsubscribeScroll = (): void => { };

        if (!this.#section || this.#items.length === 0) {
            console.warn('[StickyFeatureList] Elements not found');
            return;
        }

        // Attach click handlers to each feature item
        this.#items.forEach((item, i) => {
            const handler = (): void => this.#activate(i);
            this.#clickHandlers.push(handler);
            item.addEventListener('click', handler);
            item.style.cursor = 'pointer';
        });

        // Activate first item by default
        this.#activate(0);

        // Subscribe to scroll for auto-advance
        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }: { y: number }): void => {
            this.#onScroll(y);
        });
    }

    #activate(index: number): void {
        this.#currentIndex = clamp(index, 0, this.#items.length - 1);

        this.#items.forEach((item, i) => {
            item.classList.toggle('feature-item--active', i === this.#currentIndex);
            item.classList.toggle('feature-item--done', i < this.#currentIndex);
        });

        this.#mockupScreens.forEach((screen, i) => {
            screen.classList.toggle('mockup-screen--visible', i === this.#currentIndex);
        });
    }

    #onScroll(_scrollY: number): void {
        void _scrollY;
        if (!this.#section) return;

        const rect = this.#section.getBoundingClientRect();
        const scrolled = -rect.top;
        const sectionHeight = this.#section.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollable = sectionHeight - windowHeight;

        // Only auto-drive from scroll if user hasn't clicked recently
        if (scrolled < 0 || scrolled > scrollable + windowHeight) return;

        const progress = clamp(scrolled / scrollable, 0, 1);
        const totalItems = this.#items.length;
        const scrollIndex = Math.min(
            Math.floor(progress * totalItems),
            totalItems - 1
        );

        if (scrollIndex !== this.#currentIndex) {
            this.#activate(scrollIndex);
        }
    }

    destroy(): void {
        this.#unsubscribeScroll();
        this.#items.forEach((item, i) => {
            const handler = this.#clickHandlers[i];
            if (handler) item.removeEventListener('click', handler);
        });
    }
}
