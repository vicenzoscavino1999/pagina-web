export function getCarouselSwipeStep(startX: number, endX: number, threshold: number): number {
    const diffX = startX - endX;

    if (Math.abs(diffX) <= threshold) {
        return 0;
    }

    return diffX > 0 ? 1 : -1;
}
