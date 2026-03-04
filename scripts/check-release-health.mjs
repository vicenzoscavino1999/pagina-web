const args = process.argv.slice(2);

function getArgValue(flag) {
    const index = args.indexOf(flag);
    if (index === -1) return null;
    return args[index + 1] ?? null;
}

function hasFlag(flag) {
    return args.includes(flag);
}

function toAbsoluteUrl(target, base) {
    return new URL(target, base).toString();
}

function printResult(label, pass, details = '') {
    const status = pass ? 'PASS' : 'FAIL';
    const suffix = details ? ` (${details})` : '';
    console.log(`[${status}] ${label}${suffix}`);
}

async function fetchOrThrow(url) {
    const response = await fetch(url, {
        redirect: 'follow',
        headers: {
            'user-agent': 'postal-express-release-health-check/1.0',
        },
    });
    return response;
}

function collectFailures(checks) {
    return checks.filter((check) => !check.pass);
}

async function run() {
    const urlArg =
        getArgValue('--url') ??
        process.env['RELEASE_TARGET_URL'] ??
        process.env['TARGET_URL'] ??
        '';
    const skipSecurityHeaders = hasFlag('--skip-security-headers');

    if (!urlArg) {
        throw new Error(
            'Missing target URL. Use --url <https://...> or set RELEASE_TARGET_URL.'
        );
    }

    const targetUrl = new URL(urlArg).toString();
    const checks = [];

    console.log('\nRelease Health Check\n');
    console.log(`Target: ${targetUrl}`);
    if (skipSecurityHeaders) {
        console.log('Mode: security header checks skipped');
    }

    const homeResponse = await fetchOrThrow(targetUrl);
    const homeHtml = await homeResponse.text();

    checks.push({
        label: 'Home responds with 2xx',
        pass: homeResponse.ok,
        details: `status ${homeResponse.status}`,
    });

    if (!skipSecurityHeaders) {
        const csp = homeResponse.headers.get('content-security-policy') ?? '';
        const nosniff = homeResponse.headers.get('x-content-type-options') ?? '';
        const frameOptions = homeResponse.headers.get('x-frame-options') ?? '';
        const referrerPolicy = homeResponse.headers.get('referrer-policy') ?? '';
        const permissionsPolicy = homeResponse.headers.get('permissions-policy') ?? '';
        const coop = homeResponse.headers.get('cross-origin-opener-policy') ?? '';

        checks.push({
            label: 'CSP header present',
            pass: csp.includes("default-src 'self'"),
            details: csp.slice(0, 90),
        });
        checks.push({
            label: 'X-Content-Type-Options is nosniff',
            pass: nosniff.toLowerCase() === 'nosniff',
            details: nosniff || 'missing',
        });
        checks.push({
            label: 'X-Frame-Options is DENY',
            pass: frameOptions.toUpperCase() === 'DENY',
            details: frameOptions || 'missing',
        });
        checks.push({
            label: 'Referrer-Policy set',
            pass: referrerPolicy.length > 0,
            details: referrerPolicy || 'missing',
        });
        checks.push({
            label: 'Permissions-Policy set',
            pass: permissionsPolicy.length > 0,
            details: permissionsPolicy || 'missing',
        });
        checks.push({
            label: 'Cross-Origin-Opener-Policy is same-origin',
            pass: coop.toLowerCase() === 'same-origin',
            details: coop || 'missing',
        });
    }

    const requiredDomMarkers = [
        'id="main-content"',
        'id="hero-section"',
        'id="tracking-widget"',
        'id="services-grid"',
        'id="footer-content"',
    ];

    requiredDomMarkers.forEach((marker) => {
        checks.push({
            label: `DOM marker ${marker}`,
            pass: homeHtml.includes(marker),
            details: marker,
        });
    });

    const requiredAssets = [
        '/media/optimized/hero-warehouse-640.avif',
        '/media/optimized/furgoneta-hero-1280.webp',
    ];

    requiredAssets.forEach((asset) => {
        checks.push({
            label: `Optimized asset reference ${asset}`,
            pass: homeHtml.includes(asset),
            details: asset,
        });
    });

    const manifestMatch = homeHtml.match(
        /<link[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["'][^>]*>/i
    );
    const manifestHref = manifestMatch?.[1] ?? '/manifest.webmanifest';
    const manifestUrl = toAbsoluteUrl(manifestHref, targetUrl);
    const manifestResponse = await fetchOrThrow(manifestUrl);
    checks.push({
        label: 'Manifest is reachable',
        pass: manifestResponse.ok,
        details: `${manifestUrl} (${manifestResponse.status})`,
    });

    const registerSwUrl = toAbsoluteUrl('/registerSW.js', targetUrl);
    const registerSwResponse = await fetchOrThrow(registerSwUrl);
    checks.push({
        label: 'registerSW.js is reachable',
        pass: registerSwResponse.ok,
        details: `${registerSwResponse.status}`,
    });

    const telemetryRuntimeUrl = toAbsoluteUrl('/api/telemetry/runtime', targetUrl);
    const telemetryRuntimeResponse = await fetchOrThrow(telemetryRuntimeUrl);
    let telemetryRuntimePayload = null;
    try {
        telemetryRuntimePayload = await telemetryRuntimeResponse.json();
    } catch {
        telemetryRuntimePayload = null;
    }
    checks.push({
        label: 'Telemetry runtime endpoint is reachable',
        pass:
            telemetryRuntimeResponse.ok &&
            Boolean(telemetryRuntimePayload && telemetryRuntimePayload.ok === true),
        details: `${telemetryRuntimeResponse.status}`,
    });

    const telemetryWebVitalsUrl = toAbsoluteUrl('/api/telemetry/web-vitals', targetUrl);
    const telemetryWebVitalsResponse = await fetchOrThrow(telemetryWebVitalsUrl);
    let telemetryWebVitalsPayload = null;
    try {
        telemetryWebVitalsPayload = await telemetryWebVitalsResponse.json();
    } catch {
        telemetryWebVitalsPayload = null;
    }
    checks.push({
        label: 'Telemetry web-vitals endpoint is reachable',
        pass:
            telemetryWebVitalsResponse.ok &&
            Boolean(telemetryWebVitalsPayload && telemetryWebVitalsPayload.ok === true),
        details: `${telemetryWebVitalsResponse.status}`,
    });

    checks.forEach((check) => {
        printResult(check.label, check.pass, check.details);
    });

    const failures = collectFailures(checks);
    if (failures.length > 0) {
        throw new Error(
            `Release health check failed (${failures.length} issue(s)).`
        );
    }

    console.log('\nRelease health check passed.');
}

void run().catch((error) => {
    console.error('\nRelease health check failed.');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
