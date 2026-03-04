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

const ALLOWED_KINDS = new Set(['error', 'unhandledrejection']);
const MAX_MESSAGE_LENGTH = 900;
const MAX_STACK_LENGTH = 1800;
const MAX_SOURCE_LENGTH = 450;
const MAX_URL_LENGTH = 1200;
const MAX_USER_AGENT_LENGTH = 350;
const MAX_ENV_LENGTH = 60;
const MAX_VERSION_LENGTH = 80;

function resolveForwardEndpoint() {
    return (
        process.env.RUNTIME_MONITOR_FORWARD_ENDPOINT ??
        process.env.TELEMETRY_FORWARD_ENDPOINT ??
        ''
    );
}

function normalizeRuntimePayload(body) {
    const kind = asString(body?.kind, 32, 'error');

    const payload = {
        kind: ALLOWED_KINDS.has(kind) ? kind : 'error',
        message: asString(body?.message, MAX_MESSAGE_LENGTH),
        url: asString(body?.url, MAX_URL_LENGTH, 'unknown-url'),
        userAgent: asString(body?.userAgent, MAX_USER_AGENT_LENGTH, 'unknown-user-agent'),
        environment: asString(body?.environment, MAX_ENV_LENGTH, 'unknown'),
        appVersion: asString(body?.appVersion, MAX_VERSION_LENGTH, 'unknown'),
        timestamp: toIsoTimestamp(body?.timestamp),
    };

    const stack = asString(body?.stack, MAX_STACK_LENGTH);
    if (stack) payload.stack = stack;

    const source = asString(body?.source, MAX_SOURCE_LENGTH);
    if (source) payload.source = source;

    const line = Math.trunc(asFiniteNumber(body?.line, 0));
    if (line > 0) payload.line = line;

    const column = Math.trunc(asFiniteNumber(body?.column, 0));
    if (column > 0) payload.column = column;

    return payload;
}

function shouldAlert(payload) {
    return payload.message.length > 0;
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        writeNoContent(res);
        return;
    }

    if (req.method === 'GET') {
        writeJson(res, 200, {
            ok: true,
            source: 'runtime-monitor',
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

    const payload = normalizeRuntimePayload(body);
    if (!payload.message) {
        writeJson(res, 400, { ok: false, error: 'missing-message' });
        return;
    }

    const forwardResult = await forwardPayload(resolveForwardEndpoint(), payload);

    if (shouldAlert(payload)) {
        const sourcePath = safePath(payload.url);
        const summary = truncate(
            `${payload.kind} on ${sourcePath}: ${payload.message} (${payload.environment}/${payload.appVersion})`,
            420
        );
        await sendAlert({
            source: 'runtime-monitor',
            severity: 'error',
            key: `runtime:${payload.kind}:${payload.message}:${payload.environment}:${payload.appVersion}`,
            title: 'Frontend runtime event',
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
