import type { AppModule } from '../types';
import { ContentHydrator } from '../modules/ContentHydrator';
import { assertCriticalDomContract } from './DomContractValidator';
import { getAppModuleRegistrations, type AppModuleRegistration } from './moduleRegistry';
import { createWindowEventBindings } from './windowEvents';

export class App {
    #modules: AppModule[] = [];
    #disposers: Array<() => void> = [];
    #isStarted = false;
    #isDestroyed = false;
    #deferredMountWasQueued = false;

    init(): void {
        if (this.#isStarted) return;

        // Fail fast if the static HTML contract was broken by manual edits.
        assertCriticalDomContract();
        this.#isStarted = true;

        this.#hydrateContent();
        this.#mountRegistrations(getAppModuleRegistrations());
        this.#registerWindowBindings();
    }

    destroy(): void {
        if (this.#isDestroyed) return;
        this.#isDestroyed = true;

        while (this.#modules.length > 0) {
            const module = this.#modules.pop();
            module?.destroy();
        }

        while (this.#disposers.length > 0) {
            const dispose = this.#disposers.pop();
            dispose?.();
        }
    }

    #hydrateContent(): void {
        const contentHydrator = new ContentHydrator();
        contentHydrator.init();
    }

    #mountRegistrations(registrations: readonly AppModuleRegistration[]): void {
        const criticalRegistrations = registrations.filter(
            (registration) => registration.phase !== 'deferred'
        );
        const deferredRegistrations = registrations.filter(
            (registration) => registration.phase === 'deferred'
        );

        criticalRegistrations.forEach((registration) => {
            if (!registration.isEnabled()) return;

            const module = this.#mount(registration.create());
            registration.afterMount?.(module);
        });

        this.#queueDeferredRegistrations(deferredRegistrations);
    }

    #queueDeferredRegistrations(registrations: readonly AppModuleRegistration[]): void {
        if (registrations.length === 0 || this.#deferredMountWasQueued) return;
        this.#deferredMountWasQueued = true;
        let deferredMounted = false;
        const triggerDisposers: Array<() => void> = [];

        const clearTriggers = (): void => {
            while (triggerDisposers.length > 0) {
                const dispose = triggerDisposers.pop();
                dispose?.();
            }
        };

        const mountDeferred = (): void => {
            if (this.#isDestroyed || deferredMounted) return;
            deferredMounted = true;
            clearTriggers();

            registrations.forEach((registration) => {
                if (!registration.isEnabled()) return;

                const module = this.#mount(registration.create());
                registration.afterMount?.(module);
            });
        };

        const addTrigger = (
            target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>,
            eventName: string,
            listener: EventListener,
            options?: AddEventListenerOptions
        ): void => {
            target.addEventListener(eventName, listener, options);
            triggerDisposers.push(() => {
                target.removeEventListener(eventName, listener);
            });
        };

        const armInteractionTriggers = (): void => {
            const onInteraction: EventListener = (): void => {
                mountDeferred();
            };

            addTrigger(window, 'scroll', onInteraction, { passive: true, once: true });
            addTrigger(window, 'wheel', onInteraction, { passive: true, once: true });
            addTrigger(window, 'touchstart', onInteraction, { passive: true, once: true });
            addTrigger(window, 'pointerdown', onInteraction, { passive: true, once: true });
            addTrigger(window, 'keydown', onInteraction, { once: true });

            const onVisibilityChange: EventListener = (): void => {
                if (document.visibilityState === 'hidden') {
                    mountDeferred();
                }
            };

            addTrigger(document, 'visibilitychange', onVisibilityChange);
        };

        const schedulePostLoadMount = (): void => {
            const shortTimeoutHandle = globalThis.setTimeout(() => {
                mountDeferred();
            }, 320);

            triggerDisposers.push(() => {
                globalThis.clearTimeout(shortTimeoutHandle);
            });

            if (typeof window.requestIdleCallback === 'function') {
                const idleHandle = window.requestIdleCallback(
                    () => {
                        mountDeferred();
                    },
                    { timeout: 900 }
                );

                triggerDisposers.push(() => {
                    window.cancelIdleCallback(idleHandle);
                });
            }
        };

        armInteractionTriggers();
        this.#disposers.push(() => {
            clearTriggers();
        });

        if (document.readyState === 'complete') {
            schedulePostLoadMount();
            return;
        }

        const onLoad = (): void => {
            schedulePostLoadMount();
        };

        addTrigger(window, 'load', onLoad, { once: true });
    }

    #mount<T extends AppModule>(module: T): T {
        if (typeof module.init === 'function') {
            module.init();
        }
        this.#modules.push(module);
        return module;
    }

    #registerWindowBindings(): void {
        const bindings = createWindowEventBindings({
            onBeforeUnload: (): void => {
                this.destroy();
            },
        });

        this.#disposers.push(() => bindings.dispose());
        bindings.emitInitialResize();
    }
}
