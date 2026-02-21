import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App';
import { EventBus } from '@utils/events';

describe('App lifecycle', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        EventBus.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        EventBus.clear();
    });

    it('emite resize inicial y limpia listener de resize en destroy', () => {
        const handler = vi.fn();
        const unsubscribe = EventBus.on('resize', handler);

        const app = new App();
        app.init();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({
            width: window.innerWidth,
            height: window.innerHeight,
        });

        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(200);
        expect(handler).toHaveBeenCalledTimes(2);

        app.destroy();

        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(200);
        expect(handler).toHaveBeenCalledTimes(2);

        unsubscribe();
    });

    it('init es idempotente y no duplica el registro de listeners globales', () => {
        const handler = vi.fn();
        const unsubscribe = EventBus.on('resize', handler);

        const app = new App();
        app.init();
        app.init();

        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(200);

        expect(handler).toHaveBeenCalledTimes(2);

        app.destroy();
        unsubscribe();
    });
});
