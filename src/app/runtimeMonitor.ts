export type RuntimeMonitorEventKind = 'error' | 'unhandledrejection';

export interface RuntimeMonitorEvent {
    kind: RuntimeMonitorEventKind;
    message: string;
    stack?: string;
    source?: string;
    line?: number;
    column?: number;
    url: string;
    userAgent: string;
    environment: string;
    appVersion: string;
    timestamp: string;
}

export interface RuntimeMonitorConfig {
    endpoint?: string;
    environment?: string;
    appVersion?: string;
    maxEventsPerSession?: number;
    duplicateWindowMs?: number;
    transport?: (endpoint: string, event: RuntimeMonitorEvent) => void | Promise<void>;
}

const DEFAULT_MAX_EVENTS_PER_SESSION = 10;
const DEFAULT_DUPLICATE_WINDOW_MS = 4000;
const MAX_TEXT_LENGTH = 900;
const REDACTED_EMAIL = '[redacted-email]';
const REDACTED_SECRET = '$1=[redacted]';

function sanitizeText(value: string): string {
    return value
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED_EMAIL)
        .replace(/(token|password|secret)=([^&\s]+)/gi, REDACTED_SECRET)
        .slice(0, MAX_TEXT_LENGTH);
}

function stringifyUnknown(value: unknown): string {
    if (typeof value === 'string') return sanitizeText(value);
    if (value instanceof Error) return sanitizeText(value.message);

    try {
        return sanitizeText(JSON.stringify(value));
    } catch {
        return 'Unknown runtime rejection';
    }
}

function readEnvString(key: string): string | null {
    const envMap = import.meta.env as Record<string, unknown>;
    const value = envMap[key];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function resolveEnvironment(config: RuntimeMonitorConfig): string {
    if (config.environment) return config.environment;
    return import.meta.env.PROD ? 'production' : 'development';
}

function resolveVersion(config: RuntimeMonitorConfig): string {
    if (config.appVersion) return config.appVersion;
    const envVersion = readEnvString('VITE_APP_VERSION');
    if (envVersion) return envVersion;
    return 'unknown';
}

function resolveEndpoint(config: RuntimeMonitorConfig): string {
    if ('endpoint' in config) return config.endpoint ?? '';
    const envEndpoint = readEnvString('VITE_RUNTIME_MONITORING_ENDPOINT');
    if (envEndpoint) return envEndpoint;
    if (import.meta.env.PROD) return '/api/telemetry/runtime';
    return '';
}

function buildFingerprint(event: RuntimeMonitorEvent): string {
    return [
        event.kind,
        event.message,
        event.source ?? '',
        event.line ?? 0,
        event.column ?? 0,
    ].join('|');
}

function defaultTransport(endpoint: string, event: RuntimeMonitorEvent): void {
    const payload = JSON.stringify(event);
    const nav = window.navigator as Navigator & {
        sendBeacon?: (url: string, data?: BodyInit | null) => boolean;
    };

    if (typeof nav.sendBeacon === 'function') {
        const sent = nav.sendBeacon(
            endpoint,
            new Blob([payload], { type: 'application/json' })
        );
        if (sent) return;
    }

    void fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
        keepalive: true,
        mode: 'cors',
    }).catch(() => {
        // Monitoring cannot break UX.
    });
}

export function installRuntimeMonitor(config: RuntimeMonitorConfig = {}): () => void {
    if (typeof window === 'undefined') return () => {};

    const endpoint = resolveEndpoint(config);
    const transport = config.transport ?? defaultTransport;
    if (!endpoint && !config.transport) return () => {};

    const environment = resolveEnvironment(config);
    const appVersion = resolveVersion(config);
    const maxEventsPerSession = config.maxEventsPerSession ?? DEFAULT_MAX_EVENTS_PER_SESSION;
    const duplicateWindowMs = config.duplicateWindowMs ?? DEFAULT_DUPLICATE_WINDOW_MS;

    let sentCount = 0;
    const fingerprints = new Map<string, number>();

    const dispatchEvent = (event: RuntimeMonitorEvent): void => {
        if (sentCount >= maxEventsPerSession) return;

        const fingerprint = buildFingerprint(event);
        const now = Date.now();
        const previous = fingerprints.get(fingerprint);
        if (typeof previous === 'number' && now - previous < duplicateWindowMs) return;

        fingerprints.set(fingerprint, now);
        sentCount += 1;

        void transport(endpoint, event);
    };

    const onError = (nativeEvent: Event): void => {
        const event = nativeEvent as ErrorEvent;
        const rawMessage = event.error instanceof Error ? event.error.message : event.message;
        const stack = event.error instanceof Error ? event.error.stack : undefined;

        const payload: RuntimeMonitorEvent = {
            kind: 'error',
            message: sanitizeText(rawMessage || 'Unknown runtime error'),
            url: window.location.href,
            userAgent: navigator.userAgent,
            environment,
            appVersion,
            timestamp: new Date().toISOString(),
        };

        if (typeof stack === 'string' && stack.length > 0) {
            payload.stack = sanitizeText(stack);
        }
        if (event.filename) {
            payload.source = sanitizeText(event.filename);
        }
        if (event.lineno > 0) {
            payload.line = event.lineno;
        }
        if (event.colno > 0) {
            payload.column = event.colno;
        }

        dispatchEvent(payload);
    };

    const onUnhandledRejection = (nativeEvent: Event): void => {
        const event = nativeEvent as Event & { reason?: unknown };
        const reason = event.reason;
        const message = stringifyUnknown(reason);
        const stack =
            reason instanceof Error && typeof reason.stack === 'string'
                ? sanitizeText(reason.stack)
                : undefined;

        const payload: RuntimeMonitorEvent = {
            kind: 'unhandledrejection',
            message,
            url: window.location.href,
            userAgent: navigator.userAgent,
            environment,
            appVersion,
            timestamp: new Date().toISOString(),
        };

        if (typeof stack === 'string' && stack.length > 0) {
            payload.stack = stack;
        }

        dispatchEvent(payload);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return (): void => {
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
}
