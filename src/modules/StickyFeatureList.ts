import { EventBus } from '../utils/events';
import { clamp } from '../utils/math';

// Labels for each feature item (must match order of .feature-item in HTML)
const FEATURE_LABELS = [
    'Retiro en campus',
    'Seguro incluido',
    'Alertas instantáneas',
    'Pago flexible',
];

export class StickyFeatureList {
    #section: HTMLElement | null;
    #items: NodeListOf<HTMLElement>;
    #mockupScreens: NodeListOf<HTMLElement>;
    #currentIndex: number = 0;
    #prevIndex: number = 0;
    #unsubscribeScroll: () => void;
    #clickHandlers: Array<() => void> = [];

    // Mobile feature nav strip elements
    #navLabel: HTMLElement | null;
    #navDots: NodeListOf<HTMLElement>;
    #navPrev: HTMLElement | null;
    #navNext: HTMLElement | null;

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

        // Attach click handlers to each feature item (desktop)
        this.#items.forEach((item, i) => {
            const handler = (): void => this.#activate(i, true);
            this.#clickHandlers.push(handler);
            item.addEventListener('click', handler);
            item.style.cursor = 'pointer';
        });

        // Wire up mobile nav: prev/next arrows
        this.#navPrev?.addEventListener('click', () => {
            this.#activate(this.#currentIndex - 1, true);
            this.#scrollToFeature(this.#currentIndex);
        });
        this.#navNext?.addEventListener('click', () => {
            this.#activate(this.#currentIndex + 1, true);
            this.#scrollToFeature(this.#currentIndex);
        });

        // Wire up mobile nav: dots
        this.#navDots.forEach((dot) => {
            const idx = parseInt(dot.dataset['index'] ?? '0', 10);
            dot.addEventListener('click', () => {
                this.#activate(idx, true);
                this.#scrollToFeature(idx);
            });
        });

        // Hide the nav bar when the university-features section is not in view
        const featureNav = document.getElementById('uf-feature-nav');
        if (featureNav && this.#section) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        featureNav.classList.toggle('uf-nav--visible', entry.isIntersecting);
                    });
                },
                { threshold: 0, rootMargin: '0px 0px -50px 0px' }
            );
            observer.observe(this.#section);
        }

        // Activate first item by default
        this.#activate(0, false);

        // Subscribe to scroll for auto-advance
        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }: { y: number }): void => {
            this.#onScroll(y);
        });
    }

    /** Scroll the page to make the given feature active in the sticky section */
    #scrollToFeature(index: number): void {
        if (!this.#section) return;
        const totalItems = this.#items.length;
        const sectionTop = this.#section.getBoundingClientRect().top + window.scrollY;
        const sectionHeight = this.#section.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollable = sectionHeight - windowHeight;
        const targetProgress = index / (totalItems - 1);
        const targetScroll = sectionTop + targetProgress * scrollable;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    #activate(index: number, clicked = false): void {
        this.#prevIndex = this.#currentIndex;
        this.#currentIndex = clamp(index, 0, this.#items.length - 1);

        const goingForward = this.#currentIndex >= this.#prevIndex;

        this.#items.forEach((item, i) => {
            item.classList.toggle('feature-item--active', i === this.#currentIndex);
            item.classList.toggle('feature-item--done', i < this.#currentIndex);
        });

        this.#mockupScreens.forEach((screen, i) => {
            screen.classList.remove(
                'mockup-screen--visible',
                'mockup-slide-from-right',
                'mockup-slide-from-left',
            );

            if (i === this.#currentIndex) {
                void screen.offsetHeight;
                screen.classList.add(goingForward ? 'mockup-slide-from-right' : 'mockup-slide-from-left');
                screen.classList.add('mockup-screen--visible');
            }
        });

        // Update mobile feature nav strip
        this.#updateNavStrip();

        void clicked;
    }

    #updateNavStrip(): void {
        const idx = this.#currentIndex;
        const total = this.#items.length;

        // Update label with fade animation
        if (this.#navLabel) {
            this.#navLabel.classList.remove('uf-nav-label--fade');
            void this.#navLabel.offsetHeight; // reflow
            this.#navLabel.textContent = FEATURE_LABELS[idx] ?? '';
            this.#navLabel.classList.add('uf-nav-label--fade');
        }

        // Update dots
        this.#navDots.forEach((dot, i) => {
            dot.classList.toggle('uf-nav-dot--active', i === idx);
        });

        // Update arrow disabled states
        if (this.#navPrev) {
            this.#navPrev.classList.toggle('uf-nav-arrow--disabled', idx === 0);
        }
        if (this.#navNext) {
            this.#navNext.classList.toggle('uf-nav-arrow--disabled', idx === total - 1);
        }
    }

    #onScroll(_scrollY: number): void {
        void _scrollY;
        if (!this.#section) return;

        const rect = this.#section.getBoundingClientRect();
        const scrolled = -rect.top;
        const sectionHeight = this.#section.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollable = sectionHeight - windowHeight;

        if (scrolled < 0 || scrolled > scrollable + windowHeight) return;

        const progress = clamp(scrolled / scrollable, 0, 1);
        const totalItems = this.#items.length;

        const rawIndex = progress * totalItems;
        const fractional = rawIndex % 1;
        const slotIndex = Math.floor(rawIndex);

        let scrollIndex: number;
        if (slotIndex >= totalItems - 1) {
            scrollIndex = totalItems - 1;
        } else if (fractional >= 0.60) {
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
