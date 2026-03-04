import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hydratorInitSpy = vi.fn();
const domContractSpy = vi.fn();
const registrationFactorySpy = vi.fn();
const emitInitialResizeSpy = vi.fn();
const disposeBindingsSpy = vi.fn();
const createWindowBindingsSpy = vi.fn();

const enabledModule = {
    init: vi.fn(),
    destroy: vi.fn(),
};

const passiveModule = {
    destroy: vi.fn(),
};

const afterMountSpy = vi.fn();

vi.mock('../src/modules/ContentHydrator', () => ({
    ContentHydrator: class {
        init(): void {
            hydratorInitSpy();
        }
    },
}));

vi.mock('../src/app/DomContractValidator', () => ({
    assertCriticalDomContract: (): void => {
        domContractSpy();
    },
}));

vi.mock('../src/app/moduleRegistry', () => ({
    getAppModuleRegistrations: (): Array<{
        id: string;
        isEnabled: () => boolean;
        create: () => { init?: () => void; destroy: () => void };
        afterMount?: (...args: unknown[]) => void;
    }> => {
        registrationFactorySpy();
        return [
            {
                id: 'enabled-module',
                isEnabled: (): boolean => true,
                create: (): typeof enabledModule => enabledModule,
                afterMount: afterMountSpy,
            },
            {
                id: 'disabled-module',
                isEnabled: (): boolean => false,
                create: vi.fn(),
            },
            {
                id: 'passive-module',
                isEnabled: (): boolean => true,
                create: (): typeof passiveModule => passiveModule,
            },
        ];
    },
}));

vi.mock('../src/app/windowEvents', () => ({
    createWindowEventBindings: (options: { onBeforeUnload: () => void }): {
        dispose: () => void;
        emitInitialResize: () => void;
    } => {
        createWindowBindingsSpy(options);
        return {
            dispose: (): void => {
                disposeBindingsSpy();
            },
            emitInitialResize: (): void => {
                emitInitialResizeSpy();
            },
        };
    },
}));

describe('App bootstrap', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetModules();
    });

    it('hidrata, monta solo registros habilitados y ejecuta afterMount', async () => {
        const { App } = await import('../src/app/App');

        const app = new App();
        app.init();

        expect(domContractSpy).toHaveBeenCalledTimes(1);
        expect(hydratorInitSpy).toHaveBeenCalledTimes(1);
        expect(registrationFactorySpy).toHaveBeenCalledTimes(1);
        expect(enabledModule.init).toHaveBeenCalledTimes(1);
        expect(afterMountSpy).toHaveBeenCalled();
        expect(afterMountSpy.mock.calls[0]?.[0]).toBe(enabledModule);
        expect(emitInitialResizeSpy).toHaveBeenCalledTimes(1);
        expect(createWindowBindingsSpy).toHaveBeenCalledTimes(1);
    });

    it('destroy desmonta modulos y beforeunload reutiliza el mismo cleanup', async () => {
        const { App } = await import('../src/app/App');

        const app = new App();
        app.init();
        app.destroy();
        app.destroy();

        expect(enabledModule.destroy).toHaveBeenCalledTimes(1);
        expect(passiveModule.destroy).toHaveBeenCalledTimes(1);
        expect(disposeBindingsSpy).toHaveBeenCalledTimes(1);

        const options = createWindowBindingsSpy.mock.calls[0]?.[0] as { onBeforeUnload: () => void };
        expect(options).toBeDefined();

        options.onBeforeUnload();

        expect(enabledModule.destroy).toHaveBeenCalledTimes(1);
        expect(disposeBindingsSpy).toHaveBeenCalledTimes(1);
    });
});
