import { SITE_CONTENT } from '../content/siteContent';
import { EventBus } from '../utils/events';
import { getTruckSceneProgress, getTruckStatusIndex, getTruckViewportLeft } from './truck/progress';
import { applyTruckSceneVisualState, getTruckSceneVisualState, resetTruckSceneVisualState } from './truck/scene';
import { applyTruckSceneState, applyTruckStatus } from './truck/view';

interface Waypoint {
    el: HTMLElement;
    position: number;
}

export class TruckScrollScene {
    #section: HTMLElement | null;
    #truck: HTMLElement | null;
    #progressFill: HTMLElement | null;
    #statusBadge: HTMLElement | null;
    #waypoints: Waypoint[] = [];
    #unsubscribeScroll: () => void;
    #statusFlashTimeout: ReturnType<typeof setTimeout> | null = null;
    #currentStatus = '';

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

        const waypointElements = document.querySelectorAll<HTMLElement>('.ts-waypoint');
        waypointElements.forEach((el, index) => {
            const position = (index + 1) / (waypointElements.length + 1);
            this.#waypoints.push({ el, position });
        });

        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }): void => {
            this.#update(y);
        });

        this.#update(window.scrollY);
    }

    #update(_scrollY: number): void {
        void _scrollY;
        if (!this.#section || !this.#truck) return;

        const progress = getTruckSceneProgress({
            rectTop: this.#section.getBoundingClientRect().top,
            sectionHeight: this.#section.offsetHeight,
            windowHeight: window.innerHeight,
        });

        if (progress === null) return;

        applyTruckSceneState(
            {
                truck: this.#truck,
                progressFill: this.#progressFill,
                waypoints: this.#waypoints,
            },
            progress,
            getTruckViewportLeft(progress),
        );
        applyTruckSceneVisualState(this.#section, getTruckSceneVisualState(progress));

        this.#updateStatus(progress);
    }

    #updateStatus(progress: number): void {
        const statusIndex = getTruckStatusIndex(progress, TruckScrollScene.STATUSES.length);
        const status = TruckScrollScene.STATUSES[statusIndex];
        const flashed = applyTruckStatus(this.#statusBadge, status, this.#currentStatus);

        if (!status) return;

        this.#currentStatus = status;

        if (flashed) {
            if (this.#statusFlashTimeout) {
                clearTimeout(this.#statusFlashTimeout);
            }

            this.#statusFlashTimeout = setTimeout(() => {
                this.#statusBadge?.classList.remove('ts-badge--flash');
                this.#statusFlashTimeout = null;
            }, 400);
        }
    }

    destroy(): void {
        this.#unsubscribeScroll();

        if (this.#statusFlashTimeout) {
            clearTimeout(this.#statusFlashTimeout);
            this.#statusFlashTimeout = null;
        }

        if (this.#section) {
            resetTruckSceneVisualState(this.#section);
        }
    }
}
