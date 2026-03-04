import {
    asFiniteNumber,
    asString,
    forwardPayload,
    readJsonBody,
    rejectMethod,
    safePath,
    sendAlert,
    toIsoTimestamp,
    truncate,
    writeJson,
    writeNoContent,
} from './_shared.js';

const ALLOWED_NAMES = new Set(['CLS', 'INP', 'LCP', 'FCP', 'TTFB']);
const ALLOWED_RATINGS = new Set(['good', 'needs-improvement', 'poor']);
const ALERTABLE_METRICS = new Set(['LCP', 'INP', 'CLS']);
const MAX_ID_LENGTH = 120;
const MAX_NAVIGATION_TYPE_LENGTH = 60;
const MAX_URL_LENGTH = 1200;
const MAX_USER_AGENT_LENGTH = 350;
const MAX_ENV_LENGTH = 60;
const MAX_VERSION_LENGTH = 80;

function resolveForwardEndpoint() {
    return (
        process.env.RUM_METRICS_FORWARD_ENDPOINT ??
        process.env.TELEMETRY_FORWARD_ENDPOINT ??
        ''
    );
}

function normalizeMetricPayload(body) {
    const name = asString(body?.name, 12, 'LCP').toUpperCase();
    const rating = asString(body?.rating, 20, 'needs-improvement');

    const payload = {
        name: ALLOWED_NAMES.has(name) ? name : 'LCP',
        value: asFiniteNumber(body?.value, 0),
        rating: ALLOWED_RATINGS.has(rating) ? rating : 'needs-improvement',
        delta: asFiniteNumber(body?.delta, 0),
        id: asString(body?.id, MAX_ID_LENGTH, 'unknown'),
        url: asString(body?.url, MAX_URL_LENGTH, 'unknown-url'),
        userAgent: asString(body?.userAgent, MAX_USER_AGENT_LENGTH, 'unknown-user-agent'),
        environment: asString(body?.environment, MAX_ENV_LENGTH, 'unknown'),
        appVersion: asString(body?.appVersion, MAX_VERSION_LENGTH, 'unknown'),
        timestamp: toIsoTimestamp(body?.timestamp),
    };

    const navigationType = asString(body?.navigationType, MAX_NAVIGATION_TYPE_LENGTH);
    if (navigationType) payload.navigationType = navigationType;

    return payload;
}

function shouldAlert(payload) {
    return payload.rating === 'poor' && ALERTABLE_METRICS.has(payload.name);
}

function formatMetricValue(payload) {
    if (payload.name === 'CLS') {
        return payload.value.toFixed(3);
    }
    return payload.value.toFixed(1);
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        writeNoContent(res);
        return;
    }

    if (req.method === 'GET') {
        writeJson(res, 200, {
            ok: true,
            source: 'web-vitals',
            forwardConfigured: Boolean(resolveForwardEndpoint()),
            alertingConfigured: Boolean(process.env.MONITORING_ALERT_WEBHOOK_URL),
            timestamp: new Date().toISOString(),
        });
        return;
    }

    if (req.method !== 'POST') {
        rejectMethod(res, ['GET', 'POST', 'OPTIONS']);
        return;
    }

    const body = await readJsonBody(req);
    if (!body || typeof body !== 'object') {
        writeJson(res, 400, { ok: false, error: 'invalid-json-body' });
        return;
    }

    const payload = normalizeMetricPayload(body);
    const forwardResult = await forwardPayload(resolveForwardEndpoint(), payload);

    if (shouldAlert(payload)) {
        const sourcePath = safePath(payload.url);
        const summary = truncate(
            `Poor ${payload.name}=${formatMetricValue(payload)} on ${sourcePath} (${payload.environment}/${payload.appVersion})`,
            420
        );

        await sendAlert({
            source: 'web-vitals',
            severity: 'warning',
            key: `web-vitals:${payload.name}:${sourcePath}:${payload.environment}:${payload.appVersion}`,
            title: 'Poor web vital detected',
            summary,
            payload,
        });
    }

    writeJson(res, 202, {
        ok: true,
        accepted: true,
        forwarded: forwardResult.forwarded,
        forwardReason: forwardResult.reason,
        timestamp: new Date().toISOString(),
    });
}
