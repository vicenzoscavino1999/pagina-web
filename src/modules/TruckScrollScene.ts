import { EventBus } from '../utils/events';
import { clamp } from '../utils/math';
import { SITE_CONTENT } from '../content/siteContent';

interface Waypoint {
    el: HTMLElement;
    position: number; // 0-1 progress when this waypoint activates
}

export class TruckScrollScene {
    #section: HTMLElement | null;
    #truck: HTMLElement | null;
    #progressFill: HTMLElement | null;
    #statusBadge: HTMLElement | null;
    #waypoints: Waypoint[] = [];
    #unsubscribeScroll: () => void;

    private static readonly STATUSES = SITE_CONTENT.truck.statuses;

    constructor() {
        this.#section = document.getElementById('truck-scene');
        this.#truck = document.getElementById('delivery-truck');
        this.#progressFill = document.getElementById('ts-progress-fill');
        this.#statusBadge = document.getElementById('ts-status');
        this.#unsubscribeScroll = (): void => { };

        if (!this.#section || !this.#truck) {
            console.warn('[TruckScrollScene] Elements not found');
            return;
        }

        // Gather waypoints
        const wpEls = document.querySelectorAll<HTMLElement>('.ts-waypoint');
        wpEls.forEach((el, i) => {
            const position = (i + 1) / (wpEls.length + 1);
            this.#waypoints.push({ el, position });
        });

        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }): void => {
            this.#update(y);
        });

        // Initial update
        this.#update(window.scrollY);
    }

    #update(_scrollY: number): void {
        void _scrollY;
        if (!this.#section || !this.#truck) return;

        const rect = this.#section.getBoundingClientRect();
        const scrolled = -rect.top;
        const sectionHeight = this.#section.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollable = sectionHeight - windowHeight;

        if (scrolled < 0 || scrolled > scrollable) return;

        const progress = clamp(scrolled / scrollable, 0, 1);

        // Move truck from -5% to 92% of viewport width
        const truckX = -5 + progress * 97; // percent of viewport
        this.#truck.style.left = `${truckX}vw`;

        // Update progress bar
        if (this.#progressFill) {
            this.#progressFill.style.width = `${progress * 100}%`;
        }

        // Update status badge
        if (this.#statusBadge) {
            const statusIndex = Math.min(
                Math.floor(progress * TruckScrollScene.STATUSES.length),
                TruckScrollScene.STATUSES.length - 1
            );
            const newStatus = TruckScrollScene.STATUSES[statusIndex];
            if (newStatus && this.#statusBadge.textContent !== newStatus) {
                this.#statusBadge.textContent = newStatus;
                this.#statusBadge.classList.add('ts-badge--flash');
                setTimeout(() => {
                    this.#statusBadge?.classList.remove('ts-badge--flash');
                }, 400);
            }
        }

        // Activate waypoints as truck passes them
        this.#waypoints.forEach(({ el, position }) => {
            const passed = progress >= position - 0.08;
            el.classList.toggle('wp--active', passed);
        });

        // Show delivered state
        if (progress >= 0.98) {
            this.#truck.classList.add('truck--arrived');
        } else {
            this.#truck.classList.remove('truck--arrived');
        }
    }

    destroy(): void {
        this.#unsubscribeScroll();
    }
}


