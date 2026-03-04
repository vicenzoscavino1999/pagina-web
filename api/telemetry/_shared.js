const DEFAULT_MAX_BODY_BYTES = 32 * 1024;
const DEFAULT_ALERT_WINDOW_MS = 5 * 60 * 1000;
const ALERT_CACHE_KEY = '__deliveryTelemetryAlertCache';

function getAlertCache() {
    const globalStore = globalThis;
    if (!(globalStore[ALERT_CACHE_KEY] instanceof Map)) {
        globalStore[ALERT_CACHE_KEY] = new Map();
    }
    return globalStore[ALERT_CACHE_KEY];
}

function cleanExpiredAlerts(cache, now) {
    for (const [key, expiry] of cache.entries()) {
        if (expiry <= now) cache.delete(key);
    }
}

function readAlertWindowMs() {
    const raw = process.env.MONITORING_ALERT_WINDOW_MS ?? '';
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_ALERT_WINDOW_MS;
    return Math.floor(parsed);
}

export function truncate(value, maxLength) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (normalized.length <= maxLength) return normalized;
    return normalized.slice(0, maxLength);
}

export function asString(value, maxLength, fallback = '') {
    if (typeof value !== 'string') return fallback;
    const normalized = truncate(value, maxLength);
    return normalized.length > 0 ? normalized : fallback;
}

export function asFiniteNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}

export function toIsoTimestamp(value) {
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
    }
    return new Date().toISOString();
}

export function safePath(rawUrl) {
    if (typeof rawUrl !== 'string' || rawUrl.length === 0) return '/';
    try {
        return new URL(rawUrl).pathname || '/';
    } catch {
        return '/';
    }
}

export function writeJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.end(JSON.stringify(payload));
}

export function writeNoContent(res) {
    res.statusCode = 204;
    res.setHeader('cache-control', 'no-store');
    res.end();
}

export function rejectMethod(res, allowedMethods) {
    res.statusCode = 405;
    res.setHeader('allow', allowedMethods.join(', '));
    writeJson(res, 405, {
        ok: false,
        error: 'method-not-allowed',
        allowedMethods,
    });
}

async function readRawBody(req, maxBytes) {
    return new Promise((resolve, reject) => {
        let totalBytes = 0;
        const chunks = [];

        req.on('data', (chunk) => {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            totalBytes += buffer.length;
            if (totalBytes > maxBytes) {
                reject(new Error('payload-too-large'));
                return;
            }
            chunks.push(buffer);
        });

        req.on('end', () => {
            resolve(Buffer.concat(chunks).toString('utf8'));
        });

        req.on('error', (error) => reject(error));
    });
}

export async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return req.body;
    }

    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch {
            return null;
        }
    }

    try {
        const rawBody = await readRawBody(req, DEFAULT_MAX_BODY_BYTES);
        if (!rawBody) return null;
        return JSON.parse(rawBody);
    } catch {
        return null;
    }
}

function isSlackWebhook(url) {
    try {
        return new URL(url).hostname === 'hooks.slack.com';
    } catch {
        return false;
    }
}

export async function forwardPayload(endpoint, payload) {
    if (!endpoint) {
        return { forwarded: false, reason: 'disabled' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'user-agent': 'delivery-web-page-telemetry/1.0',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        return { forwarded: response.ok, reason: response.ok ? 'ok' : `status-${response.status}` };
    } catch {
        return { forwarded: false, reason: 'network-error' };
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function sendAlert({ source, severity, key, title, summary, payload }) {
    const webhookUrl = process.env.MONITORING_ALERT_WEBHOOK_URL ?? '';
    if (!webhookUrl) {
        return { sent: false, reason: 'disabled' };
    }

    const windowMs = readAlertWindowMs();
    const now = Date.now();
    const cache = getAlertCache();
    cleanExpiredAlerts(cache, now);
    const cachedUntil = cache.get(key);
    if (typeof cachedUntil === 'number' && cachedUntil > now) {
        return { sent: false, reason: 'rate-limited' };
    }
    cache.set(key, now + windowMs);

    const alertPayload = isSlackWebhook(webhookUrl)
        ? {
              text: `[${severity.toUpperCase()}] ${title}\n${summary}`,
          }
        : {
              source,
              severity,
              title,
              summary,
              timestamp: new Date().toISOString(),
              payload,
          };

    const result = await forwardPayload(webhookUrl, alertPayload);
    return { sent: result.forwarded, reason: result.reason };
}
