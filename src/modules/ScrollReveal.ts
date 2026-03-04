import { gsap } from 'gsap';
import type { ScrollRevealOptions } from '../types';
import { qsa } from '../utils/dom';

export class ScrollReveal {
    #observer: IntersectionObserver;
    #elements: HTMLElement[] = [];
    #duration: number;
    #prefersReducedMotion: boolean;

    constructor({
        threshold = 0.15,
        rootMargin = '0px 0px -50px 0px',
        duration = 0.7,
    }: ScrollRevealOptions = {}) {
        this.#duration = duration;
        this.#prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.#observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) return;

                    this.#reveal(entry.target);
                    this.#observer.unobserve(entry.target);
                });
            },
            {
                threshold,
                rootMargin,
            }
        );
    }

    init(): void {
        this.#elements = qsa('.reveal');

        if (this.#prefersReducedMotion) {
            this.#elements.forEach((element) => {
                element.classList.add('active');
            });
            return;
        }

        this.#elements.forEach((element) => {
            gsap.set(element, {
                autoAlpha: 0,
                y: 26,
                filter: 'blur(1.5px)',
            });
            this.#observer.observe(element);
        });
    }

    destroy(): void {
        this.#observer.disconnect();
        this.#elements.forEach((element) => {
            gsap.killTweensOf(element);
        });
        this.#elements = [];
    }

    #reveal(element: HTMLElement): void {
        element.classList.add('active');

        gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: this.#duration,
            ease: 'power2.out',
            clearProps: 'opacity,visibility,transform,filter',
        });
    }
}

