import { clamp } from '../../utils/math';

type TruckSceneProgressArgs = {
    rectTop: number;
    sectionHeight: number;
    windowHeight: number;
};

export function getTruckSceneProgress({
    rectTop,
    sectionHeight,
    windowHeight,
}: TruckSceneProgressArgs): number | null {
    const scrollable = sectionHeight - windowHeight;
    if (scrollable <= 0) {
        return 0;
    }

    const scrolled = -rectTop;
    if (scrolled < 0 || scrolled > scrollable) {
        return null;
    }

    return clamp(scrolled / scrollable, 0, 1);
}

export function getTruckViewportLeft(progress: number): number {
    return -5 + progress * 97;
}

export function getTruckStatusIndex(progress: number, totalStatuses: number): number {
    if (totalStatuses <= 0) {
        return 0;
    }

    return Math.min(Math.floor(progress * totalStatuses), totalStatuses - 1);
}

export function hasTruckPassedWaypoint(progress: number, position: number): boolean {
    return progress >= position - 0.08;
}
