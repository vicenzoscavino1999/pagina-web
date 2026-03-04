import { beforeEach, describe, expect, it } from 'vitest';
import { getCarouselSwipeStep } from '../src/modules/carousel/gesture';
import { applyCarouselViewState } from '../src/modules/carousel/view';

describe('carousel helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('detecta el paso del swipe solo si supera el umbral', () => {
        expect(getCarouselSwipeStep(300, 200, 60)).toBe(1);
        expect(getCarouselSwipeStep(200, 300, 60)).toBe(-1);
        expect(getCarouselSwipeStep(200, 160, 60)).toBe(0);
    });

    it('actualiza transform, dots y clases de slides segun la direccion', () => {
        document.body.innerHTML = `
            <div id="carousel-track"></div>
            <div class="carousel-slide" id="slide-1" role="tabpanel"></div>
            <div class="carousel-slide" id="slide-2" role="tabpanel"></div>
            <div class="carousel-slide" id="slide-3" role="tabpanel"></div>
            <button class="carousel-dot"></button>
            <button class="carousel-dot"></button>
            <button class="carousel-dot"></button>
            <button id="carousel-prev"></button>
            <button id="carousel-next"></button>
        `;

        const track = document.getElementById('carousel-track');
        const slides = document.querySelectorAll<HTMLElement>('.carousel-slide');
        const dots = document.querySelectorAll<HTMLElement>('.carousel-dot');
        const prevButton = document.getElementById('carousel-prev');
        const nextButton = document.getElementById('carousel-next');

        applyCarouselViewState(
            {
                track,
                slides,
                dots,
                prevButton,
                nextButton,
            },
            1,
            0,
            3,
        );

        expect(track?.style.transform).toBe('translateX(-100%)');
        expect(dots[1]?.classList.contains('carousel-dot--active')).toBe(true);
        expect(dots[1]?.getAttribute('aria-selected')).toBe('true');
        expect(dots[1]?.getAttribute('tabindex')).toBe('0');
        expect(dots[0]?.getAttribute('aria-selected')).toBe('false');
        expect(dots[0]?.getAttribute('tabindex')).toBe('-1');
        expect(slides[1]?.classList.contains('slide--active')).toBe(true);
        expect(slides[1]?.getAttribute('aria-hidden')).toBe('false');
        expect(slides[0]?.getAttribute('aria-hidden')).toBe('true');
        expect(prevButton?.classList.contains('btn--disabled')).toBe(false);
        expect(nextButton?.classList.contains('btn--disabled')).toBe(false);
        expect((prevButton as HTMLButtonElement).disabled).toBe(false);
        expect((nextButton as HTMLButtonElement).disabled).toBe(false);

        applyCarouselViewState(
            {
                track,
                slides,
                dots,
                prevButton,
                nextButton,
            },
            0,
            1,
            3,
        );

        expect(slides[0]?.classList.contains('slide--enter-left')).toBe(true);
        expect(prevButton?.classList.contains('btn--disabled')).toBe(true);
        expect((prevButton as HTMLButtonElement).disabled).toBe(true);
        expect(prevButton?.getAttribute('aria-disabled')).toBe('true');
    });
});
