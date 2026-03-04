import { SITE_CONTENT } from '../content/siteContent';
import { EventBus } from '../utils/events';
import {
    getStickyFeatureScrollIndex,
    getStickyFeatureScrollTarget,
    hasStickyFeatureScrollableRange,
} from './sticky-features/scroll';
import { applyStickyFeatureState, updateStickyFeatureNav } from './sticky-features/view';

export class StickyFeatureList {
    #section: HTMLElement | null;
    #items: NodeListOf<HTMLElement>;
    #mockupScreens: NodeListOf<HTMLElement>;
    #currentIndex: number = 0;
    #prevIndex: number = 0;
    #unsubscribeScroll: () => void;
    #clickHandlers: Array<() => void> = [];
    #visibilityObserver: IntersectionObserver | null = null;

    // Mobile feature nav strip elements
    #navLabel: HTMLElement | null;
    #navDots: NodeListOf<HTMLElement>;
    #navPrev: HTMLElement | null;
    #navNext: HTMLElement | null;
    #navPrevHandler: (() => void) | null = null;
    #navNextHandler: (() => void) | null = null;
    #navDotHandlers: Array<{ dot: HTMLElement; handler: () => void }> = [];

    constructor() {
        this.#section = document.getElementById('university-features');
        this.#items = document.querySelectorAll<HTMLElement>('.feature-item');
        this.#mockupScreens = document.querySelectorAll<HTMLElement>('.mockup-screen');
        this.#unsubscribeScroll = (): void => { };

        // Mobile feature nav
        this.#navLabel = document.getElementById('uf-nav-label');
        this.#navDots = document.querySelectorAll<HTMLElement>('.uf-nav-dot');
        this.#navPrev = document.getElementById('uf-nav-prev');
        this.#navNext = document.getElementById('uf-nav-next');

        if (!this.#section || this.#items.length === 0) {
            console.warn('[StickyFeatureList] Elements not found');
            return;
        }

        this.#items.forEach((item, index) => {
            const handler = (): void => this.#activate(index, true);
            this.#clickHandlers.push(handler);
            item.addEventListener('click', handler);
            item.style.cursor = 'pointer';
        });

        this.#navPrevHandler = (): void => {
            this.#activate(this.#currentIndex - 1, true);
            this.#scrollToFeature(this.#currentIndex);
        };
        this.#navPrev?.addEventListener('click', this.#navPrevHandler);

        this.#navNextHandler = (): void => {
            this.#activate(this.#currentIndex + 1, true);
            this.#scrollToFeature(this.#currentIndex);
        };
        this.#navNext?.addEventListener('click', this.#navNextHandler);

        this.#navDots.forEach((dot) => {
            const index = parseInt(dot.dataset['index'] ?? '0', 10);
            const handler = (): void => {
                this.#activate(index, true);
                this.#scrollToFeature(index);
            };
            this.#navDotHandlers.push({ dot, handler });
            dot.addEventListener('click', handler);
        });

        const featureNav = document.getElementById('uf-feature-nav');
        if (featureNav) {
            this.#visibilityObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        featureNav.classList.toggle('uf-nav--visible', entry.isIntersecting);
                    });
                },
                { threshold: 0, rootMargin: '0px 0px -50px 0px' }
            );
            this.#visibilityObserver.observe(this.#section);
        }

        this.#activate(0, false);

        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }): void => {
            this.#onScroll(y);
        });
    }

    #scrollToFeature(index: number): void {
        if (!this.#section) return;
        if (!hasStickyFeatureScrollableRange(this.#section.offsetHeight, window.innerHeight)) return;

        const sectionTop = this.#section.getBoundingClientRect().top + window.scrollY;
        const targetScroll = getStickyFeatureScrollTarget({
            index,
            totalItems: this.#items.length,
            sectionTop,
            sectionHeight: this.#section.offsetHeight,
            windowHeight: window.innerHeight,
        });

        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    #activate(index: number, clicked = false): void {
        this.#prevIndex = this.#currentIndex;

        const maxIndex = Math.max(this.#items.length - 1, 0);
        this.#currentIndex = Math.min(Math.max(index, 0), maxIndex);

        applyStickyFeatureState(this.#items, this.#mockupScreens, this.#currentIndex, this.#prevIndex);
        this.#updateNavStrip();

        void clicked;
    }

    #updateNavStrip(): void {
        updateStickyFeatureNav(
            {
                label: this.#navLabel,
                dots: this.#navDots,
                prev: this.#navPrev,
                next: this.#navNext,
            },
            SITE_CONTENT.features.items.map((item) => item.title),
            this.#currentIndex,
            this.#items.length,
        );
    }

    #onScroll(_scrollY: number): void {
        void _scrollY;
        if (!this.#section) return;
        if (!hasStickyFeatureScrollableRange(this.#section.offsetHeight, window.innerHeight)) return;

        const scrollIndex = getStickyFeatureScrollIndex({
            totalItems: this.#items.length,
            rectTop: this.#section.getBoundingClientRect().top,
            sectionHeight: this.#section.offsetHeight,
            windowHeight: window.innerHeight,
        });

        if (scrollIndex !== null && scrollIndex !== this.#currentIndex) {
            this.#activate(scrollIndex);
        }
    }

    destroy(): void {
        this.#unsubscribeScroll();
        this.#visibilityObserver?.disconnect();

        if (this.#navPrev && this.#navPrevHandler) {
            this.#navPrev.removeEventListener('click', this.#navPrevHandler);
        }

        if (this.#navNext && this.#navNextHandler) {
            this.#navNext.removeEventListener('click', this.#navNextHandler);
        }

        this.#navDotHandlers.forEach(({ dot, handler }) => {
            dot.removeEventListener('click', handler);
        });

        this.#items.forEach((item, index) => {
            const handler = this.#clickHandlers[index];
            if (handler) {
                item.removeEventListener('click', handler);
            }
        });
    }
}
