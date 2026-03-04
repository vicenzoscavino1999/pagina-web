import { gsap } from 'gsap';
import Lenis from 'lenis';
import type { SmoothScrollOptions } from '../types';

const GSAP_SECONDS_TO_MS = 1000;

export class SmoothScrollController {
    #lenis: Lenis | null = null;
    #tickerCallback: ((time: number) => void) | null = null;
    #lerp: number;
    #prefersReducedMotion: boolean;

    constructor({ lerp = 0.1 }: SmoothScrollOptions = {}) {
        this.#lerp = lerp;
        this.#prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    init(): void {
        if (this.#lenis || this.#prefersReducedMotion || navigator.webdriver) return;

        this.#lenis = new Lenis({
            autoRaf: false,
            anchors: {
                offset: 96,
            },
            lerp: this.#lerp,
            smoothWheel: true,
            stopInertiaOnNavigate: true,
            syncTouch: true,
        });

        this.#tickerCallback = (time: number): void => {
            this.#lenis?.raf(time * GSAP_SECONDS_TO_MS);
        };

        gsap.ticker.lagSmoothing(0);
        gsap.ticker.add(this.#tickerCallback);
    }

    destroy(): void {
        if (this.#tickerCallback) {
            gsap.ticker.remove(this.#tickerCallback);
            this.#tickerCallback = null;
        }

        this.#lenis?.destroy();
        this.#lenis = null;
    }
}
