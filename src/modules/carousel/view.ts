type CarouselViewElements = {
    track: HTMLElement | null;
    slides: NodeListOf<HTMLElement>;
    dots: NodeListOf<HTMLElement>;
    prevButton: HTMLElement | null;
    nextButton: HTMLElement | null;
};

export function applyCarouselViewState(
    view: CarouselViewElements,
    currentIndex: number,
    prevIndex: number,
    totalSlides: number,
): void {
    const goingForward = currentIndex >= prevIndex;

    if (view.track) {
        view.track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    view.dots.forEach((dot, index) => {
        const isActive = index === currentIndex;
        dot.classList.toggle('carousel-dot--active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        dot.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    view.slides.forEach((slide, index) => {
        slide.classList.remove('slide--active', 'slide--enter-left');
        slide.setAttribute('aria-hidden', index === currentIndex ? 'false' : 'true');

        if (index === currentIndex) {
            void slide.offsetHeight;
            slide.classList.add(goingForward ? 'slide--active' : 'slide--enter-left');
        }
    });

    if (view.prevButton) {
        const isDisabled = currentIndex === 0;
        view.prevButton.classList.toggle('btn--disabled', isDisabled);
        view.prevButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
        if (view.prevButton instanceof HTMLButtonElement) {
            view.prevButton.disabled = isDisabled;
        }
    }

    if (view.nextButton) {
        const isDisabled = currentIndex === totalSlides - 1;
        view.nextButton.classList.toggle('btn--disabled', isDisabled);
        view.nextButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
        if (view.nextButton instanceof HTMLButtonElement) {
            view.nextButton.disabled = isDisabled;
        }
    }
}
