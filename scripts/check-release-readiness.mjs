import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED_FILES = [
    'README.md',
    'QUALITY_BASELINE.md',
    'vercel.json',
    'docs/OPERATIONS_RUNBOOK.md',
    'docs/RELEASE_PROCESS.md',
    'docs/WEB_VITALS_DASHBOARD.md',
];

function parseArgs(argv) {
    const args = {
        version: '',
        notesFile: '',
    };

    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        const value = argv[i + 1];
        if (!token?.startsWith('--')) continue;
        if (token === '--version' && value) args.version = value;
        if (token === '--notes-file' && value) args.notesFile = value;
    }

    return args;
}

function isSemverLike(version) {
    return /^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?$/.test(version);
}

async function fileExists(path) {
    try {
        await access(resolve(process.cwd(), path), constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

async function readUtf8(path) {
    return readFile(resolve(process.cwd(), path), 'utf8');
}

async function run() {
    const args = parseArgs(process.argv.slice(2));
    const failures = [];
    const warnings = [];

    if (!args.version) {
        failures.push('Missing --version argument.');
    } else if (!isSemverLike(args.version)) {
        failures.push(
            `Release version "${args.version}" is not semver-like (expected e.g. 1.2.3 or 1.2.3-rc.1).`
        );
    }

    for (const requiredFile of REQUIRED_FILES) {
        const exists = await fileExists(requiredFile);
        if (!exists) {
            failures.push(`Missing required release file: ${requiredFile}`);
        }
    }

    if (!args.notesFile) {
        failures.push('Missing --notes-file argument.');
    } else {
        const notesExists = await fileExists(args.notesFile);
        if (!notesExists) {
            failures.push(`Release notes file not found: ${args.notesFile}`);
        } else {
            const notes = await readUtf8(args.notesFile);
            if (!notes.includes('## Release ')) {
                failures.push('Release notes do not contain a "## Release" header.');
            }
            if (notes.length < 120) {
                warnings.push('Release notes are very short; verify commit range.');
            }
        }
    }

    const packageJson = JSON.parse(await readUtf8('package.json'));
    const packageVersion = String(packageJson.version ?? '').trim();
    if (packageVersion === '0.0.0') {
        warnings.push(
            'package.json version is still 0.0.0 (placeholder). Consider bumping before formal public release.'
        );
    }

    console.log('\nRelease Readiness Check\n');
    console.log(`Target version: ${args.version || '(missing)'}`);
    console.log(`Release notes: ${args.notesFile || '(missing)'}`);

    if (warnings.length > 0) {
        console.log('\nWarnings:');
        warnings.forEach((warning) => {
            console.log(`- ${warning}`);
        });
    }

    if (failures.length > 0) {
        console.log('\nFailures:');
        failures.forEach((failure) => {
            console.log(`- ${failure}`);
        });
        throw new Error(`Release readiness failed (${failures.length} issue(s)).`);
    }

    console.log('\nRelease readiness passed.');
}

void run().catch((error) => {
    console.error('\nRelease readiness check failed.');
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
