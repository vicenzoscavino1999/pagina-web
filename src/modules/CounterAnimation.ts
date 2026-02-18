import { qsa } from '../utils/dom';
import type { CounterOptions } from '../types';


export class CounterAnimation {
    #counters: HTMLElement[];
    #observer: IntersectionObserver | null = null;
    #duration: number;

    constructor({ duration = 2000 }: CounterOptions = {}) {
        this.#counters = qsa('.counter');
        this.#duration = duration;
        this.#initObserver();
    }

    #initObserver(): void {
        this.#observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.isIntersecting) {
                this.#startAnimation();
                this.#observer?.disconnect();
            }
        }, { threshold: 0.5 });

        const section = document.getElementById('stats-section');
        if (section) {
            this.#observer.observe(section);
        }
    }

    #startAnimation(): void {
        const startTime = performance.now();

        this.#counters.forEach(counter => {
            const target = +(counter.getAttribute('data-target') || 0);
            const suffix = counter.getAttribute('data-suffix') || '';

            const animate = (currentTime: number): void => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.#duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4);

                const current = Math.floor(ease * target);
                counter.innerText = `${current}${suffix}`;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.innerText = `${target}${suffix}`;
                }
            };

            requestAnimationFrame(animate);
        });
    }

    destroy(): void {
        if (this.#observer) {
            this.#observer.disconnect();
        }
    }
}

