import { EventBus } from '../utils/events';
import type { NavbarOptions } from '../types';

// Selectors for "dark" page sections — navbar glass adapts to these
const DARK_SECTION_IDS = [
    'apple-section',
    'truck-scene',
    'university-features',
    'stats-section',
];

export class NavbarController {
    #element: HTMLElement;
    #scrollThreshold: number;
    #darkSections: HTMLElement[];
    #unsubscribe: () => void;

    constructor(element: HTMLElement, { scrollThreshold = 50 }: NavbarOptions = {}) {
        this.#element = element;
        this.#scrollThreshold = scrollThreshold;

        // Collect dark section elements once
        this.#darkSections = DARK_SECTION_IDS
            .map(id => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        this.#unsubscribe = EventBus.on('scroll', (payload: { y: number }): void => {
            this.handleScroll(payload);
        });

        // Run immediately so first paint is correct
        this.#update(window.scrollY);
    }

    handleScroll({ y }: { y: number }): void {
        this.#update(y);
    }

    #update(scrollY: number): void {
        const isScrolled = scrollY > this.#scrollThreshold;
        this.#element.classList.toggle('nav-scrolled', isScrolled);

        if (!isScrolled) {
            // At top — always transparent, no dark adaptation needed
            this.#element.classList.remove('nav-dark-bg');
            return;
        }

        // Check if any dark section overlaps the navbar
        const navH = this.#element.offsetHeight;
        let overDark = false;

        for (const section of this.#darkSections) {
            const rect = section.getBoundingClientRect();
            // Section is "under" the navbar if its top is above navH and its bottom is below 0
            if (rect.top < navH && rect.bottom > 0) {
                overDark = true;
                break;
            }
        }

        this.#element.classList.toggle('nav-dark-bg', overDark);
    }

    destroy(): void {
        this.#unsubscribe();
    }
}
