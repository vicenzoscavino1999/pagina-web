import { EventBus } from '../utils/events';
import { debounce } from '../utils/math';

export interface WindowEventBindings {
    dispose(): void;
    emitInitialResize(): void;
}

interface WindowEventBindingOptions {
    onBeforeUnload: () => void;
}

export function createWindowEventBindings(
    { onBeforeUnload }: WindowEventBindingOptions,
    windowRef: Window = window
): WindowEventBindings {
    let scrollTicking = false;
    let lastScrollY = windowRef.scrollY;
    const requestFrame = (callback: FrameRequestCallback): number => windowRef.requestAnimationFrame(callback);

    const onScroll = (): void => {
        if (scrollTicking) return;

        scrollTicking = true;
        requestFrame(() => {
            const y = windowRef.scrollY;
            const delta = y - lastScrollY;
            const direction: 'up' | 'down' = delta < 0 ? 'up' : 'down';

            EventBus.emit('scroll', { y, direction, delta });
            lastScrollY = y;
            scrollTicking = false;
        });
    };

    const onResize = debounce((): void => {
        emitResizeSnapshot(windowRef);
    }, 150);

    const handleBeforeUnload = (): void => {
        onBeforeUnload();
    };

    windowRef.addEventListener('scroll', onScroll, { passive: true });
    windowRef.addEventListener('resize', onResize);
    windowRef.addEventListener('beforeunload', handleBeforeUnload);

    return {
        dispose(): void {
            windowRef.removeEventListener('scroll', onScroll);
            windowRef.removeEventListener('resize', onResize);
            windowRef.removeEventListener('beforeunload', handleBeforeUnload);
        },
        emitInitialResize(): void {
            emitResizeSnapshot(windowRef);
        },
    };
}

function emitResizeSnapshot(windowRef: Pick<Window, 'innerWidth' | 'innerHeight'>): void {
    EventBus.emit('resize', {
        width: windowRef.innerWidth,
        height: windowRef.innerHeight,
    });
}
