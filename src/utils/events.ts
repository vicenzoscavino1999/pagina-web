import type { EventHandler } from '../types';


// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EventBus {
    static #listeners = new Map<string, Set<EventHandler>>();

    static on(event: string, handler: EventHandler): () => void {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, new Set());
        }
        this.#listeners.get(event)!.add(handler);
        return () => this.off(event, handler);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static emit(event: string, payload: any): void {
        this.#listeners.get(event)?.forEach(fn => { fn(payload); });
    }

    static off(event: string, handler: EventHandler): void {
        this.#listeners.get(event)?.delete(handler);
    }
}
