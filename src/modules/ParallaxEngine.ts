import { EventBus } from '../utils/events';
import type { ParallaxOptions, ParallaxEntry } from '../types';


export class ParallaxEngine {
    #entries = new Map<HTMLElement, ParallaxEntry>();
    #isMobile = false;
    #mobileBreakpoint: number;
    #unsubscribeScroll: () => void;
    #unsubscribeResize: () => void;

    constructor({ mobileBreakpoint = 768 }: ParallaxOptions = {}) {
        this.#mobileBreakpoint = mobileBreakpoint;
        this.#isMobile = window.innerWidth < mobileBreakpoint;

        this.update = this.update.bind(this);
        this.recalculate = this.recalculate.bind(this);

        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }: { y: number }) => { this.update(y); });
        this.#unsubscribeResize = EventBus.on('resize', ({ width }: { width: number }) => {
            this.#isMobile = width < this.#mobileBreakpoint;
            this.recalculate();
        });
    }

    register(element: HTMLElement | null, { speed = 0.15 } = {}): void {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        this.#entries.set(element, {
            speed,
            offsetTop: rect.top + window.scrollY,
            height: element.offsetHeight,
        });
    }

    recalculate(): void {
        for (const [el, data] of this.#entries) {
            const rect = el.getBoundingClientRect();
            data.offsetTop = rect.top + window.scrollY;
            data.height = el.offsetHeight;
        }
    }

    update(scrollY: number): void {
        if (this.#isMobile) return;

        const viewportHeight = window.innerHeight;
        const viewportBottom = scrollY + viewportHeight;

        for (const [el, { speed, offsetTop, height }] of this.#entries) {
            const inView = scrollY < offsetTop + height && viewportBottom > offsetTop;
            if (!inView) continue;

            const currentRectTop = offsetTop - scrollY;
            const offset = (currentRectTop - (viewportHeight / 2)) * speed;
            el.style.setProperty('--parallax-y', `${offset}px`);
        }
    }

    destroy(): void {
        this.#entries.clear();
        this.#unsubscribeScroll();
        this.#unsubscribeResize();
    }
}

