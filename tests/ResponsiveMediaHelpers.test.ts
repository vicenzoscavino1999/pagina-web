import { describe, expect, it } from 'vitest';
import {
    getResponsiveSourceSet,
    renderResponsiveSourceMarkup,
} from '../src/modules/content/responsiveMedia';

describe('responsive media helpers', () => {
    it('retorna srcset y sizes para assets mapeados', () => {
        const sources = getResponsiveSourceSet('/media/hero-warehouse.png');

        expect(sources).toBeTruthy();
        expect(sources?.avifSrcSet).toContain('/media/optimized/hero-warehouse-640.avif 640w');
        expect(sources?.webpSrcSet).toContain('/media/optimized/hero-warehouse-1280.webp 1280w');
        expect(sources?.sizes).toBe('100vw');
    });

    it('retorna null para assets no mapeados', () => {
        expect(getResponsiveSourceSet('/media/unknown-image.png')).toBeNull();
    });

    it('renderiza source markup para assets mapeados', () => {
        const markup = renderResponsiveSourceMarkup('/media/docs_cinematic.png');

        expect(markup).toContain('type="image/avif"');
        expect(markup).toContain('/media/optimized/docs-cinematic-320.avif 320w');
        expect(markup).toContain('type="image/webp"');
        expect(markup).toContain('/media/optimized/docs-cinematic-640.webp 640w');
        expect(markup).toContain('sizes="(min-width: 768px) 33vw, 100vw"');
    });

    it('retorna markup vacio para assets no mapeados', () => {
        expect(renderResponsiveSourceMarkup('/media/unknown-image.png')).toBe('');
    });
});
