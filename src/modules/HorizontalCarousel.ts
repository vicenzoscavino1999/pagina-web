import { clamp } from '../utils/math';

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
        this.#handleTouchStart = (e: TouchEvent): void => {
            const touch = e.touches[0];
            if (!touch) return;
            this.#startX = touch.clientX;
            this.#isDragging = true;
        };
        this.#handleTouchEnd = (e: TouchEvent): void => {
            if (!this.#isDragging) return;
            const touch = e.changedTouches[0];
            if (!touch) return;
            const diffX = this.#startX - touch.clientX;
            if (Math.abs(diffX) > this.#dragThreshold) {
                this.#goTo(this.#currentIndex + (diffX > 0 ? 1 : -1));
            }
            this.#isDragging = false;
        };
        this.#handleMouseDown = (e: MouseEvent): void => {
            this.#startX = e.clientX;
            this.#isDragging = true;
        };
        this.#handleMouseUp = (e: MouseEvent): void => {
            if (!this.#isDragging) return;
            const diffX = this.#startX - e.clientX;
            if (Math.abs(diffX) > this.#dragThreshold) {
                this.#goTo(this.#currentIndex + (diffX > 0 ? 1 : -1));
            }
            this.#isDragging = false;
        };

        this.#prevBtn?.addEventListener('click', this.#handlePrev);
        this.#nextBtn?.addEventListener('click', this.#handleNext);
        this.#section.addEventListener('touchstart', this.#handleTouchStart, { passive: true });
        this.#section.addEventListener('touchend', this.#handleTouchEnd, { passive: true });
        this.#track.addEventListener('mousedown', this.#handleMouseDown);
        window.addEventListener('mouseup', this.#handleMouseUp);

        this.#dots.forEach((dot, i) => {
            dot.addEventListener('click', (): void => this.#goTo(i));
        });

        this.#goTo(0);
    }

    #goTo(index: number): void {
        const prevIndex = this.#currentIndex;
        this.#currentIndex = clamp(index, 0, this.#totalSlides - 1);
        const goingForward = this.#currentIndex >= prevIndex;

        if (this.#track) {
            this.#track.style.transform = `translateX(-${this.#currentIndex * 100}%)`;
        }

        this.#dots.forEach((dot, i) => {
            dot.classList.toggle('carousel-dot--active', i === this.#currentIndex);
        });

        // Animate slide content with direction-aware entrance class
        this.#slides.forEach((slide, i) => {
            slide.classList.remove('slide--active', 'slide--enter-left');

            if (i === this.#currentIndex) {
                // Force reflow so animation re-triggers
                void slide.offsetHeight;
                slide.classList.add(goingForward ? 'slide--active' : 'slide--enter-left');
            }
        });

        if (this.#prevBtn) {
            this.#prevBtn.classList.toggle('btn--disabled', this.#currentIndex === 0);
        }
        if (this.#nextBtn) {
            this.#nextBtn.classList.toggle('btn--disabled', this.#currentIndex === this.#totalSlides - 1);
        }
    }

    destroy(): void {
        this.#prevBtn?.removeEventListener('click', this.#handlePrev);
        this.#nextBtn?.removeEventListener('click', this.#handleNext);
        this.#section?.removeEventListener('touchstart', this.#handleTouchStart);
        this.#section?.removeEventListener('touchend', this.#handleTouchEnd);
        this.#track?.removeEventListener('mousedown', this.#handleMouseDown);
        window.removeEventListener('mouseup', this.#handleMouseUp);
    }
}
