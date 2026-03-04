import type { AppModule } from '../types';

export class LazyModule implements AppModule {
    #label: string;
    #factory: () => Promise<AppModule>;
    #instance: AppModule | null = null;
    #isDestroyed = false;
    #isLoading = false;

    constructor(label: string, factory: () => Promise<AppModule>) {
        this.#label = label;
        this.#factory = factory;
    }

    init(): void {
        if (this.#isDestroyed || this.#isLoading || this.#instance) return;

        this.#isLoading = true;
        void this.#factory()
            .then((module) => {
                this.#isLoading = false;

                if (this.#isDestroyed) {
                    module.destroy();
                    return;
                }

                this.#instance = module;
                this.#instance.init?.();
            })
            .catch((error: unknown) => {
                this.#isLoading = false;
                console.error(`[LazyModule] Failed to load "${this.#label}"`, error);
            });
    }

    destroy(): void {
        this.#isDestroyed = true;
        this.#instance?.destroy();
        this.#instance = null;
    }
}
