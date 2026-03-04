import { EventBus } from '../utils/events';
import type { NavbarOptions } from '../types';
import { collectDarkSections, isNavbarScrolled, shouldUseDarkNavbar } from './navbar/contrast';
import {
    computeScrollProgress,
    normalizeHashFromHref,
    selectActiveSectionId,
} from './navbar/activeSection';
import { setMobileMenuState, shouldCloseMobileMenu, toggleMobileMenu } from './navbar/mobileMenu';

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
    #sectionLinkMap = new Map<string, HTMLAnchorElement[]>();
    #sectionOrder: string[] = [];
    #activeSectionId: string | null = null;

    constructor(element: HTMLElement, { scrollThreshold = 50 }: NavbarOptions = {}) {
        this.#element = element;
        this.#scrollThreshold = scrollThreshold;
        this.#mobileButton = document.getElementById('mobile-btn') as HTMLButtonElement | null;
        this.#mobileMenu = document.getElementById('mobile-menu');
        this.#darkSections = collectDarkSections();
        this.#collectSectionLinks();

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
        const isScrolled = isNavbarScrolled(scrollY, this.#scrollThreshold);
        this.#element.classList.toggle('nav-scrolled', isScrolled);
        this.#updateProgress(scrollY);
        this.#updateActiveSection();

        if (!isScrolled) {
            this.#element.classList.remove('nav-dark-bg');
            return;
        }

        this.#element.classList.toggle(
            'nav-dark-bg',
            shouldUseDarkNavbar(this.#darkSections, this.#element.offsetHeight)
        );
    }

    #collectSectionLinks(): void {
        const anchorLinks = Array.from(this.#element.querySelectorAll<HTMLAnchorElement>('a[href]'));

        anchorLinks.forEach((link) => {
            const targetId = normalizeHashFromHref(link.getAttribute('href'));
            if (!targetId) return;

            const targetSection = document.getElementById(targetId);
            if (!targetSection) return;

            const currentLinks = this.#sectionLinkMap.get(targetId) ?? [];
            currentLinks.push(link);
            this.#sectionLinkMap.set(targetId, currentLinks);

            if (!this.#sectionOrder.includes(targetId)) {
                this.#sectionOrder.push(targetId);
            }
        });
    }

    #updateProgress(scrollY: number): void {
        const progress = computeScrollProgress(
            scrollY,
            document.documentElement.scrollHeight,
            window.innerHeight
        );

        this.#element.style.setProperty('--nav-scroll-progress', progress.toFixed(4));
    }

    #updateActiveSection(): void {
        if (this.#sectionOrder.length === 0) return;

        const anchorY = this.#element.offsetHeight + 24;
        const sectionMetrics = this.#sectionOrder
            .map((id) => {
                const section = document.getElementById(id);
                if (!section) return null;

                const { top, bottom } = section.getBoundingClientRect();
                return {
                    id,
                    top,
                    bottom,
                };
            })
            .filter((metric): metric is { id: string; top: number; bottom: number } => metric !== null);

        const nextActiveSectionId = selectActiveSectionId(sectionMetrics, anchorY);
        if (nextActiveSectionId === this.#activeSectionId) return;

        this.#activeSectionId = nextActiveSectionId;

        this.#sectionLinkMap.forEach((links, sectionId) => {
            const isActive = sectionId === nextActiveSectionId;

            links.forEach((link) => {
                link.classList.toggle('nav-link-active', isActive);

                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                    return;
                }

                link.removeAttribute('aria-current');
            });
        });
    }

    #bindMobileMenu(): void {
        if (!this.#mobileButton || !this.#mobileMenu) return;

        setMobileMenuState(
            {
                button: this.#mobileButton,
                menu: this.#mobileMenu,
            },
            false
        );

        this.#mobileToggleHandler = (): void => {
            toggleMobileMenu({
                button: this.#mobileButton,
                menu: this.#mobileMenu,
            });
        };
        this.#mobileButton.addEventListener('click', this.#mobileToggleHandler);

        this.#mobileMenuClickHandler = (event: Event): void => {
            if (shouldCloseMobileMenu(event.target)) {
                this.#closeMobileMenu();
            }
        };
        this.#mobileMenu.addEventListener('click', this.#mobileMenuClickHandler);
    }

    #closeMobileMenu(): void {
        setMobileMenuState(
            {
                button: this.#mobileButton,
                menu: this.#mobileMenu,
            },
            false
        );
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

        this.#element.style.removeProperty('--nav-scroll-progress');
        this.#sectionLinkMap.forEach((links) => {
            links.forEach((link) => {
                link.classList.remove('nav-link-active');
                link.removeAttribute('aria-current');
            });
        });
    }
}
