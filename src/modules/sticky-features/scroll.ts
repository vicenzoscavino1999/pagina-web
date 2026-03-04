type StickyFeatureScrollTargetArgs = {
    index: number;
    totalItems: number;
    sectionTop: number;
    sectionHeight: number;
    windowHeight: number;
};

type StickyFeatureScrollIndexArgs = {
    totalItems: number;
    rectTop: number;
    sectionHeight: number;
    windowHeight: number;
};

export function hasStickyFeatureScrollableRange(sectionHeight: number, windowHeight: number): boolean {
    return sectionHeight - windowHeight > 0;
}

export function getStickyFeatureScrollTarget({
    index,
    totalItems,
    sectionTop,
    sectionHeight,
    windowHeight,
}: StickyFeatureScrollTargetArgs): number {
    if (totalItems <= 1) {
        return sectionTop;
    }

    const clampedIndex = Math.min(Math.max(index, 0), totalItems - 1);
    const scrollable = Math.max(sectionHeight - windowHeight, 0);
    const targetProgress = clampedIndex / (totalItems - 1);

    return sectionTop + targetProgress * scrollable;
}

export function getStickyFeatureScrollIndex({
    totalItems,
    rectTop,
    sectionHeight,
    windowHeight,
}: StickyFeatureScrollIndexArgs): number | null {
    if (totalItems === 0) {
        return null;
    }

    if (!hasStickyFeatureScrollableRange(sectionHeight, windowHeight)) {
        return 0;
    }

    const scrollable = sectionHeight - windowHeight;

    const scrolled = -rectTop;
    if (scrolled < 0 || scrolled > scrollable + windowHeight) {
        return null;
    }

    const progress = Math.min(Math.max(scrolled / scrollable, 0), 1);
    const rawIndex = progress * totalItems;
    const fractional = rawIndex % 1;
    const slotIndex = Math.floor(rawIndex);

    if (slotIndex >= totalItems - 1) {
        return totalItems - 1;
    }

    if (fractional >= 0.60) {
        return slotIndex + 1;
    }

    return slotIndex;
}
