import { EventBus } from '../utils/events';
import { clamp } from '../utils/math';

export class StickyFeatureList {
    #section: HTMLElement | null;
    #items: NodeListOf<HTMLElement>;
    #mockupScreens: NodeListOf<HTMLElement>;
    #currentIndex: number = 0;
    #prevIndex: number = 0;
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
            const handler = (): void => this.#activate(i, true);
            this.#clickHandlers.push(handler);
            item.addEventListener('click', handler);
            item.style.cursor = 'pointer';
        });

        // Wire up campus pills (mobile strip)
        const pills = document.querySelectorAll<HTMLElement>('.uf-campus-pill');
        pills.forEach((pill) => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('uf-campus-pill--active'));
                pill.classList.add('uf-campus-pill--active');
                // scroll pill into view horizontally
                pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        });

        // Activate first item by default
        this.#activate(0, false);

        // Subscribe to scroll for auto-advance
        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }: { y: number }): void => {
            this.#onScroll(y);
        });
    }

    /**
     * Activate a feature item by index.
     * @param index - target index
     * @param clicked - true when triggered by user click (no direction animation)
     */
    #activate(index: number, clicked = false): void {
        this.#prevIndex = this.#currentIndex;
        this.#currentIndex = clamp(index, 0, this.#items.length - 1);

        const goingForward = this.#currentIndex >= this.#prevIndex;

        this.#items.forEach((item, i) => {
            item.classList.toggle('feature-item--active', i === this.#currentIndex);
            item.classList.toggle('feature-item--done', i < this.#currentIndex);
        });

        this.#mockupScreens.forEach((screen, i) => {
            const wasVisible = screen.classList.contains('mockup-screen--visible');
            const willBeVisible = i === this.#currentIndex;

            // Remove previous transition classes
            screen.classList.remove(
                'mockup-screen--visible',
                'mockup-slide-from-right',
                'mockup-slide-from-left',
            );

            if (willBeVisible) {
                // Force a reflow so the animation retriggers
                void screen.offsetHeight;
                if (!clicked && wasVisible !== willBeVisible) {
                    screen.classList.add(goingForward ? 'mockup-slide-from-right' : 'mockup-slide-from-left');
                } else {
                    screen.classList.add(goingForward ? 'mockup-slide-from-right' : 'mockup-slide-from-left');
                }
                screen.classList.add('mockup-screen--visible');
            }
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

        // Guard: only drive when inside the scroll range
        if (scrolled < 0 || scrolled > scrollable + windowHeight) return;

        const progress = clamp(scrolled / scrollable, 0, 1);
        const totalItems = this.#items.length;

        // ---- Scroll sensitivity fix ----
        // Each item occupies 1/totalItems of the scroll range.
        // We require the user to scroll at least 60% into an item's
        // zone before advancing, which prevents too-rapid advances.
        const rawIndex = progress * totalItems;
        const fractional = rawIndex % 1;   // 0..1 within the current slot
        const slotIndex = Math.floor(rawIndex);

        let scrollIndex: number;
        if (slotIndex >= totalItems - 1) {
            scrollIndex = totalItems - 1;
        } else if (fractional >= 0.60) {
            // Advance only if 60% through this slot
            scrollIndex = slotIndex + 1;
        } else {
            scrollIndex = slotIndex;
        }

        scrollIndex = clamp(scrollIndex, 0, totalItems - 1);

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
