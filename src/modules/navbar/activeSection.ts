export interface NavbarSectionMetrics {
    id: string;
    top: number;
    bottom: number;
}

export function normalizeHashFromHref(href: string | null): string | null {
    if (!href) return null;

    const normalizedHref = href.trim();
    if (!normalizedHref) return null;

    if (normalizedHref.startsWith('#')) {
        const directHash = normalizedHref.slice(1).trim();
        return directHash.length > 0 ? directHash : null;
    }

    const hashIndex = normalizedHref.indexOf('#');
    if (hashIndex === -1) return null;

    const hash = normalizedHref.slice(hashIndex + 1).trim();
    return hash.length > 0 ? hash : null;
}

export function computeScrollProgress(
    scrollY: number,
    scrollHeight: number,
    viewportHeight: number
): number {
    const maxScrollable = Math.max(scrollHeight - viewportHeight, 0);
    if (maxScrollable === 0) return 0;

    const rawProgress = scrollY / maxScrollable;
    return Math.min(1, Math.max(0, rawProgress));
}

export function selectActiveSectionId(
    metrics: readonly NavbarSectionMetrics[],
    anchorY: number
): string | null {
    if (metrics.length === 0) return null;

    const containingSection = metrics.find(
        (section) => section.top <= anchorY && section.bottom > anchorY
    );
    if (containingSection) {
        return containingSection.id;
    }

    const sectionsPassed = metrics.filter((section) => section.top <= anchorY);
    if (sectionsPassed.length > 0) {
        return sectionsPassed[sectionsPassed.length - 1]?.id ?? null;
    }

    return metrics[0]?.id ?? null;
}
