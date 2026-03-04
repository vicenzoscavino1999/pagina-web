type RequestFrame = (callback: FrameRequestCallback) => number;

export function triggerHeroReveal(
    section: HTMLElement | null,
    prefersReducedMotion: boolean,
    requestFrame: RequestFrame = window.requestAnimationFrame.bind(window),
): void {
    if (!section) return;

    if (prefersReducedMotion) {
        section.classList.add('hero-stage-ready');
        return;
    }

    section.classList.remove('hero-stage-ready');
    requestFrame(() => {
        requestFrame(() => {
            section.classList.add('hero-stage-ready');
        });
    });
}
