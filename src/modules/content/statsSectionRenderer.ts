import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { escapeAttribute, escapeHtml } from './sanitize';

export function renderStatsSection(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('stats-grid');
    if (!container) return;

    container.innerHTML = content.stats.items
        .map((item, index) => {
            const delay = index > 0 ? ` style="transition-delay: ${index * 100}ms;"` : '';
            return `
                <div class="reveal p-4"${delay}>
                    <div class="text-4xl md:text-5xl font-bold text-white mb-2 flex justify-center gap-1">
                        <span class="counter" data-target="${item.target}" data-suffix="${escapeAttribute(item.suffix)}">0</span>
                    </div>
                    <div class="text-sm text-accent-400 font-bold uppercase tracking-wider">${escapeHtml(item.label)}</div>
                </div>
            `;
        })
        .join('');
}
