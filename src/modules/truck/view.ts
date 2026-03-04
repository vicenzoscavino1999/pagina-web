import type { SiteContent } from '../../content/siteContent';
import { hasTruckPassedWaypoint } from './progress';

type Waypoint = {
    el: HTMLElement;
    position: number;
};

type TruckSceneElements = {
    truck: HTMLElement;
    progressFill: HTMLElement | null;
    waypoints: readonly Waypoint[];
};

export function applyTruckSceneState(
    elements: TruckSceneElements,
    progress: number,
    truckLeft: number,
): void {
    elements.truck.style.left = `${truckLeft}vw`;

    if (elements.progressFill) {
        elements.progressFill.style.width = `${progress * 100}%`;
    }

    elements.waypoints.forEach(({ el, position }) => {
        el.classList.toggle('wp--active', hasTruckPassedWaypoint(progress, position));
    });

    elements.truck.classList.toggle('truck--arrived', progress >= 0.98);
}

export function applyTruckStatus(
    statusBadge: HTMLElement | null,
    status: SiteContent['truck']['statuses'][number] | undefined,
    previousStatus: string,
): boolean {
    if (!statusBadge || !status || previousStatus === status) {
        return false;
    }

    statusBadge.textContent = status;
    statusBadge.classList.add('ts-badge--flash');

    return true;
}
