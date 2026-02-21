import type { AppEvents, EventHandler, EventName } from '../types';


// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EventBus {
    static #listeners = new Map<EventName, Set<EventHandler>>();

    static on<K extends EventName>(event: K, handler: EventHandler<K>): () => void {
        const listeners = this.#listeners.get(event) ?? new Set<EventHandler>();
        listeners.add(handler as EventHandler);
        this.#listeners.set(event, listeners);
        return () => this.off(event, handler);
    }

    static emit<K extends EventName>(event: K, payload: AppEvents[K]): void {
        this.#listeners.get(event)?.forEach((fn) => {
            (fn as EventHandler<K>)(payload);
        });
    }

    static off<K extends EventName>(event: K, handler: EventHandler<K>): void {
        const listeners = this.#listeners.get(event);
        if (!listeners) return;

        listeners.delete(handler as EventHandler);
        if (listeners.size === 0) {
            this.#listeners.delete(event);
        }
    }

    static clear(): void {
        this.#listeners.clear();
    }
}
