export const DARK_SECTION_IDS = [
    'apple-section',
    'truck-scene',
    'university-features',
    'stats-section',
] as const;

export function collectDarkSections(documentRoot: Document = document): HTMLElement[] {
    return DARK_SECTION_IDS
        .map((id) => documentRoot.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);
}

export function isNavbarScrolled(scrollY: number, threshold: number): boolean {
    return scrollY > threshold;
}

export function shouldUseDarkNavbar(sections: readonly HTMLElement[], navHeight: number): boolean {
    return sections.some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top < navHeight && rect.bottom > 0;
    });
}
