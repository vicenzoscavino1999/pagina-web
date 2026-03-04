import { beforeEach, describe, expect, it } from 'vitest';
import { HorizontalCarousel } from '@modules/HorizontalCarousel';

describe('HorizontalCarousel', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section id="features-carousel">
                <div id="carousel-track">
                    <div class="carousel-slide" id="slide-1" role="tabpanel"></div>
                    <div class="carousel-slide" id="slide-2" role="tabpanel"></div>
                    <div class="carousel-slide" id="slide-3" role="tabpanel"></div>
                </div>
            </section>
            <button class="carousel-dot" id="dot-1"></button>
            <button class="carousel-dot" id="dot-2"></button>
            <button class="carousel-dot" id="dot-3"></button>
            <button id="carousel-prev"></button>
            <button id="carousel-next"></button>
        `;
    });

    it('soporta navegacion por teclado en dots (Arrow, Home, End, Enter)', () => {
        new HorizontalCarousel();

        const dots = document.querySelectorAll<HTMLElement>('.carousel-dot');
        const slides = document.querySelectorAll<HTMLElement>('.carousel-slide');

        dots[0]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
        expect(slides[1]?.classList.contains('slide--active')).toBe(true);
        expect(dots[1]?.getAttribute('aria-selected')).toBe('true');
        expect(document.activeElement).toBe(dots[1]);

        dots[1]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
        expect(slides[2]?.classList.contains('slide--active')).toBe(true);
        expect(dots[2]?.getAttribute('aria-selected')).toBe('true');

        dots[2]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Home' }));
        expect(slides[0]?.classList.contains('slide--enter-left')).toBe(true);
        expect(dots[0]?.getAttribute('aria-selected')).toBe('true');

        dots[1]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
        expect(slides[1]?.classList.contains('slide--active')).toBe(true);
    });

    it('limpia listeners al destruirse', () => {
        const carousel = new HorizontalCarousel();

        const nextButton = document.getElementById('carousel-next') as HTMLButtonElement;
        const slides = document.querySelectorAll<HTMLElement>('.carousel-slide');

        carousel.destroy();
        nextButton.click();

        expect(slides[0]?.classList.contains('slide--active')).toBe(true);
        expect(slides[1]?.classList.contains('slide--active')).toBe(false);
    });
});
