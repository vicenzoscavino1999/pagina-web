import { beforeEach, describe, expect, it, vi } from 'vitest';

const lenisDestroySpy = vi.fn();
const lenisRafSpy = vi.fn();
const tickerAddSpy = vi.fn();
const tickerRemoveSpy = vi.fn();
const tickerLagSmoothingSpy = vi.fn();
const lenisConstructorSpy = vi.fn(() => ({
    destroy: lenisDestroySpy,
    raf: lenisRafSpy,
}));

vi.mock('lenis', () => ({
    default: lenisConstructorSpy,
}));

vi.mock('gsap', () => ({
    gsap: {
        ticker: {
            add: tickerAddSpy,
            remove: tickerRemoveSpy,
            lagSmoothing: tickerLagSmoothingSpy,
        },
    },
}));

describe('SmoothScrollController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('inicializa Lenis con ticker de GSAP y limpia al destruir', async () => {
        const { SmoothScrollController } = await import('../src/modules/SmoothScrollController');

        const controller = new SmoothScrollController({ lerp: 0.12 });
        controller.init();

        expect(lenisConstructorSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                anchors: {
                    offset: 96,
                },
                autoRaf: false,
                lerp: 0.12,
                smoothWheel: true,
                stopInertiaOnNavigate: true,
                syncTouch: true,
            })
        );
        expect(tickerLagSmoothingSpy).toHaveBeenCalledWith(0);
        expect(tickerAddSpy).toHaveBeenCalledTimes(1);

        const tickerCallback = tickerAddSpy.mock.calls[0]?.[0] as ((time: number) => void) | undefined;
        expect(tickerCallback).toBeTypeOf('function');
        tickerCallback?.(1.25);
        expect(lenisRafSpy).toHaveBeenCalledWith(1250);

        controller.destroy();

        expect(tickerRemoveSpy).toHaveBeenCalledWith(tickerCallback);
        expect(lenisDestroySpy).toHaveBeenCalledTimes(1);
    });

    it('omite Lenis si el usuario prefiere reduced motion', async () => {
        const defaultMatchMedia = window.matchMedia;
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        const { SmoothScrollController } = await import('../src/modules/SmoothScrollController');

        const controller = new SmoothScrollController();
        controller.init();
        controller.destroy();

        expect(lenisConstructorSpy).not.toHaveBeenCalled();
        expect(tickerAddSpy).not.toHaveBeenCalled();

        window.matchMedia = defaultMatchMedia;
    });
});
