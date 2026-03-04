import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const mediaSourceDir = join(projectRoot, 'imagenes');
const outputDir = join(projectRoot, 'public', 'media', 'optimized');

const MEDIA_VARIANTS = [
    {
        source: 'hero-warehouse.png',
        targetBase: 'hero-warehouse',
        widths: [640, 960, 1280, 1600, 1920],
    },
    {
        source: 'furgoneta-hero.jpg',
        targetBase: 'furgoneta-hero',
        widths: [640, 960, 1280, 1600, 1920],
    },
    {
        source: 'docs_cinematic.png',
        targetBase: 'docs-cinematic',
        widths: [320, 480, 640],
    },
    {
        source: 'valued_cinematic.png',
        targetBase: 'valued-cinematic',
        widths: [320, 480, 640],
    },
    {
        source: 'parcel_cinematic.png',
        targetBase: 'parcel-cinematic',
        widths: [320, 480, 640, 960, 1280],
    },
];

async function generateResponsiveVariants() {
    await mkdir(outputDir, { recursive: true });

    for (const variant of MEDIA_VARIANTS) {
        const sourcePath = join(mediaSourceDir, variant.source);
        const image = sharp(sourcePath);
        const metadata = await image.metadata();
        const maxWidth = metadata.width ?? 0;
        const widths = variant.widths.filter((width) => width <= maxWidth);

        if (widths.length === 0) {
            console.warn(`[media:generate] Skipping ${variant.source}: no valid widths for source.`);
            continue;
        }

        for (const width of widths) {
            const resized = sharp(sourcePath).resize({
                width,
                fit: 'cover',
                withoutEnlargement: true,
            });

            const avifOutput = join(outputDir, `${variant.targetBase}-${width}.avif`);
            const webpOutput = join(outputDir, `${variant.targetBase}-${width}.webp`);

            await resized
                .clone()
                .avif({
                    quality: 48,
                    effort: 4,
                })
                .toFile(avifOutput);

            await resized
                .clone()
                .webp({
                    quality: 72,
                    effort: 4,
                })
                .toFile(webpOutput);
        }

        console.log(`[media:generate] ${variant.source}: generated ${widths.length * 2} files`);
    }
}

await generateResponsiveVariants();
