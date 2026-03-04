import { spawnSync } from 'node:child_process';

const BLOCKING_SEVERITIES = new Set(['high', 'critical']);

function runNpmAudit() {
    const result = spawnSync(
        process.platform === 'win32' ? 'npm.cmd' : 'npm',
        ['audit', '--omit=dev', '--json'],
        {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        }
    );

    const output = result.stdout?.trim() || result.stderr?.trim() || '{}';
    let parsed = null;
    try {
        parsed = JSON.parse(output);
    } catch {
        throw new Error(
            'Could not parse `npm audit --omit=dev --json` output. Check npm connectivity.'
        );
    }

    return parsed;
}

function extractBlockingVulnerabilities(auditJson) {
    const vulnerabilities = auditJson?.vulnerabilities;
    if (!vulnerabilities || typeof vulnerabilities !== 'object') return [];

    return Object.entries(vulnerabilities)
        .map(([name, detail]) => ({
            name,
            severity: detail?.severity ?? 'unknown',
            isDirect: Boolean(detail?.isDirect),
            via: Array.isArray(detail?.via) ? detail.via : [],
        }))
        .filter((item) => BLOCKING_SEVERITIES.has(item.severity));
}

function summarizeVia(via) {
    const cves = via
        .filter((entry) => typeof entry === 'object' && entry !== null)
        .map((entry) => entry.source || entry.url || entry.title || entry.name)
        .filter(Boolean)
        .slice(0, 3);

    return cves.length > 0 ? cves.join(', ') : 'no advisory id';
}

function printRow(item) {
    const directLabel = item.isDirect ? 'direct' : 'transitive';
    console.log(
        `- ${item.name} [${item.severity}] (${directLabel}) -> ${summarizeVia(item.via)}`
    );
}

function run() {
    const audit = runNpmAudit();
    const blockingVulnerabilities = extractBlockingVulnerabilities(audit);

    console.log('\nRuntime Dependency Security Check\n');
    console.log(`Blocking severities: ${Array.from(BLOCKING_SEVERITIES).join(', ')}`);

    if (blockingVulnerabilities.length === 0) {
        console.log('No runtime high/critical vulnerabilities found.');
        return;
    }

    console.log(
        `Found ${blockingVulnerabilities.length} blocking runtime vulnerabilities:`
    );
    blockingVulnerabilities.forEach(printRow);

    throw new Error(
        `Runtime dependency security check failed (${blockingVulnerabilities.length} blocking vulnerabilities).`
    );
}

try {
    run();
} catch (error) {
    console.error('\nRuntime dependency security check failed.');
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
}
