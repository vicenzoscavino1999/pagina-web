import { describe, expect, it, vi } from 'vitest';
import { LazyModule } from '../src/app/LazyModule';

async function flushMicrotasks(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
}

describe('LazyModule', () => {
    it('carga el modulo, ejecuta init y delega destroy', async () => {
        const delegatedModule = {
            init: vi.fn(),
            destroy: vi.fn(),
        };

        const module = new LazyModule('test-module', () => Promise.resolve(delegatedModule));

        module.init();
        await flushMicrotasks();

        expect(delegatedModule.init).toHaveBeenCalledTimes(1);

        module.destroy();
        expect(delegatedModule.destroy).toHaveBeenCalledTimes(1);
    });

    it('si se destruye antes de resolver la carga, destruye el modulo delegado al resolver', async () => {
        const delegatedModule = {
            init: vi.fn(),
            destroy: vi.fn(),
        };

        let resolveModule: ((value: typeof delegatedModule) => void) | undefined;
        const loadingPromise = new Promise<typeof delegatedModule>((resolve) => {
            resolveModule = resolve;
        });

        const module = new LazyModule('pending-module', async () => loadingPromise);

        module.init();
        module.destroy();
        resolveModule?.(delegatedModule);
        await flushMicrotasks();

        expect(delegatedModule.init).not.toHaveBeenCalled();
        expect(delegatedModule.destroy).toHaveBeenCalledTimes(1);
    });

    it('reporta error de carga sin romper la aplicacion', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const module = new LazyModule(
            'failing-module',
            () => Promise.reject(new Error('boom'))
        );

        module.init();
        await flushMicrotasks();

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy.mock.calls[0]?.[0]).toContain('failing-module');

        errorSpy.mockRestore();
    });
});
