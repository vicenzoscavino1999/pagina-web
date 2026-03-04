import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SECTION_ORDER = [
    'Breaking Changes',
    'Features',
    'Fixes',
    'Performance',
    'Security',
    'Refactors',
    'Documentation',
    'Tests',
    'Build',
    'CI',
    'Chores',
    'Other Changes',
];

const TYPE_TO_SECTION = {
    feat: 'Features',
    fix: 'Fixes',
    perf: 'Performance',
    security: 'Security',
    refactor: 'Refactors',
    docs: 'Documentation',
    test: 'Tests',
    build: 'Build',
    ci: 'CI',
    chore: 'Chores',
};

function parseArgs(argv) {
    const args = {
        version: 'unversioned',
        from: '',
        to: 'HEAD',
        out: '',
        changelogFile: '',
    };

    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        const value = argv[i + 1];
        if (!token?.startsWith('--')) continue;
        if (token === '--version' && value) args.version = value;
        if (token === '--from' && value) args.from = value;
        if (token === '--to' && value) args.to = value;
        if (token === '--out' && value) args.out = value;
        if (token === '--changelog-file' && value) args.changelogFile = value;
    }

    return args;
}

function runGit(args, { allowFailure = false } = {}) {
    const result = spawnSync('git', args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (result.status !== 0 && !allowFailure) {
        const stderr = result.stderr?.trim() || '(no stderr)';
        throw new Error(`git ${args.join(' ')} failed: ${stderr}`);
    }

    return {
        ok: result.status === 0,
        stdout: result.stdout?.trim() || '',
        stderr: result.stderr?.trim() || '',
    };
}

function resolveFromRef(explicitFrom) {
    if (explicitFrom) return explicitFrom;

    const latestTag = runGit(['describe', '--tags', '--abbrev=0'], {
        allowFailure: true,
    });

    if (latestTag.ok && latestTag.stdout) return latestTag.stdout;

    const firstCommit = runGit(['rev-list', '--max-parents=0', 'HEAD']);
    return firstCommit.stdout.split('\n')[0] ?? 'HEAD';
}

function parseCommitLine(line) {
    const parts = line.split('\u001f');
    return {
        hash: parts[0] ?? '',
        subject: parts[1] ?? '',
        body: parts[2] ?? '',
        author: parts[3] ?? '',
        date: parts[4] ?? '',
    };
}

function parseConventionalSubject(subject) {
    const match = subject.match(/^([a-zA-Z]+)(\([^)]+\))?(!)?:\s+(.+)$/);
    if (!match) {
        return {
            type: 'other',
            description: subject.trim(),
            isBreaking: false,
        };
    }

    return {
        type: (match[1] ?? 'other').toLowerCase(),
        description: (match[4] ?? subject).trim(),
        isBreaking: Boolean(match[3]),
    };
}

function isBreakingChange(subjectMeta, body) {
    if (subjectMeta.isBreaking) return true;
    return /BREAKING[\s_-]?CHANGE/i.test(body);
}

function toEntry(commit) {
    const subjectMeta = parseConventionalSubject(commit.subject);
    const breaking = isBreakingChange(subjectMeta, commit.body);

    const baseSection =
        TYPE_TO_SECTION[subjectMeta.type] ?? 'Other Changes';
    const section = breaking ? 'Breaking Changes' : baseSection;
    const hashShort = commit.hash.slice(0, 7);
    const line = breaking
        ? `- **BREAKING:** ${subjectMeta.description} (\`${hashShort}\`)`
        : `- ${subjectMeta.description} (\`${hashShort}\`)`;

    return {
        section,
        line,
    };
}

function buildReleaseMarkdown({ version, from, to, commits }) {
    const bySection = new Map();
    SECTION_ORDER.forEach((section) => bySection.set(section, []));

    commits.forEach((commit) => {
        const entry = toEntry(commit);
        const sectionItems = bySection.get(entry.section);
        sectionItems?.push(entry.line);
    });

    const date = new Date().toISOString().slice(0, 10);
    const lines = [
        `## Release ${version} - ${date}`,
        '',
        `- Range: \`${from}..${to}\``,
        `- Commits: ${commits.length}`,
        '',
    ];

    if (commits.length === 0) {
        lines.push('No changes detected in this range.');
        lines.push('');
        return lines.join('\n');
    }

    SECTION_ORDER.forEach((section) => {
        const entries = bySection.get(section) ?? [];
        if (entries.length === 0) return;
        lines.push(`### ${section}`);
        lines.push(...entries);
        lines.push('');
    });

    return lines.join('\n');
}

async function prependChangelog(changelogFile, notesBlock) {
    const resolved = resolve(process.cwd(), changelogFile);
    let existing = '';
    try {
        existing = await readFile(resolved, 'utf8');
    } catch {
        existing = '# Changelog\n\n';
    }

    const header = '# Changelog';
    const hasHeader = existing.startsWith(header);
    const currentBody = hasHeader
        ? existing.slice(header.length).replace(/^\s+/, '')
        : existing;

    if (currentBody.includes(notesBlock.split('\n')[0] ?? '')) {
        return false;
    }

    const merged = `${header}\n\n${notesBlock.trim()}\n\n${currentBody.trim()}\n`;
    await writeFile(resolved, merged, 'utf8');
    return true;
}

async function run() {
    const args = parseArgs(process.argv.slice(2));
    const from = resolveFromRef(args.from);
    const to = args.to || 'HEAD';
    const range = `${from}..${to}`;

    const log = runGit([
        'log',
        '--no-merges',
        '--date=short',
        '--pretty=format:%H%x1f%s%x1f%b%x1f%an%x1f%ad',
        range,
    ]);

    const commits = log.stdout
        .split('\n')
        .filter(Boolean)
        .map(parseCommitLine);

    const markdown = buildReleaseMarkdown({
        version: args.version,
        from,
        to,
        commits,
    });

    if (args.out) {
        const resolvedOut = resolve(process.cwd(), args.out);
        await writeFile(resolvedOut, `${markdown}\n`, 'utf8');
        console.log(`Release notes written to ${resolvedOut}`);
    } else {
        console.log(markdown);
    }

    if (args.changelogFile) {
        const updated = await prependChangelog(args.changelogFile, markdown);
        if (updated) {
            console.log(`Changelog updated: ${args.changelogFile}`);
        } else {
            console.log(`Changelog already contains this release block: ${args.changelogFile}`);
        }
    }
}

void run().catch((error) => {
    console.error('Failed to generate release notes.');
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
