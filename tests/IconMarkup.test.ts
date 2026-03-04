import { describe, expect, it } from 'vitest';
import { renderIconMarkup } from '../src/modules/content/iconMarkup';

describe('icon markup', () => {
    it('renderiza un svg inline a partir del descriptor Font Awesome', () => {
        const markup = renderIconMarkup('fa-solid fa-phone text-xl');

        expect(markup).toContain('<svg');
        expect(markup).toContain('class="app-icon text-xl"');
        expect(markup).toContain('stroke="currentColor"');
    });

    it('usa un fallback seguro si no encuentra un icono conocido', () => {
        const markup = renderIconMarkup('fa-solid fa-unknown-icon');

        expect(markup).toContain('<svg');
        expect(markup).toContain('aria-hidden="true"');
    });
});
