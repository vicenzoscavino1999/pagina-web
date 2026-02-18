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

document.addEventListener('DOMContentLoaded', (): void => {
    // --- Navbar ---
    const navbarEl = document.getElementById('navbar');
    const navbar = navbarEl ? new NavbarController(navbarEl) : null;

    // --- Scroll Reveal ---
    const revealEls = document.querySelectorAll('.reveal');
    const scrollReveal = revealEls.length > 0 ? new ScrollReveal() : null;
    scrollReveal?.init();

    // --- Parallax ---
    const parallaxEls = document.querySelectorAll('.parallax-img');
    const parallax = parallaxEls.length > 0 ? new ParallaxEngine({ mobileBreakpoint: 768 }) : null;

    // --- Tracking Form ---
    const trackingFormEl = document.querySelector<HTMLFormElement>('#tracking-form');
    const tracking = trackingFormEl ? new TrackingForm(trackingFormEl) : null;

    // --- Apple Scroll Scene ---
    const appleSectionEl = document.getElementById('apple-section');
    const appleScene = appleSectionEl ? new AppleScrollScene({ mobileBreakpoint: 768 }) : null;

    // --- Ticker ---
    const tickerContainerEl = document.getElementById('ticker-container');
    const ticker = tickerContainerEl ? new Ticker() : null;

    // --- Counter Animation ---
    const counterEls = document.querySelectorAll('.counter');
    const counters = counterEls.length > 0 ? new CounterAnimation() : null;

    // Register Parallax Elements
    if (parallax) {
        qsa('.parallax-img').forEach(img => {
            if (img.parentElement) {
                parallax.register(img.parentElement, { speed: 0.15 });
            }
        });
    }

    // Initialize Ticker
    ticker?.init();

    // Global Scroll Listener
    let ticking = false;
    window.addEventListener('scroll', (): void => {
        if (!ticking) {
            window.requestAnimationFrame((): void => {
                EventBus.emit('scroll', { y: window.scrollY });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Global Resize Listener
    window.addEventListener('resize', debounce((): void => {
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
    window.addEventListener('beforeunload', (): void => {
        navbar?.destroy();
        parallax?.destroy();
        tracking?.destroy();
        appleScene?.destroy();
        ticker?.destroy();
        counters?.destroy();
        scrollReveal?.destroy();
    });
});
