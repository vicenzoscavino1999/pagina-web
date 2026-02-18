import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '@utils/events';

describe('EventBus', () => {
    // Hack: As EventBus uses private static field, we cannot easily clear it.
    // However, for these tests, we can rely on unique event names or just manual cleanup if needed.
    // Ideally EventBus should have a clear method for testing.
    // For now, we assume isolation by event name or just 'off' logic.

    it('llama al handler cuando se emite un evento', () => {
        const handler = vi.fn();
        EventBus.on('test-scroll', handler);
        EventBus.emit('test-scroll', { y: 100, direction: 'down', delta: 10 });
        expect(handler).toHaveBeenCalledWith({ y: 100, direction: 'down', delta: 10 });
    });

    it('unsubscribe funciona y no llama al handler', () => {
        const handler = vi.fn();
        const unsub = EventBus.on('test-scroll-off', handler);
        unsub();
        EventBus.emit('test-scroll-off', { y: 200, direction: 'down', delta: 5 });
        expect(handler).not.toHaveBeenCalled();
    });

    it('permite multiples handlers para el mismo evento', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        EventBus.on('multi-event', handler1);
        EventBus.on('multi-event', handler2);

        EventBus.emit('multi-event', { data: 'ok' });

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });
});
