import type { AppModule } from '../types';
import { EventBus } from '../utils/events';
import { debounce } from '../utils/math';
import { qsa } from '../utils/dom';
import { NavbarController } from '../modules/NavbarController';
import { ParallaxEngine } from '../modules/ParallaxEngine';
import { TrackingForm } from '../modules/TrackingForm';
import { AppleScrollScene } from '../modules/AppleScrollScene';
import { Ticker } from '../modules/Ticker';
import { CounterAnimation } from '../modules/CounterAnimation';
import { ScrollReveal } from '../modules/ScrollReveal';
import { HorizontalCarousel } from '../modules/HorizontalCarousel';
import { StickyFeatureList } from '../modules/StickyFeatureList';
import { TruckScrollScene } from '../modules/TruckScrollScene';
import { ContentHydrator } from '../modules/ContentHydrator';
import { HeroCinematicEffects } from '../modules/HeroCinematicEffects';
import { ServiceCardMotion } from '../modules/ServiceCardMotion';
import { assertCriticalDomContract } from './DomContractValidator';

export class App {
    #modules: AppModule[] = [];
    #disposers: Array<() => void> = [];
    #isStarted = false;
    #isDestroyed = false;
    #scrollTicking = false;
    #lastScrollY = 0;

    init(): void {
        if (this.#isStarted) return;

        // Fail fast if the static HTML contract was broken by manual edits.
        assertCriticalDomContract();
        this.#isStarted = true;

        const contentHydrator = new ContentHydrator();
        contentHydrator.init();

        const heroSectionEl = document.getElementById('hero-section');
        this.#mount(heroSectionEl ? new HeroCinematicEffects() : null);

        const servicesGridEl = document.getElementById('services-grid');
        this.#mount(servicesGridEl ? new ServiceCardMotion() : null);

        const navbarEl = document.getElementById('navbar');
        this.#mount(navbarEl ? new NavbarController(navbarEl) : null);

        const parallaxEls = document.querySelectorAll('.parallax-img');
        const parallax = this.#mount(
            parallaxEls.length > 0 ? new ParallaxEngine({ mobileBreakpoint: 768 }) : null
        );

        const trackingFormEl = document.querySelector<HTMLFormElement>('#tracking-form');
        this.#mount(trackingFormEl ? new TrackingForm(trackingFormEl) : null);

        const appleSectionEl = document.getElementById('apple-section');
        this.#mount(appleSectionEl ? new AppleScrollScene({ mobileBreakpoint: 768 }) : null);

        const carouselEl = document.getElementById('features-carousel');
        this.#mount(carouselEl ? new HorizontalCarousel() : null);

        const universityFeaturesEl = document.getElementById('university-features');
        this.#mount(universityFeaturesEl ? new StickyFeatureList() : null);

        const truckSceneEl = document.getElementById('truck-scene');
        this.#mount(truckSceneEl ? new TruckScrollScene() : null);

        const tickerContainerEl = document.getElementById('ticker-container');
        this.#mount(tickerContainerEl ? new Ticker() : null);

        const counterEls = document.querySelectorAll('.counter');
        this.#mount(counterEls.length > 0 ? new CounterAnimation() : null);

        const revealEls = document.querySelectorAll('.reveal');
        this.#mount(revealEls.length > 0 ? new ScrollReveal() : null);

        if (parallax instanceof ParallaxEngine) {
            qsa('.parallax-img').forEach((img) => {
                if (img.parentElement) {
                    parallax.register(img.parentElement, { speed: 0.15 });
                }
            });
        }

        this.#registerWindowListeners();
        this.#emitInitialResize();
    }

    destroy(): void {
        if (this.#isDestroyed) return;
        this.#isDestroyed = true;

        while (this.#modules.length > 0) {
            const module = this.#modules.pop();
            module?.destroy();
        }

        while (this.#disposers.length > 0) {
            const dispose = this.#disposers.pop();
            dispose?.();
        }
    }

    #mount<T extends AppModule>(module: T | null): T | null {
        if (!module) return null;
        if (typeof module.init === 'function') {
            module.init();
        }
        this.#modules.push(module);
        return module;
    }

    #registerWindowListeners(): void {
        this.#lastScrollY = window.scrollY;

        const onScroll = (): void => {
            if (this.#scrollTicking) return;

            this.#scrollTicking = true;
            window.requestAnimationFrame(() => {
                const y = window.scrollY;
                const delta = y - this.#lastScrollY;
                const direction: 'up' | 'down' = delta < 0 ? 'up' : 'down';

                EventBus.emit('scroll', { y, direction, delta });
                this.#lastScrollY = y;
                this.#scrollTicking = false;
            });
        };

        const onResize = debounce((): void => {
            EventBus.emit('resize', {
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }, 150);

        const onBeforeUnload = (): void => {
            this.destroy();
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        window.addEventListener('beforeunload', onBeforeUnload);

        this.#disposers.push(() => window.removeEventListener('scroll', onScroll));
        this.#disposers.push(() => window.removeEventListener('resize', onResize));
        this.#disposers.push(() => window.removeEventListener('beforeunload', onBeforeUnload));
    }

    #emitInitialResize(): void {
        EventBus.emit('resize', {
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }
}
