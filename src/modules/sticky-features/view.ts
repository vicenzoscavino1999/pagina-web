type StickyFeatureNavElements = {
    label: HTMLElement | null;
    dots: NodeListOf<HTMLElement>;
    prev: HTMLElement | null;
    next: HTMLElement | null;
};

export function applyStickyFeatureState(
    items: NodeListOf<HTMLElement>,
    mockupScreens: NodeListOf<HTMLElement>,
    currentIndex: number,
    prevIndex: number,
): void {
    const goingForward = currentIndex >= prevIndex;

    items.forEach((item, index) => {
        item.classList.toggle('feature-item--active', index === currentIndex);
        item.classList.toggle('feature-item--done', index < currentIndex);
    });

    mockupScreens.forEach((screen, index) => {
        screen.classList.remove(
            'mockup-screen--visible',
            'mockup-slide-from-right',
            'mockup-slide-from-left',
        );

        if (index === currentIndex) {
            void screen.offsetHeight;
            screen.classList.add(goingForward ? 'mockup-slide-from-right' : 'mockup-slide-from-left');
            screen.classList.add('mockup-screen--visible');
        }
    });
}

export function updateStickyFeatureNav(
    nav: StickyFeatureNavElements,
    labels: readonly string[],
    currentIndex: number,
    totalItems: number,
): void {
    if (nav.label) {
        nav.label.classList.remove('uf-nav-label--fade');
        void nav.label.offsetHeight;
        nav.label.textContent = labels[currentIndex] ?? '';
        nav.label.classList.add('uf-nav-label--fade');
    }

    nav.dots.forEach((dot, index) => {
        const isActive = index === currentIndex;
        dot.classList.toggle('uf-nav-dot--active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        dot.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    if (nav.prev) {
        nav.prev.classList.toggle('uf-nav-arrow--disabled', currentIndex === 0);
    }

    if (nav.next) {
        nav.next.classList.toggle('uf-nav-arrow--disabled', currentIndex === totalItems - 1);
    }
}
