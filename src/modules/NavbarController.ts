import { EventBus } from '../utils/events';
import type { NavbarOptions } from '../types';


export class NavbarController {
    #element: HTMLElement;
    #scrollThreshold: number;
    #unsubscribe: () => void;

    constructor(element: HTMLElement, { scrollThreshold = 50 }: NavbarOptions = {}) {
        // Element is guaranteed by type


        this.#element = element;
        this.#scrollThreshold = scrollThreshold;

        // this.handleScroll = this.handleScroll.bind(this); // Arrow function handles binding
        this.#unsubscribe = EventBus.on('scroll', (payload: { y: number }): void => { this.handleScroll(payload); });
    }

    handleScroll({ y }: { y: number }): void {
        this.#update(y);
    }

    #update(scrollY: number): void {
        const isScrolled = scrollY > this.#scrollThreshold;
        this.#element.classList.toggle('nav-scrolled', isScrolled);
    }

    destroy(): void {
        this.#unsubscribe();
    }
}

