import type { AppModule } from '../types';
import { qsa } from '../utils/dom';
import { HeroCinematicEffects } from '../modules/HeroCinematicEffects';
import { NavbarController } from '../modules/NavbarController';
import { ParallaxEngine } from '../modules/ParallaxEngine';
import { AppleScrollScene } from '../modules/AppleScrollScene';
import { FlowScrollScene } from '../modules/FlowScrollScene';
import { HorizontalCarousel } from '../modules/HorizontalCarousel';
import { ServicesScrollScene } from '../modules/ServicesScrollScene';
import { ServiceCardMotion } from '../modules/ServiceCardMotion';
import { StickyFeatureList } from '../modules/StickyFeatureList';
import { SmoothScrollController } from '../modules/SmoothScrollController';
import { TrackingForm } from '../modules/TrackingForm';
import { TruckScrollScene } from '../modules/TruckScrollScene';
import { LazyModule } from './LazyModule';

export interface AppModuleRegistration<T extends AppModule = AppModule> {
    id: string;
    phase?: 'critical' | 'deferred';
    isEnabled(documentRoot?: Document): boolean;
    create(documentRoot?: Document): T;
    afterMount?(module: T, documentRoot?: Document): void;
}

type ModulePredicate = (documentRoot: Document) => boolean;

function hasElementById(id: string): ModulePredicate {
    return (documentRoot: Document): boolean => Boolean(documentRoot.getElementById(id));
}

function hasAnyBySelector(selector: string): ModulePredicate {
    return (documentRoot: Document): boolean => documentRoot.querySelectorAll(selector).length > 0;
}

function createRegistration<T extends AppModule>(options: {
    id: string;
    phase?: 'critical' | 'deferred';
    when: ModulePredicate;
    create(documentRoot: Document): T;
    afterMount?(module: T, documentRoot: Document): void;
}): AppModuleRegistration<T> {
    const registration: AppModuleRegistration<T> = {
        id: options.id,
        isEnabled(documentRoot: Document = document): boolean {
            return options.when(documentRoot);
        },
        create(documentRoot: Document = document): T {
            return options.create(documentRoot);
        },
    };

    if (options.phase) {
        registration.phase = options.phase;
    }

    if (options.afterMount) {
        registration.afterMount = (module: T, documentRoot: Document = document): void => {
                options.afterMount?.(module, documentRoot);
        };
    }

    return registration;
}

const APP_MODULE_REGISTRATIONS: readonly AppModuleRegistration[] = [
    createRegistration({
        id: 'smooth-scroll',
        when: (documentRoot) => Boolean(documentRoot.body),
        create: () => new SmoothScrollController(),
    }),
    createRegistration({
        id: 'hero-effects',
        when: hasElementById('hero-section'),
        create: () => new HeroCinematicEffects(),
    }),
    createRegistration({
        id: 'services-scroll-scene',
        when: hasElementById('servicios'),
        create: () => new ServicesScrollScene(),
    }),
    createRegistration({
        id: 'flow-scroll-scene',
        when: hasElementById('flow-steps'),
        create: () => new FlowScrollScene(),
    }),
    createRegistration({
        id: 'service-card-motion',
        when: hasElementById('services-grid'),
        create: () => new ServiceCardMotion(),
    }),
    createRegistration({
        id: 'navbar',
        when: hasElementById('navbar'),
        create: (documentRoot) => new NavbarController(documentRoot.getElementById('navbar') as HTMLElement),
    }),
    createRegistration({
        id: 'parallax',
        phase: 'deferred',
        when: hasAnyBySelector('.parallax-img'),
        create: () => new ParallaxEngine({ mobileBreakpoint: 768 }),
        afterMount: (module, documentRoot): void => {
            if (!(module instanceof ParallaxEngine)) return;

            qsa('.parallax-img', documentRoot).forEach((img) => {
                if (img.parentElement) {
                    module.register(img.parentElement, { speed: 0.15 });
                }
            });
        },
    }),
    createRegistration({
        id: 'tracking-form',
        when: hasElementById('tracking-form'),
        create: (documentRoot) =>
            new TrackingForm(documentRoot.querySelector<HTMLFormElement>('#tracking-form')),
    }),
    createRegistration({
        id: 'apple-scroll-scene',
        when: hasElementById('apple-section'),
        create: () => new AppleScrollScene({ mobileBreakpoint: 768 }),
    }),
    createRegistration({
        id: 'horizontal-carousel',
        when: hasElementById('features-carousel'),
        create: () => new HorizontalCarousel(),
    }),
    createRegistration({
        id: 'sticky-feature-list',
        when: hasElementById('university-features'),
        create: () => new StickyFeatureList(),
    }),
    createRegistration({
        id: 'truck-scroll-scene',
        when: hasElementById('truck-scene'),
        create: () => new TruckScrollScene(),
    }),
    createRegistration({
        id: 'ticker',
        phase: 'deferred',
        when: hasElementById('ticker-container'),
        create: () =>
            new LazyModule('ticker', async () => {
                const { Ticker } = await import('../modules/Ticker');
                return new Ticker();
            }),
    }),
    createRegistration({
        id: 'counter-animation',
        phase: 'deferred',
        when: hasAnyBySelector('.counter'),
        create: () =>
            new LazyModule('counter-animation', async () => {
                const { CounterAnimation } = await import('../modules/CounterAnimation');
                return new CounterAnimation();
            }),
    }),
    createRegistration({
        id: 'scroll-reveal',
        phase: 'deferred',
        when: hasAnyBySelector('.reveal'),
        create: () =>
            new LazyModule('scroll-reveal', async () => {
                const { ScrollReveal } = await import('../modules/ScrollReveal');
                return new ScrollReveal();
            }),
    }),
] as const;

export function getAppModuleRegistrations(): readonly AppModuleRegistration[] {
    return APP_MODULE_REGISTRATIONS;
}
