import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceCardMotion } from '../src/modules/ServiceCardMotion';

const originalMatchMedia = window.matchMedia;

interface ServicesDomOptions {
    includeSection?: boolean;
    firstKind?: string;
    secondCard?: boolean;
    secondKind?: string;
}

function mockMatchMedia({
    fine = true,
    reduced = false,
}: {
    fine?: boolean;
    reduced?: boolean;
} = {}): void {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches:
            query === '(prefers-reduced-motion: reduce)'
                ? reduced
                : query === '(pointer: fine)'
                  ? fine
                  : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia;
}

function serviceKindAttribute(kind?: string): string {
    return kind ? ` data-service-kind="${kind}"` : '';
}

function renderServicesDom({
    includeSection = true,
    firstKind = 'docs',
    secondCard = false,
    secondKind = 'parcel',
}: ServicesDomOptions = {}): {
    cards: HTMLElement[];
    section: HTMLElement | null;
} {
    const cardsMarkup = [
        `<article class="service-card" data-service-card${serviceKindAttribute(firstKind)}>
            <div data-service-depth="0.5"></div>
            <div data-service-depth="bad-depth"></div>
        </article>`,
        secondCard
            ? `<article class="service-card" data-service-card${serviceKindAttribute(secondKind)}>
                <div data-service-depth="0.25"></div>
            </article>`
            : '',
    ].join('');

    document.body.innerHTML = includeSection
        ? `<section id="servicios"><div id="services-grid">${cardsMarkup}</div></section>`
        : `<div id="services-grid">${cardsMarkup}</div>`;

    return {
        cards: Array.from(document.querySelectorAll<HTMLElement>('[data-service-card]')),
        section: document.getElementById('servicios'),
    };
}

function mockRect(element: HTMLElement, rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): void {
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        bottom: rect.top + rect.height,
        height: rect.height,
        left: rect.left,
        right: rect.left + rect.width,
        top: rect.top,
        width: rect.width,
        x: rect.left,
        y: rect.top,
        toJSON: () => '',
    } as DOMRect);
}

function dispatchPointer(
    element: HTMLElement,
    type: 'pointerenter' | 'pointermove' | 'pointerleave',
    position: { clientX?: number; clientY?: number } = {}
): void {
    element.dispatchEvent(new MouseEvent(type, { bubbles: true, ...position }));
}

