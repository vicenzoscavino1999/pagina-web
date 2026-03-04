import { gzipSync } from 'node:zlib';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const projectRoot = resolve(process.cwd());
const distDir = join(projectRoot, 'dist');
const publicMediaDir = join(projectRoot, 'public', 'media');

const BUDGETS = {
    maxMainJsGzipBytes: 90 * 1024,
    maxTotalJsGzipBytes: 110 * 1024,
    maxMainCssGzipBytes: 24 * 1024,
    maxReferencedMediaFileBytes: 800 * 1024,
    maxReferencedMediaTotalBytes: 3 * 1024 * 1024,
    maxPublicMediaLargeFiles: 0,
    publicMediaLargeFileThresholdBytes: 1024 * 1024,
};

async function listFilesRecursively(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                return listFilesRecursively(fullPath);
            }
            return [fullPath];
        })
    );

    return files.flat();
}

function toKiB(bytes) {
    return `${(bytes / 1024).toFixed(2)} KiB`;
}

function readGzipBytes(buffer) {
    return gzipSync(buffer).byteLength;
}

async function collectDistAssets() {
    const allFiles = await listFilesRecursively(distDir);
    const jsFiles = allFiles.filter((file) => extname(file) === '.js');
    const cssFiles = allFiles.filter((file) => extname(file) === '.css');

    return { allFiles, jsFiles, cssFiles };
}

async function measureAssetGzipSize(filePath) {
    const content = await readFile(filePath);
    return readGzipBytes(content);
}

async function collectReferencedMedia(distFiles) {
    const textFiles = distFiles.filter((file) => ['.html', '.js', '.css'].includes(extname(file)));
    const mediaRefPattern = /\/media\/[a-zA-Z0-9._/-]+/g;
    const refs = new Set();

    for (const file of textFiles) {
        const content = await readFile(file, 'utf8');
        const matches = content.match(mediaRefPattern);
        if (!matches) continue;

        matches.forEach((match) => refs.add(match));
    }

    const resolved = [];
    for (const mediaPath of refs) {
        const distRelativePath = mediaPath.startsWith('/') ? mediaPath.slice(1) : mediaPath;
        const distMediaPath = join(distDir, distRelativePath);
        try {
            const info = await stat(distMediaPath);
            if (info.isFile()) {
                resolved.push({ path: distMediaPath, size: info.size });
            }
        } catch {
            // Ignore references that are external/runtime-only.
        }
    }

    return resolved;
}

async function getLargePublicMediaFiles() {
    const files = await listFilesRecursively(publicMediaDir);
    const oversized = [];

    for (const file of files) {
        const fileStat = await stat(file);
        if (fileStat.size > BUDGETS.publicMediaLargeFileThresholdBytes) {
            oversized.push({ path: file, size: fileStat.size });
        }
    }

    return oversized;
}

function printMetric(label, value, limit, pass) {
    const status = pass ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${label}: ${value} (limit ${limit})`);
}

async function run() {
    const { allFiles, jsFiles, cssFiles } = await collectDistAssets();
    const mainJsFile = jsFiles.find((file) => /[\\/]assets[\\/]index-.*\.js$/.test(file));
    const mainCssFile = cssFiles.find((file) => /[\\/]assets[\\/]index-.*\.css$/.test(file));

    if (!mainJsFile || !mainCssFile) {
        throw new Error(
            'Could not find main JS/CSS bundle in dist/assets. Run `npm run build` first.'
        );
    }

    const mainJsGzip = await measureAssetGzipSize(mainJsFile);
    const mainCssGzip = await measureAssetGzipSize(mainCssFile);
    const totalJsGzip = (
        await Promise.all(jsFiles.map((file) => measureAssetGzipSize(file)))
    ).reduce((acc, size) => acc + size, 0);

    const referencedMedia = await collectReferencedMedia(allFiles);
    const referencedMediaTotal = referencedMedia.reduce((acc, file) => acc + file.size, 0);
    const maxReferencedMediaFile = referencedMedia.reduce(
        (max, file) => Math.max(max, file.size),
        0
    );

    const oversizedPublicMedia = await getLargePublicMediaFiles();

    const checks = [
        {
            label: 'Main JS gzip',
            value: mainJsGzip,
            limit: BUDGETS.maxMainJsGzipBytes,
            pass: mainJsGzip <= BUDGETS.maxMainJsGzipBytes,
        },
        {
            label: 'Total JS gzip',
            value: totalJsGzip,
            limit: BUDGETS.maxTotalJsGzipBytes,
            pass: totalJsGzip <= BUDGETS.maxTotalJsGzipBytes,
        },
        {
            label: 'Main CSS gzip',
            value: mainCssGzip,
            limit: BUDGETS.maxMainCssGzipBytes,
            pass: mainCssGzip <= BUDGETS.maxMainCssGzipBytes,
        },
        {
            label: 'Largest referenced media file',
            value: maxReferencedMediaFile,
            limit: BUDGETS.maxReferencedMediaFileBytes,
            pass: maxReferencedMediaFile <= BUDGETS.maxReferencedMediaFileBytes,
        },
        {
            label: 'Total referenced media size',
            value: referencedMediaTotal,
            limit: BUDGETS.maxReferencedMediaTotalBytes,
            pass: referencedMediaTotal <= BUDGETS.maxReferencedMediaTotalBytes,
        },
        {
            label: 'Large source files in public/media (>1 MiB)',
            value: oversizedPublicMedia.length,
            limit: BUDGETS.maxPublicMediaLargeFiles,
            pass: oversizedPublicMedia.length <= BUDGETS.maxPublicMediaLargeFiles,
        },
    ];

    console.log('\nPerformance Budget Report\n');
    checks.forEach((check) => {
        const valueText =
            typeof check.value === 'number' && check.label.includes('size')
                ? toKiB(check.value)
                : typeof check.value === 'number' && check.label.includes('gzip')
                  ? toKiB(check.value)
                  : String(check.value);
        const limitText =
            typeof check.limit === 'number' && check.label.includes('size')
                ? toKiB(check.limit)
                : typeof check.limit === 'number' && check.label.includes('gzip')
                  ? toKiB(check.limit)
                  : String(check.limit);

        printMetric(check.label, valueText, limitText, check.pass);
    });

    if (oversizedPublicMedia.length > 0) {
        console.log('\nOversized files in public/media:');
        oversizedPublicMedia.forEach((file) => {
            console.log(`- ${relative(projectRoot, file.path)} (${toKiB(file.size)})`);
        });
    }

    if (referencedMedia.length > 0) {
        const topMedia = [...referencedMedia].sort((a, b) => b.size - a.size).slice(0, 5);
        console.log('\nTop referenced media files:');
        topMedia.forEach((file) => {
            console.log(`- ${relative(projectRoot, file.path)} (${toKiB(file.size)})`);
        });
    }

    const failed = checks.filter((check) => !check.pass);
    if (failed.length > 0) {
        throw new Error(`Performance budgets failed (${failed.length} check(s)).`);
    }

    console.log('\nAll performance budgets passed.');
}

void run().catch((error) => {
    console.error('\nPerformance budget check failed.');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
