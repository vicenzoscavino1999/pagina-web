import { beforeEach, describe, expect, it, vi } from 'vitest';

const gsapKillTweensOfSpy = vi.fn();
const gsapSetSpy = vi.fn();
const gsapToSpy = vi.fn();

vi.mock('gsap', () => ({
    gsap: {
        killTweensOf: gsapKillTweensOfSpy,
        set: gsapSetSpy,
        to: gsapToSpy,
    },
}));

interface MockIntersectionObserverRecord {
    callback: IntersectionObserverCallback;
    disconnect: ReturnType<typeof vi.fn>;
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
}

describe('ScrollReveal', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('observa elementos reveal y anima cuando entran en viewport', async () => {
        const records: MockIntersectionObserverRecord[] = [];

        vi.stubGlobal(
            'IntersectionObserver',
            vi.fn((callback: IntersectionObserverCallback) => {
                const record: MockIntersectionObserverRecord = {
                    callback,
                    disconnect: vi.fn(),
                    observe: vi.fn(),
                    unobserve: vi.fn(),
                };
                records.push(record);
                return record;
            })
        );

        document.body.innerHTML = `
            <div id="first" class="reveal"></div>
            <div id="second" class="reveal"></div>
        `;

        const { ScrollReveal } = await import('../src/modules/ScrollReveal');
        const reveal = new ScrollReveal();
        reveal.init();

        expect(records).toHaveLength(1);
        expect(records[0]?.observe).toHaveBeenCalledTimes(2);
        expect(gsapSetSpy).toHaveBeenCalledTimes(2);

        const first = document.getElementById('first');
        const second = document.getElementById('second');
        expect(first).toBeInstanceOf(HTMLElement);
        expect(second).toBeInstanceOf(HTMLElement);

        records[0]?.callback(
            [
                {
                    isIntersecting: false,
                    target: second,
                } as unknown as IntersectionObserverEntry,
            ],
            records[0] as unknown as IntersectionObserver
        );

        expect(gsapToSpy).not.toHaveBeenCalledWith(second, expect.anything());

        records[0]?.callback(
            [
                {
                    isIntersecting: true,
                    target: first,
                } as unknown as IntersectionObserverEntry,
            ],
            records[0] as unknown as IntersectionObserver
        );

        expect(first?.classList.contains('active')).toBe(true);
        expect(records[0]?.unobserve).toHaveBeenCalledWith(first);
        expect(gsapToSpy).toHaveBeenCalledWith(
            first,
            expect.objectContaining({
                autoAlpha: 1,
                duration: 0.7,
                ease: 'power2.out',
            })
        );

        reveal.destroy();

        expect(records[0]?.disconnect).toHaveBeenCalledTimes(1);
        expect(gsapKillTweensOfSpy).toHaveBeenCalledTimes(2);
    });

    it('activa contenido sin animacion si hay reduced motion', async () => {
        const defaultMatchMedia = window.matchMedia;
        const observeSpy = vi.fn();

        vi.stubGlobal(
            'IntersectionObserver',
            vi.fn(() => ({
                disconnect: vi.fn(),
                observe: observeSpy,
                unobserve: vi.fn(),
            }))
        );

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

        document.body.innerHTML = '<div id="reveal-target" class="reveal"></div>';

        const { ScrollReveal } = await import('../src/modules/ScrollReveal');
        const reveal = new ScrollReveal();
        reveal.init();

        const target = document.getElementById('reveal-target');
        expect(target?.classList.contains('active')).toBe(true);
        expect(observeSpy).not.toHaveBeenCalled();
        expect(gsapSetSpy).not.toHaveBeenCalled();
        expect(gsapToSpy).not.toHaveBeenCalled();

        reveal.destroy();
        window.matchMedia = defaultMatchMedia;
    });
});
