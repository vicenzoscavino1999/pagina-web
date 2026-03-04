import { clamp } from '../utils/math';
import { getCarouselSwipeStep } from './carousel/gesture';
import { applyCarouselViewState } from './carousel/view';

export class HorizontalCarousel {
    #section: HTMLElement | null;
    #track: HTMLElement | null;
    #slides: NodeListOf<HTMLElement>;
    #dots: NodeListOf<HTMLElement>;
    #prevBtn: HTMLElement | null;
    #nextBtn: HTMLElement | null;
    #currentIndex: number = 0;
    #totalSlides: number = 0;
    #startX: number = 0;
    #isDragging: boolean = false;
    #dragThreshold: number = 60;

    #handlePrev: () => void;
    #handleNext: () => void;
    #handleTouchStart: (e: TouchEvent) => void;
    #handleTouchEnd: (e: TouchEvent) => void;
    #handleMouseDown: (e: MouseEvent) => void;
    #handleMouseUp: (e: MouseEvent) => void;
    #dotHandlers: Array<{ clickHandler: () => void; dot: HTMLElement; keydownHandler: (e: KeyboardEvent) => void }> = [];

    constructor() {
        this.#section = document.getElementById('features-carousel');
        this.#track = document.getElementById('carousel-track');
        this.#slides = document.querySelectorAll<HTMLElement>('.carousel-slide');
        this.#dots = document.querySelectorAll<HTMLElement>('.carousel-dot');
        this.#prevBtn = document.getElementById('carousel-prev');
        this.#nextBtn = document.getElementById('carousel-next');
        this.#totalSlides = this.#slides.length;

        if (!this.#section || !this.#track || this.#totalSlides === 0) {
            console.warn('[HorizontalCarousel] Elements not found');
            this.#handlePrev = (): void => { };
            this.#handleNext = (): void => { };
            this.#handleTouchStart = (): void => { };
            this.#handleTouchEnd = (): void => { };
            this.#handleMouseDown = (): void => { };
            this.#handleMouseUp = (): void => { };
            return;
        }

        this.#handlePrev = (): void => this.#goTo(this.#currentIndex - 1);
        this.#handleNext = (): void => this.#goTo(this.#currentIndex + 1);
        this.#handleTouchStart = (event: TouchEvent): void => {
            const touch = event.touches[0];
            if (!touch) return;

            this.#startX = touch.clientX;
            this.#isDragging = true;
        };
        this.#handleTouchEnd = (event: TouchEvent): void => {
            if (!this.#isDragging) return;

            const touch = event.changedTouches[0];
            if (!touch) return;

            this.#applySwipe(touch.clientX);
        };
        this.#handleMouseDown = (event: MouseEvent): void => {
            this.#startX = event.clientX;
            this.#isDragging = true;
        };
        this.#handleMouseUp = (event: MouseEvent): void => {
            if (!this.#isDragging) return;
            this.#applySwipe(event.clientX);
        };

        this.#prevBtn?.addEventListener('click', this.#handlePrev);
        this.#nextBtn?.addEventListener('click', this.#handleNext);
        this.#section.addEventListener('touchstart', this.#handleTouchStart, { passive: true });
        this.#section.addEventListener('touchend', this.#handleTouchEnd, { passive: true });
        this.#track.addEventListener('mousedown', this.#handleMouseDown);
        window.addEventListener('mouseup', this.#handleMouseUp);

        this.#dots.forEach((dot, index) => {
            const clickHandler = (): void => this.#goTo(index);
            const keydownHandler = (event: KeyboardEvent): void => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.#goTo(index);
                    return;
                }

                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    const nextIndex = clamp(index + 1, 0, this.#totalSlides - 1);
                    this.#goTo(nextIndex);
                    this.#focusDot(nextIndex);
                    return;
                }

                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    const prevIndex = clamp(index - 1, 0, this.#totalSlides - 1);
                    this.#goTo(prevIndex);
                    this.#focusDot(prevIndex);
                    return;
                }

                if (event.key === 'Home') {
                    event.preventDefault();
                    this.#goTo(0);
                    this.#focusDot(0);
                    return;
                }

                if (event.key === 'End') {
                    event.preventDefault();
                    const lastIndex = this.#totalSlides - 1;
                    this.#goTo(lastIndex);
                    this.#focusDot(lastIndex);
                }
            };
            this.#dotHandlers.push({ clickHandler, dot, keydownHandler });
            dot.addEventListener('click', clickHandler);
            dot.addEventListener('keydown', keydownHandler);
        });

        this.#goTo(0);
    }

    #applySwipe(endX: number): void {
        const step = getCarouselSwipeStep(this.#startX, endX, this.#dragThreshold);
        if (step !== 0) {
            this.#goTo(this.#currentIndex + step);
        }

        this.#isDragging = false;
    }

    #goTo(index: number): void {
        const prevIndex = this.#currentIndex;
        this.#currentIndex = clamp(index, 0, this.#totalSlides - 1);

        applyCarouselViewState(
            {
                track: this.#track,
                slides: this.#slides,
                dots: this.#dots,
                prevButton: this.#prevBtn,
                nextButton: this.#nextBtn,
            },
            this.#currentIndex,
            prevIndex,
            this.#totalSlides,
        );
    }

    #focusDot(index: number): void {
        this.#dots[index]?.focus();
    }

    destroy(): void {
        this.#prevBtn?.removeEventListener('click', this.#handlePrev);
        this.#nextBtn?.removeEventListener('click', this.#handleNext);
        this.#section?.removeEventListener('touchstart', this.#handleTouchStart);
        this.#section?.removeEventListener('touchend', this.#handleTouchEnd);
        this.#track?.removeEventListener('mousedown', this.#handleMouseDown);
        window.removeEventListener('mouseup', this.#handleMouseUp);

        this.#dotHandlers.forEach(({ clickHandler, dot, keydownHandler }) => {
            dot.removeEventListener('click', clickHandler);
            dot.removeEventListener('keydown', keydownHandler);
        });
    }
}
