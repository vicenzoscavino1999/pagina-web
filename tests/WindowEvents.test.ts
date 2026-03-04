import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../src/utils/events';
import { createWindowEventBindings } from '../src/app/windowEvents';

describe('window event bindings', () => {
    beforeEach(() => {
        EventBus.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        EventBus.clear();
    });

    it('emite resize inicial, resize debounce y beforeunload', () => {
        const resizeHandler = vi.fn();
        const beforeUnload = vi.fn();
        const unsubscribe = EventBus.on('resize', resizeHandler);

        const bindings = createWindowEventBindings({ onBeforeUnload: beforeUnload });
        bindings.emitInitialResize();

        expect(resizeHandler).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(200);
        expect(resizeHandler).toHaveBeenCalledTimes(2);

        window.dispatchEvent(new Event('beforeunload'));
        expect(beforeUnload).toHaveBeenCalledTimes(1);

        bindings.dispose();
        unsubscribe();
    });

    it('emite scroll con direccion y delta y deja de emitir tras dispose', () => {
        const scrollHandler = vi.fn();
        const unsubscribe = EventBus.on('scroll', scrollHandler);
        const rafSpy = vi
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((callback: FrameRequestCallback): number => {
                callback(0);
                return 1;
            });

        Object.defineProperty(window, 'scrollY', {
            configurable: true,
            writable: true,
            value: 0,
        });

        const bindings = createWindowEventBindings({ onBeforeUnload: vi.fn() });

        Object.defineProperty(window, 'scrollY', {
            configurable: true,
            writable: true,
            value: 120,
        });
        window.dispatchEvent(new Event('scroll'));

        expect(scrollHandler).toHaveBeenCalledWith({
            y: 120,
            direction: 'down',
            delta: 120,
        });

        bindings.dispose();

        Object.defineProperty(window, 'scrollY', {
            configurable: true,
            writable: true,
            value: 20,
        });
        window.dispatchEvent(new Event('scroll'));

        expect(scrollHandler).toHaveBeenCalledTimes(1);

        rafSpy.mockRestore();
        unsubscribe();
    });

    it('coalesce scroll mientras hay un frame pendiente y detecta direccion hacia arriba', () => {
        const scrollHandler = vi.fn();
        const unsubscribe = EventBus.on('scroll', scrollHandler);
        const listeners = new Map<string, EventListener>();
        const frameCallbacks: FrameRequestCallback[] = [];

        const windowMock = {
            scrollY: 300,
            innerWidth: 1440,
            innerHeight: 900,
            addEventListener: (event: string, listener: EventListener): void => {
                listeners.set(event, listener);
            },
            removeEventListener: (event: string): void => {
                listeners.delete(event);
            },
            requestAnimationFrame: (callback: FrameRequestCallback): number => {
                frameCallbacks.push(callback);
                return frameCallbacks.length;
            },
        };

        createWindowEventBindings({ onBeforeUnload: vi.fn() }, windowMock as unknown as Window);

        windowMock.scrollY = 220;
        listeners.get('scroll')?.(new Event('scroll'));

        windowMock.scrollY = 150;
        listeners.get('scroll')?.(new Event('scroll'));

        expect(frameCallbacks).toHaveLength(1);

        frameCallbacks[0]?.(0);

        expect(scrollHandler).toHaveBeenCalledTimes(1);
        expect(scrollHandler).toHaveBeenCalledWith({
            y: 150,
            direction: 'up',
            delta: -150,
        });

        unsubscribe();
    });
});
