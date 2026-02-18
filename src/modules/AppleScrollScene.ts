import { EventBus } from '../utils/events';
import { clamp } from '../utils/math';
import type { AppleScrollOptions } from '../types';


export class AppleScrollScene {
    #section: HTMLElement | null;
    #bgImage: HTMLElement | null;
    #mobileBreakpoint: number;
    #isMobile = false;
    #unsubscribeScroll: () => void;
    #unsubscribeResize: () => void;

    static CONSTANTS = {
        MAX_BLUR: 20,
        MAX_OPACITY: 0.9
    };

    constructor({ mobileBreakpoint = 768 }: AppleScrollOptions = {}) {
        this.#section = document.getElementById('apple-section');
        this.#bgImage = document.getElementById('apple-bg-image');
        this.#mobileBreakpoint = mobileBreakpoint;
        this.#isMobile = window.innerWidth < mobileBreakpoint;

        // Initialize empty cleanup functions in case elements aren't found
        this.#unsubscribeScroll = (): void => { };
        this.#unsubscribeResize = (): void => { };

        if (!this.#section || !this.#bgImage) {
            console.warn('[AppleScrollScene] Elements not found');
            return;
        }

        this.update = this.update.bind(this);

        this.#unsubscribeScroll = EventBus.on('scroll', ({ y }: { y: number }): void => { this.update(y); });
        this.#unsubscribeResize = EventBus.on('resize', ({ width }: { width: number }): void => {
            this.#isMobile = width < this.#mobileBreakpoint;
        });
    }

    update(_scrollY: number): void {
        void _scrollY;
        if (this.#isMobile || !this.#section) return;

        const rect = this.#section.getBoundingClientRect();
        const scrollYRelative = -rect.top;

        const sectionHeight = this.#section.offsetHeight;
        const windowHeight = window.innerHeight;
        // The "active" scroll range is the section height minus one viewport
        const endOffset = sectionHeight - windowHeight;

        if (scrollYRelative < -windowHeight || scrollYRelative > endOffset + windowHeight) return;

        let scrollProgress = 0;
        if (scrollYRelative >= 0 && scrollYRelative <= endOffset) {
            scrollProgress = scrollYRelative / endOffset;
        } else if (scrollYRelative > endOffset) {
            scrollProgress = 1;
        }

        scrollProgress = clamp(scrollProgress, 0, 1);

        const { MAX_BLUR, MAX_OPACITY } = AppleScrollScene.CONSTANTS;

        // Blur and overlay build up during the first 60% of scroll
        const darkenProgress = clamp(scrollProgress / 0.6, 0, 1);
        const blurValue = darkenProgress * MAX_BLUR;
        const overlayOpacity = darkenProgress * MAX_OPACITY;

        this.#section.style.setProperty('--apple-blur', `${blurValue}px`);
        // Updated CSS variable name to match new stylesheet
        this.#section.style.setProperty('--apple-overlay-opacity', `${overlayOpacity}`);

        this.#updateTextVisibility(scrollProgress);
    }

    #updateTextVisibility(progress: number): void {
        const heading = document.getElementById('apple-heading');
        const subheading = document.getElementById('apple-subheading');

        // Text only appears AFTER the image has darkened enough (>40% scroll)
        // This creates the Apple effect: image first, then text emerges from darkness
        const isVisible = progress > 0.4;
        const isSubVisible = progress > 0.52;

        if (heading) heading.classList.toggle('apple-text-visible', isVisible);
        if (subheading) subheading.classList.toggle('apple-text-visible', isSubVisible);
    }

    destroy(): void {
        this.#unsubscribeScroll();
        this.#unsubscribeResize();
    }
}

