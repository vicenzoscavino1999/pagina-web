import { beforeEach, describe, it, expect, vi } from 'vitest';
import { EventBus } from '@utils/events';

describe('EventBus', () => {
    beforeEach(() => {
        EventBus.clear();
    });

    it('llama al handler cuando se emite un evento', () => {
        const handler = vi.fn();
        const unsubscribe = EventBus.on('scroll', handler);

        EventBus.emit('scroll', { y: 100, direction: 'down', delta: 10 });

        expect(handler).toHaveBeenCalledWith({ y: 100, direction: 'down', delta: 10 });
        unsubscribe();
    });

    it('unsubscribe funciona y no llama al handler', () => {
        const handler = vi.fn();
        const unsub = EventBus.on('scroll', handler);

        unsub();

        EventBus.emit('scroll', { y: 200, direction: 'down', delta: 5 });

        expect(handler).not.toHaveBeenCalled();
    });

    it('off no falla si el evento no tiene listeners registrados', () => {
        const handler = vi.fn();

        expect(() => EventBus.off('scroll', handler)).not.toThrow();
    });
});