describe('ServiceCardMotion', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        window.matchMedia = originalMatchMedia;
    });

    it('no inicializa interacciones si el usuario prefiere reduced motion', () => {
        const { cards } = renderServicesDom();
        const [card] = cards;
        mockMatchMedia({ fine: true, reduced: true });

        const requestFrameSpy = vi.spyOn(window, 'requestAnimationFrame');
        const motion = new ServiceCardMotion();
        motion.init();

        dispatchPointer(card as HTMLElement, 'pointerenter', { clientX: 320, clientY: 280 });

        expect(requestFrameSpy).not.toHaveBeenCalled();
        expect(card?.classList.contains('is-interacting')).toBe(false);

        motion.destroy();
    });

    it('activa spotlight y motion al interactuar con una tarjeta', () => {
        const { cards, section } = renderServicesDom();
        const [card] = cards;
        mockMatchMedia();

        const requestFrameSpy = vi
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((callback: FrameRequestCallback): number => {
                callback(0);
                return 1;
            });

        mockRect(card as HTMLElement, { top: 120, left: 80, width: 300, height: 240 });
        mockRect(section as HTMLElement, { top: 0, left: 0, width: 1280, height: 900 });

        const motion = new ServiceCardMotion();
        motion.init();

        dispatchPointer(card as HTMLElement, 'pointerenter', { clientX: 320, clientY: 280 });

        expect(requestFrameSpy).toHaveBeenCalled();
        expect(card?.classList.contains('is-interacting')).toBe(true);
        expect(card?.classList.contains('is-active-service')).toBe(true);
        expect(card?.style.getPropertyValue('--svc-tilt-y')).not.toBe('');
        expect(card?.style.getPropertyValue('--svc-layer-x')).toBe('');
        expect(section?.style.getPropertyValue('--services-spotlight-opacity')).not.toBe('');

        dispatchPointer(card as HTMLElement, 'pointerleave');

        expect(card?.classList.contains('is-active-service')).toBe(false);
        expect(card?.style.getPropertyValue('--svc-tilt-y')).toBe('0deg');
        expect(section?.style.getPropertyValue('--services-spotlight-opacity')).toBe('0');

        motion.destroy();
    });

    it('coalesce updates por RAF y limpia clases al destruirse durante una interaccion', () => {
        const { cards, section } = renderServicesDom();
        const [card] = cards;
        mockMatchMedia();

        const requestFrameSpy = vi
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((): number => 21);
        const cancelFrameSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);

        mockRect(card as HTMLElement, { top: 120, left: 80, width: 300, height: 240 });
        mockRect(section as HTMLElement, { top: 0, left: 0, width: 1280, height: 900 });

        const motion = new ServiceCardMotion();
        motion.init();

        dispatchPointer(card as HTMLElement, 'pointerenter', { clientX: 320, clientY: 280 });
        dispatchPointer(card as HTMLElement, 'pointermove', { clientX: 340, clientY: 300 });

        expect(requestFrameSpy).toHaveBeenCalledTimes(1);
        expect(card?.classList.contains('is-interacting')).toBe(true);
        expect(card?.classList.contains('is-active-service')).toBe(true);

        motion.destroy();

        expect(cancelFrameSpy).toHaveBeenCalledWith(21);
        expect(card?.classList.contains('is-interacting')).toBe(false);
        expect(card?.classList.contains('is-active-service')).toBe(false);
        expect(card?.style.getPropertyValue('--svc-tilt-y')).toBe('0deg');
        expect(section?.style.getPropertyValue('--services-spotlight-opacity')).toBe('0');

        dispatchPointer(card as HTMLElement, 'pointerenter', { clientX: 350, clientY: 320 });
        expect(requestFrameSpy).toHaveBeenCalledTimes(1);
    });

    it('cambia la tarjeta activa y usa el kind por defecto cuando falta data-service-kind', () => {
        const { cards, section } = renderServicesDom({
            firstKind: '',
            secondCard: true,
            secondKind: 'parcel',
        });
        const [firstCard, secondCard] = cards;
        mockMatchMedia();

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback): number => {
            callback(0);
            return 1;
        });

        mockRect(firstCard as HTMLElement, { top: 120, left: 80, width: 300, height: 240 });
        mockRect(secondCard as HTMLElement, { top: 120, left: 420, width: 300, height: 240 });
        mockRect(section as HTMLElement, { top: 0, left: 0, width: 1280, height: 900 });

        const motion = new ServiceCardMotion();
        motion.init();

        dispatchPointer(firstCard as HTMLElement, 'pointerenter', { clientX: 280, clientY: 250 });
        expect(firstCard?.classList.contains('is-active-service')).toBe(true);
        expect(secondCard?.classList.contains('is-active-service')).toBe(false);
        expect(section?.style.getPropertyValue('--services-accent')).toBe('rgba(56, 189, 248, 0.24)');

        dispatchPointer(secondCard as HTMLElement, 'pointerenter', { clientX: 560, clientY: 250 });
        expect(firstCard?.classList.contains('is-active-service')).toBe(false);
        expect(secondCard?.classList.contains('is-active-service')).toBe(true);
        expect(section?.style.getPropertyValue('--services-accent')).toBe('rgba(96, 165, 250, 0.24)');

        motion.destroy();
    });

    it('aplica motion de tarjeta aunque la seccion de servicios no exista', () => {
        const { cards } = renderServicesDom({ includeSection: false });
        const [card] = cards;
        const firstLayer = card?.querySelector<HTMLElement>('[data-service-depth]');
        mockMatchMedia();

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback): number => {
            callback(0);
            return 1;
        });

        mockRect(card as HTMLElement, { top: 120, left: 80, width: 300, height: 240 });

        const motion = new ServiceCardMotion();
        motion.init();

        dispatchPointer(card as HTMLElement, 'pointerenter', { clientX: 320, clientY: 280 });

        expect(card?.style.getPropertyValue('--svc-tilt-y')).not.toBe('');
        expect(firstLayer?.style.getPropertyValue('--svc-layer-x')).not.toBe('');

        dispatchPointer(card as HTMLElement, 'pointerleave');
        expect(card?.style.getPropertyValue('--svc-tilt-y')).toBe('0deg');

        motion.destroy();
    });

    it('omite el spotlight si la seccion no tiene medidas utiles', () => {
        const { cards, section } = renderServicesDom();
        const [card] = cards;
        mockMatchMedia();

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback): number => {
            callback(0);
            return 1;
        });

        mockRect(card as HTMLElement, { top: 120, left: 80, width: 300, height: 240 });
        mockRect(section as HTMLElement, { top: 0, left: 0, width: 0, height: 0 });

        const motion = new ServiceCardMotion();
        motion.init();

        dispatchPointer(card as HTMLElement, 'pointerenter', { clientX: 320, clientY: 280 });

        expect(card?.style.getPropertyValue('--svc-tilt-y')).not.toBe('');
        expect(section?.style.getPropertyValue('--services-spotlight-opacity')).toBe('');

        dispatchPointer(card as HTMLElement, 'pointerleave');
        expect(section?.style.getPropertyValue('--services-spotlight-opacity')).toBe('0');

        motion.destroy();
    });

    it('omite el motion si la tarjeta no tiene medidas utiles', () => {
        const { cards, section } = renderServicesDom();
        const [card] = cards;
        mockMatchMedia();

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback): number => {
            callback(0);
            return 1;
        });

        mockRect(card as HTMLElement, { top: 120, left: 80, width: 0, height: 0 });
        mockRect(section as HTMLElement, { top: 0, left: 0, width: 1280, height: 900 });

        const motion = new ServiceCardMotion();
        motion.init();

        dispatchPointer(card as HTMLElement, 'pointerenter', { clientX: 320, clientY: 280 });

        expect(card?.classList.contains('is-interacting')).toBe(true);
        expect(card?.style.getPropertyValue('--svc-tilt-y')).toBe('');
        expect(section?.style.getPropertyValue('--services-spotlight-opacity')).toBe('');

        dispatchPointer(card as HTMLElement, 'pointerleave');
        expect(card?.style.getPropertyValue('--svc-tilt-y')).toBe('0deg');

        motion.destroy();
    });

    it('en touch mode activa feedback premium temporal y limpia estado al vencer el timeout', () => {
        const { cards, section } = renderServicesDom({ secondCard: true });
        const [firstCard, secondCard] = cards;
        mockMatchMedia({ fine: false, reduced: false });
        vi.useFakeTimers();

        mockRect(firstCard as HTMLElement, { top: 120, left: 80, width: 300, height: 240 });
        mockRect(secondCard as HTMLElement, { top: 120, left: 420, width: 300, height: 240 });
        mockRect(section as HTMLElement, { top: 0, left: 0, width: 1280, height: 900 });

        const motion = new ServiceCardMotion();
        motion.init();

        (firstCard as HTMLElement).dispatchEvent(
            new MouseEvent('click', { bubbles: true, clientX: 260, clientY: 240 })
        );

        expect(firstCard?.classList.contains('is-touch-active')).toBe(true);
        expect(firstCard?.classList.contains('is-active-service')).toBe(true);
        expect(section?.style.getPropertyValue('--services-spotlight-opacity')).not.toBe('');

        (secondCard as HTMLElement).dispatchEvent(
            new MouseEvent('click', { bubbles: true, clientX: 560, clientY: 240 })
        );

        expect(firstCard?.classList.contains('is-touch-active')).toBe(false);
        expect(firstCard?.style.getPropertyValue('--svc-tilt-y')).toBe('0deg');
        expect(secondCard?.classList.contains('is-touch-active')).toBe(true);
        expect(secondCard?.classList.contains('is-active-service')).toBe(true);

        vi.advanceTimersByTime(901);

        expect(firstCard?.classList.contains('is-active-service')).toBe(false);
        expect(secondCard?.classList.contains('is-active-service')).toBe(false);
        expect(secondCard?.classList.contains('is-touch-active')).toBe(false);
        expect(section?.style.getPropertyValue('--services-spotlight-opacity')).toBe('0');

        motion.destroy();
    });
});
