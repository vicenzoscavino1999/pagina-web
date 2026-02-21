import { EventBus } from '../utils/events';
import type { NavbarOptions } from '../types';

// Sections with dark backgrounds used for navbar contrast adaptation.
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
    #unsubscribeScroll: () => void;
    #unsubscribeResize: () => void;

    #mobileButton: HTMLButtonElement | null;
    #mobileMenu: HTMLElement | null;
    #mobileToggleHandler: (() => void) | null = null;
    #mobileMenuClickHandler: ((e: Event) => void) | null = null;

    constructor(element: HTMLElement, { scrollThreshold = 50 }: NavbarOptions = {}) {
        this.#element = element;
        this.#scrollThreshold = scrollThreshold;
        this.#mobileButton = document.getElementById('mobile-btn') as HTMLButtonElement | null;
        this.#mobileMenu = document.getElementById('mobile-menu');

        this.#darkSections = DARK_SECTION_IDS
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }): void => {
            this.handleScroll(y);
        });
        this.#unsubscribeResize = EventBus.on('resize', ({ width }): void => {
            if (width >= 768) {
                this.#closeMobileMenu();
            }
        });

        this.#bindMobileMenu();
        this.#update(window.scrollY);
    }

    handleScroll(y: number): void {
        this.#update(y);
    }

    #update(scrollY: number): void {
        const isScrolled = scrollY > this.#scrollThreshold;
        this.#element.classList.toggle('nav-scrolled', isScrolled);

        if (!isScrolled) {
            this.#element.classList.remove('nav-dark-bg');
            return;
        }

        const navH = this.#element.offsetHeight;
        let overDark = false;

        for (const section of this.#darkSections) {
            const rect = section.getBoundingClientRect();
            if (rect.top < navH && rect.bottom > 0) {
                overDark = true;
                break;
            }
        }

        this.#element.classList.toggle('nav-dark-bg', overDark);
    }

    #bindMobileMenu(): void {
        if (!this.#mobileButton || !this.#mobileMenu) return;

        this.#mobileButton.setAttribute('aria-expanded', 'false');

        this.#mobileToggleHandler = (): void => {
            const isHidden = this.#mobileMenu?.classList.contains('hidden') ?? true;
            if (isHidden) {
                this.#mobileMenu?.classList.remove('hidden');
                this.#mobileButton?.setAttribute('aria-expanded', 'true');
            } else {
                this.#closeMobileMenu();
            }
        };
        this.#mobileButton.addEventListener('click', this.#mobileToggleHandler);

        this.#mobileMenuClickHandler = (event: Event): void => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('a')) {
                this.#closeMobileMenu();
            }
        };
        this.#mobileMenu.addEventListener('click', this.#mobileMenuClickHandler);
    }

    #closeMobileMenu(): void {
        if (!this.#mobileMenu || !this.#mobileButton) return;
        this.#mobileMenu.classList.add('hidden');
        this.#mobileButton.setAttribute('aria-expanded', 'false');
    }

    destroy(): void {
        this.#unsubscribeScroll();
        this.#unsubscribeResize();

        if (this.#mobileButton && this.#mobileToggleHandler) {
            this.#mobileButton.removeEventListener('click', this.#mobileToggleHandler);
        }
        if (this.#mobileMenu && this.#mobileMenuClickHandler) {
            this.#mobileMenu.removeEventListener('click', this.#mobileMenuClickHandler);
        }
    }
}
