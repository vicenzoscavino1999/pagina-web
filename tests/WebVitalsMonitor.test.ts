import { describe, expect, it, vi } from 'vitest';
import type { Metric } from 'web-vitals';
import {
    buildWebVitalPayload,
    installWebVitalsMonitor,
    sanitizeUrlForMetrics,
    type WebVitalPayload,
    type WebVitalsLibrary,
} from '../src/app/webVitalsMonitor';

function createMetric(overrides: Partial<Metric> = {}): Metric {
    return {
        name: 'LCP',
        value: 2100,
        rating: 'good',
        delta: 2100,
        id: 'metric-1',
        navigationType: 'navigate',
        entries: [],
        ...overrides,
    } as Metric;
}

function createMockLibrary(): {
    library: WebVitalsLibrary;
    callbacks: Array<(metric: Metric) => void>;
} {
    const callbacks: Array<(metric: Metric) => void> = [];
    const onMetric = (callback: (metric: Metric) => void): void => {
        callbacks.push(callback);
    };

    const library: WebVitalsLibrary = {
        onCLS: onMetric,
        onINP: onMetric,
        onLCP: onMetric,
        onFCP: onMetric,
        onTTFB: onMetric,
    };

    return { library, callbacks };
}

async function flushAsyncTasks(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
}

describe('web vitals monitor', () => {
    it('construye payload y redacciona query params sensibles', () => {
        const payload = buildWebVitalPayload(createMetric({ name: 'CLS', value: 0.14, delta: 0.14 }), {
            url: 'https://postal.example.com/landing?token=abc123&campaign=q1',
            userAgent: 'test-agent',
            environment: 'test',
            appVersion: '1.0.0',
        });

        expect(payload.name).toBe('CLS');
        expect(payload.url).toContain('campaign=q1');
        expect(payload.url).toContain('redacted');
        expect(payload.url).not.toContain('abc123');
    });

    it('no carga web-vitals cuando no hay endpoint ni transport custom', async () => {
        const loadWebVitals = vi.fn(() => Promise.resolve(createMockLibrary().library));

        installWebVitalsMonitor({ loadWebVitals });
        await flushAsyncTasks();

        expect(loadWebVitals).not.toHaveBeenCalled();
    });

    it('reporta metricas al transport configurado', async () => {
        const transport = vi.fn();
        const { library, callbacks } = createMockLibrary();
        const loadWebVitals = vi.fn(() => Promise.resolve(library));

        installWebVitalsMonitor({
            endpoint: 'https://rum.example.com/collect',
            environment: 'test',
            appVersion: '2026.03.04',
            transport,
            loadWebVitals,
        });
        await flushAsyncTasks();

        expect(loadWebVitals).toHaveBeenCalledTimes(1);
        callbacks[0]?.(createMetric({ name: 'FCP', id: 'fcp-1', value: 850, delta: 850 }));

        expect(transport).toHaveBeenCalledTimes(1);
        const [endpoint, payload] = transport.mock.calls[0] as [string, WebVitalPayload];
        expect(endpoint).toBe('https://rum.example.com/collect');
        expect(payload.name).toBe('FCP');
        expect(payload.environment).toBe('test');
        expect(payload.appVersion).toBe('2026.03.04');
    });

    it('deduplica metricas repetidas por name e id', async () => {
        const transport = vi.fn();
        const { library, callbacks } = createMockLibrary();
        const loadWebVitals = vi.fn(() => Promise.resolve(library));

        installWebVitalsMonitor({
            endpoint: '/rum',
            transport,
            loadWebVitals,
        });
        await flushAsyncTasks();

        const metric = createMetric({ name: 'INP', id: 'inp-dup', value: 180, delta: 180 });
        callbacks[0]?.(metric);
        callbacks[0]?.(metric);

        expect(transport).toHaveBeenCalledTimes(1);
    });

    it('respeta maximo de eventos por sesion', async () => {
        const transport = vi.fn();
        const { library, callbacks } = createMockLibrary();
        const loadWebVitals = vi.fn(() => Promise.resolve(library));

        installWebVitalsMonitor({
            endpoint: '/rum',
            transport,
            loadWebVitals,
            maxEventsPerSession: 1,
        });
        await flushAsyncTasks();

        callbacks[0]?.(createMetric({ name: 'TTFB', id: 'ttfb-1', value: 340, delta: 340 }));
        callbacks[1]?.(createMetric({ name: 'LCP', id: 'lcp-1', value: 2300, delta: 2300 }));

        expect(transport).toHaveBeenCalledTimes(1);
    });

    it('tolera fallos al cargar libreria web-vitals', async () => {
        const loadWebVitals = vi.fn(() =>
            Promise.reject(new Error('failed to import web-vitals'))
        );

        expect(() => {
            installWebVitalsMonitor({ endpoint: '/rum', loadWebVitals });
        }).not.toThrow();

        await flushAsyncTasks();
        expect(loadWebVitals).toHaveBeenCalledTimes(1);
    });

    it('permite transport custom aun sin endpoint configurado', async () => {
        const transport = vi.fn();
        const { library, callbacks } = createMockLibrary();
        const loadWebVitals = vi.fn(() => Promise.resolve(library));

        installWebVitalsMonitor({
            transport,
            loadWebVitals,
        });
        await flushAsyncTasks();

        callbacks[0]?.(createMetric({ name: 'CLS', id: 'cls-no-endpoint', value: 0.08, delta: 0.08 }));

        expect(transport).toHaveBeenCalledTimes(1);
        const [endpoint] = transport.mock.calls[0] as [string, WebVitalPayload];
        expect(endpoint).toBe('');
    });

    it('tolera URLs invalidas al sanitizar metricas', () => {
        const raw = '%%%%://bad-url';
        const sanitized = sanitizeUrlForMetrics(raw);

        expect(sanitized).toContain('%%%%://bad-url');
    });
});
