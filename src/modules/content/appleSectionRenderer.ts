import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { escapeHtml, sanitizeHtmlWithLineBreaks } from './sanitize';

export function renderAppleSection(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('apple-copy');
    if (!container) return;

    container.innerHTML = `
        <h2 id="apple-heading" class="apple-text-reveal text-5xl md:text-8xl font-bold tracking-tight mb-6">
            ${sanitizeHtmlWithLineBreaks(content.apple.headingHtml)}
        </h2>
        <p
            id="apple-subheading"
            class="apple-text-reveal text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
            ${escapeHtml(content.apple.subheading)}
        </p>
    `;
}
