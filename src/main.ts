import { NavbarController } from './modules/NavbarController';
import { ParallaxEngine } from './modules/ParallaxEngine';
import { TrackingForm } from './modules/TrackingForm';
import { AppleScrollScene } from './modules/AppleScrollScene';
import { Ticker } from './modules/Ticker';
import { CounterAnimation } from './modules/CounterAnimation';
import { ScrollReveal } from './modules/ScrollReveal';
import { EventBus } from './utils/events';
import { debounce } from './utils/math';
import { qsa } from './utils/dom';

document.addEventListener('DOMContentLoaded', () => {
    const navbarEl = document.getElementById('navbar');
    // Using simple modules, we can keep references if needed, but for now just init
    const navbar = navbarEl ? new NavbarController(navbarEl) : null;

    const scrollReveal = new ScrollReveal();
    scrollReveal.init();

    const parallax = new ParallaxEngine({ mobileBreakpoint: 768 });

    const trackingFormEl = document.getElementById('tracking-form');
    const tracking = trackingFormEl ? new TrackingForm(trackingFormEl) : null;

    const appleScene = new AppleScrollScene({ mobileBreakpoint: 768 });
    const ticker = new Ticker();
    const counters = new CounterAnimation();

    // Register Parallax Elements
    qsa('.parallax-img').forEach(img => {
        if (img.parentElement) {
            parallax.register(img.parentElement, { speed: 0.15 });
        }
    });

    // Initialize Ticker
    ticker.init();

    // Global Scroll Listener
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                EventBus.emit('scroll', { y: window.scrollY });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Global Resize Listener
    window.addEventListener('resize', debounce(() => {
        EventBus.emit('resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }, 150));

    // Initial trigger
    EventBus.emit('resize', {
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Cleanup
    window.addEventListener('beforeunload', () => {
        navbar?.destroy();
        parallax.destroy();
        tracking?.destroy();
        appleScene.destroy();
        ticker.destroy();
        counters.destroy();
        scrollReveal.destroy();
    });
});
