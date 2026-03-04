import { escapeAttribute } from './sanitize';

type ResponsiveFormat = 'avif' | 'webp';

interface ResponsiveVariantConfig {
    targetBase: string;
    widths: readonly number[];
    sizes: string;
}

export interface ResponsiveSourceSet {
    avifSrcSet: string;
    webpSrcSet: string;
    sizes: string;
}

const RESPONSIVE_VARIANTS: Readonly<Record<string, ResponsiveVariantConfig>> = {
    '/media/hero-warehouse.png': {
        targetBase: 'hero-warehouse',
        widths: [640, 960, 1280],
        sizes: '100vw',
    },
    '/media/optimized/hero-warehouse-1280.webp': {
        targetBase: 'hero-warehouse',
        widths: [640, 960, 1280],
        sizes: '100vw',
    },
    '/media/furgoneta-hero.jpg': {
        targetBase: 'furgoneta-hero',
        widths: [640, 960, 1280, 1600, 1920],
        sizes: '100vw',
    },
    '/media/optimized/furgoneta-hero-1280.webp': {
        targetBase: 'furgoneta-hero',
        widths: [640, 960, 1280, 1600, 1920],
        sizes: '100vw',
    },
    '/media/docs_cinematic.png': {
        targetBase: 'docs-cinematic',
        widths: [320, 480, 640],
        sizes: '(min-width: 768px) 33vw, 100vw',
    },
    '/media/optimized/docs-cinematic-640.webp': {
        targetBase: 'docs-cinematic',
        widths: [320, 480, 640],
        sizes: '(min-width: 768px) 33vw, 100vw',
    },
    '/media/valued_cinematic.png': {
        targetBase: 'valued-cinematic',
        widths: [320, 480, 640],
        sizes: '(min-width: 768px) 33vw, 100vw',
    },
    '/media/optimized/valued-cinematic-640.webp': {
        targetBase: 'valued-cinematic',
        widths: [320, 480, 640],
        sizes: '(min-width: 768px) 33vw, 100vw',
    },
    '/media/parcel_cinematic.png': {
        targetBase: 'parcel-cinematic',
        widths: [320, 480, 640, 960, 1280],
        sizes: '(min-width: 768px) 33vw, 100vw',
    },
    '/media/optimized/parcel-cinematic-1280.webp': {
        targetBase: 'parcel-cinematic',
        widths: [320, 480, 640, 960, 1280],
        sizes: '(min-width: 768px) 33vw, 100vw',
    },
} as const;

function buildSrcSet(
    targetBase: string,
    widths: readonly number[],
    format: ResponsiveFormat
): string {
    return widths
        .map((width) => `/media/optimized/${targetBase}-${width}.${format} ${width}w`)
        .join(', ');
}

export function getResponsiveSourceSet(sourcePath: string): ResponsiveSourceSet | null {
    const variant = RESPONSIVE_VARIANTS[sourcePath];
    if (!variant) return null;

    return {
        avifSrcSet: buildSrcSet(variant.targetBase, variant.widths, 'avif'),
        webpSrcSet: buildSrcSet(variant.targetBase, variant.widths, 'webp'),
        sizes: variant.sizes,
    };
}

export function renderResponsiveSourceMarkup(sourcePath: string): string {
    const sources = getResponsiveSourceSet(sourcePath);
    if (!sources) return '';

    return `
        <source type="image/avif" srcset="${escapeAttribute(sources.avifSrcSet)}" sizes="${escapeAttribute(sources.sizes)}">
        <source type="image/webp" srcset="${escapeAttribute(sources.webpSrcSet)}" sizes="${escapeAttribute(sources.sizes)}">
    `;
}
