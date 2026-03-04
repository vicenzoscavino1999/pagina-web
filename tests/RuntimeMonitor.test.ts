import { afterEach, describe, expect, it, vi } from 'vitest';
import { installRuntimeMonitor } from '../src/app/runtimeMonitor';

describe('runtime monitor', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('no registra listeners si no hay endpoint ni transport custom', () => {
        const addListenerSpy = vi.spyOn(window, 'addEventListener');
        const dispose = installRuntimeMonitor({ endpoint: '' });

        expect(addListenerSpy).not.toHaveBeenCalledWith('error', expect.any(Function));
        expect(addListenerSpy).not.toHaveBeenCalledWith(
            'unhandledrejection',
            expect.any(Function)
        );

        expect(() => dispose()).not.toThrow();
    });

    it('envia errores de runtime al transport configurado', () => {
        const transportSpy = vi.fn();
        const dispose = installRuntimeMonitor({
            endpoint: 'https://logs.example.com/frontend',
            environment: 'test',
            appVersion: '1.2.3',
            transport: transportSpy,
        });

        const error = new Error('boom token=123456');
        window.dispatchEvent(
            new ErrorEvent('error', {
                message: error.message,
                filename: 'https://app.example.com/main.js',
                lineno: 20,
                colno: 4,
                error,
            })
        );

        expect(transportSpy).toHaveBeenCalledTimes(1);
        const [endpoint, payload] = transportSpy.mock.calls[0] as [
            string,
            { message: string; kind: string; appVersion: string; environment: string; source?: string }
        ];
        expect(endpoint).toBe('https://logs.example.com/frontend');
        expect(payload.kind).toBe('error');
        expect(payload.message).toContain('token=[redacted]');
        expect(payload.appVersion).toBe('1.2.3');
        expect(payload.environment).toBe('test');
        expect(payload.source).toContain('app.example.com');

        dispose();
    });

    it('deduplica eventos repetidos en ventana corta', () => {
        const transportSpy = vi.fn();
        const dispose = installRuntimeMonitor({
            endpoint: '/monitor',
            duplicateWindowMs: 60_000,
            transport: transportSpy,
        });

        const errorEvent = new ErrorEvent('error', {
            message: 'Same runtime error',
            filename: '/assets/index.js',
            lineno: 10,
            colno: 1,
            error: new Error('Same runtime error'),
        });

        window.dispatchEvent(errorEvent);
        window.dispatchEvent(errorEvent);

        expect(transportSpy).toHaveBeenCalledTimes(1);
        dispose();
    });

    it('respeta el maximo de eventos por sesion', () => {
        const transportSpy = vi.fn();
        const dispose = installRuntimeMonitor({
            endpoint: '/monitor',
            maxEventsPerSession: 1,
            duplicateWindowMs: 0,
            transport: transportSpy,
        });

        window.dispatchEvent(
            new ErrorEvent('error', {
                message: 'first',
                filename: '/first.js',
                error: new Error('first'),
            })
        );

        window.dispatchEvent(
            new ErrorEvent('error', {
                message: 'second',
                filename: '/second.js',
                error: new Error('second'),
            })
        );

        expect(transportSpy).toHaveBeenCalledTimes(1);
        dispose();
    });

    it('captura unhandled rejections', () => {
        const transportSpy = vi.fn();
        const dispose = installRuntimeMonitor({
            endpoint: '/monitor',
            transport: transportSpy,
        });

        const event = new Event('unhandledrejection') as PromiseRejectionEvent;
        Object.defineProperty(event, 'reason', {
            value: new Error('Async failure password=unsafe'),
            enumerable: true,
        });

        window.dispatchEvent(event);

        expect(transportSpy).toHaveBeenCalledTimes(1);
        const [, payload] = transportSpy.mock.calls[0] as [string, { kind: string; message: string }];
        expect(payload.kind).toBe('unhandledrejection');
        expect(payload.message).toContain('password=[redacted]');

        dispose();
    });

    it('permite transport custom aun cuando el endpoint no esta definido', () => {
        const transportSpy = vi.fn();
        const dispose = installRuntimeMonitor({
            transport: transportSpy,
        });

        window.dispatchEvent(
            new ErrorEvent('error', {
                message: 'custom transport event',
                filename: '/runtime.js',
                error: new Error('custom transport event'),
            })
        );

        expect(transportSpy).toHaveBeenCalledTimes(1);
        const [endpoint] = transportSpy.mock.calls[0] as [string, { kind: string }];
        expect(endpoint).toBe('');

        dispose();
    });
});
