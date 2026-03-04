import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlowScrollScene } from '../src/modules/FlowScrollScene';
import { EventBus } from '../src/utils/events';

describe('FlowScrollScene', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section>
                <h2 id="flow-title"></h2>
                <div id="flow-steps"></div>
            </section>
        `;
        vi.clearAllMocks();
        EventBus.clear();
    });

    afterEach(() => {
        EventBus.clear();
    });

    it('actualiza el flujo con scroll y resize y resetea al destruir', () => {
        const container = document.getElementById('flow-steps') as HTMLElement;
        let currentTop = 260;

        Object.defineProperty(container, 'offsetHeight', {
            configurable: true,
            value: 720,
        });

        vi.spyOn(container, 'getBoundingClientRect').mockImplementation(
            () =>
                ({
                    top: currentTop,
                    left: 0,
                    width: 1180,
                    height: 720,
                    bottom: currentTop + 720,
                    right: 1180,
                    x: 0,
                    y: currentTop,
                    toJSON: () => '',
                }) as DOMRect
        );

        const scene = new FlowScrollScene();
        const initialProgress = container.style.getPropertyValue('--flow-scroll-progress');

        expect(initialProgress).not.toBe('');
        expect(container.style.getPropertyValue('--flow-connector-fill')).not.toBe('');

        currentTop = -120;
        EventBus.emit('scroll', { y: 940, direction: 'down', delta: 200 });

        expect(Number.parseFloat(container.style.getPropertyValue('--flow-scroll-progress'))).toBeGreaterThan(
            Number.parseFloat(initialProgress)
        );
        expect(Number.parseFloat(container.style.getPropertyValue('--flow-scroll-energy'))).toBeGreaterThan(0.35);

        currentTop = -40;
        EventBus.emit('resize', { width: 1440, height: 900 });
        expect(container.style.getPropertyValue('--flow-sweep-x')).not.toBe('18.00%');

        scene.destroy();

        expect(container.style.getPropertyValue('--flow-scroll-progress')).toBe('0.000');
        expect(container.style.getPropertyValue('--flow-card-shift')).toBe('20.00px');
    });
});
