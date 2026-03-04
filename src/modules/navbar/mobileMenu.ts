type MobileMenuElements = {
    button: HTMLButtonElement | null;
    menu: HTMLElement | null;
};

export function setMobileMenuState(elements: MobileMenuElements, isOpen: boolean): void {
    if (!elements.button || !elements.menu) return;

    elements.menu.classList.toggle('hidden', !isOpen);
    elements.button.setAttribute('aria-expanded', String(isOpen));
}

export function toggleMobileMenu(elements: MobileMenuElements): void {
    if (!elements.button || !elements.menu) return;

    const isHidden = elements.menu.classList.contains('hidden');
    setMobileMenuState(elements, isHidden);
}

export function shouldCloseMobileMenu(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest('a'));
}
