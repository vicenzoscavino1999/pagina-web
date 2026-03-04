import type { Metric } from 'web-vitals';

export interface WebVitalPayload {
    name: string;
    value: number;
    rating: Metric['rating'];
    delta: number;
    id: string;
    navigationType?: string;
    url: string;
    userAgent: string;
    environment: string;
    appVersion: string;
    timestamp: string;
}

export interface WebVitalsLibrary {
    onCLS(callback: (metric: Metric) => void): void;
    onINP(callback: (metric: Metric) => void): void;
    onLCP(callback: (metric: Metric) => void): void;
    onFCP(callback: (metric: Metric) => void): void;
    onTTFB(callback: (metric: Metric) => void): void;
}

export interface WebVitalsMonitorConfig {
    endpoint?: string;
    environment?: string;
    appVersion?: string;
    maxEventsPerSession?: number;
    transport?: (endpoint: string, payload: WebVitalPayload) => void | Promise<void>;
    loadWebVitals?: () => Promise<WebVitalsLibrary>;
}

interface WebVitalsContext {
    url: string;
    userAgent: string;
    environment: string;
    appVersion: string;
}

const DEFAULT_MAX_EVENTS_PER_SESSION = 15;
const MAX_URL_LENGTH = 1200;
const SENSITIVE_QUERY_PARAM = /(token|password|secret|auth|apikey|api_key|email|key)/i;

function readEnvString(key: string): string | null {
    const envMap = import.meta.env as Record<string, unknown>;
    const value = envMap[key];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function resolveEnvironment(config: WebVitalsMonitorConfig): string {
    if (config.environment) return config.environment;
    return import.meta.env.PROD ? 'production' : 'development';
}

function resolveAppVersion(config: WebVitalsMonitorConfig): string {
    if (config.appVersion) return config.appVersion;
    return readEnvString('VITE_APP_VERSION') ?? 'unknown';
}

function resolveEndpoint(config: WebVitalsMonitorConfig): string {
    if ('endpoint' in config) return config.endpoint ?? '';
    const envEndpoint = readEnvString('VITE_RUM_METRICS_ENDPOINT');
    if (envEndpoint) return envEndpoint;
    if (import.meta.env.PROD) return '/api/telemetry/web-vitals';
    return '';
}

export function sanitizeUrlForMetrics(rawUrl: string): string {
    const fallbackOrigin = typeof window === 'undefined' ? 'https://localhost' : window.location.origin;

    try {
        const parsed = new URL(rawUrl, fallbackOrigin);
        const params = parsed.searchParams;
        params.forEach((value, key) => {
            if (SENSITIVE_QUERY_PARAM.test(key)) {
                params.set(key, '[redacted]');
            } else if (value.length > 250) {
                params.set(key, value.slice(0, 250));
            }
        });
        return parsed.toString().slice(0, MAX_URL_LENGTH);
    } catch {
        return rawUrl.slice(0, MAX_URL_LENGTH);
    }
}

export function buildWebVitalPayload(metric: Metric, context: WebVitalsContext): WebVitalPayload {
    const payload: WebVitalPayload = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        url: sanitizeUrlForMetrics(context.url),
        userAgent: context.userAgent,
        environment: context.environment,
        appVersion: context.appVersion,
        timestamp: new Date().toISOString(),
    };

    if (typeof metric.navigationType === 'string' && metric.navigationType.length > 0) {
        payload.navigationType = metric.navigationType;
    }

    return payload;
}

function defaultTransport(endpoint: string, payload: WebVitalPayload): void {
    const body = JSON.stringify(payload);
    const nav = window.navigator as Navigator & {
        sendBeacon?: (url: string, data?: BodyInit | null) => boolean;
    };

    if (typeof nav.sendBeacon === 'function') {
        const sent = nav.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
        if (sent) return;
    }

    void fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
        mode: 'cors',
    }).catch(() => {
        // Metrics reporting must never break UX.
    });
}

async function defaultLoadWebVitals(): Promise<WebVitalsLibrary> {
    const webVitals = await import('web-vitals');
    return {
        onCLS: webVitals.onCLS,
        onINP: webVitals.onINP,
        onLCP: webVitals.onLCP,
        onFCP: webVitals.onFCP,
        onTTFB: webVitals.onTTFB,
    };
}

export function installWebVitalsMonitor(config: WebVitalsMonitorConfig = {}): void {
    if (typeof window === 'undefined') return;

    const endpoint = resolveEndpoint(config);
    const transport = config.transport ?? defaultTransport;
    if (!endpoint && !config.transport) return;

    const context: WebVitalsContext = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        environment: resolveEnvironment(config),
        appVersion: resolveAppVersion(config),
    };
    const loadWebVitals = config.loadWebVitals ?? defaultLoadWebVitals;
    const maxEventsPerSession = config.maxEventsPerSession ?? DEFAULT_MAX_EVENTS_PER_SESSION;
    const sentMetricKeys = new Set<string>();
    let sentCount = 0;

    const publish = (metric: Metric): void => {
        if (sentCount >= maxEventsPerSession) return;

        const key = `${metric.name}:${metric.id}`;
        if (sentMetricKeys.has(key)) return;
        sentMetricKeys.add(key);

        sentCount += 1;
        const payload = buildWebVitalPayload(metric, context);
        void transport(endpoint, payload);
    };

    void loadWebVitals()
        .then((webVitals) => {
            webVitals.onCLS(publish);
            webVitals.onINP(publish);
            webVitals.onLCP(publish);
            webVitals.onFCP(publish);
            webVitals.onTTFB(publish);
        })
        .catch(() => {
            // Monitoring module is optional in production.
        });
}
