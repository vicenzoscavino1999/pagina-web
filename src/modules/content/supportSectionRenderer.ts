import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderFooterSection } from './footerSectionRenderer';
import { renderIconMarkup } from './iconMarkup';
import { escapeHtml } from './sanitize';

export function renderSupportSections(content: SiteContent, dom: ContentDomWriter): void {
    renderFaq(content, dom);
    renderTicker(content, dom);
    renderFooter(content, dom);
}

function renderFaq(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('faq-list');
    if (!container) return;

    container.innerHTML = content.faq.items
        .map(
            (item) => `
                <details class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 reveal cursor-pointer">
                    <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-slate-900">
                        <span>${escapeHtml(item.question)}</span>
                        <span class="transition group-open:rotate-180">
                            ${renderIconMarkup('fa-solid fa-chevron-down text-brand-600')}
                        </span>
                    </summary>
                    <div class="text-slate-500 px-6 pb-6 text-sm leading-relaxed border-t border-slate-50 pt-4">
                        ${escapeHtml(item.answer)}
                    </div>
                </details>
            `
        )
        .join('');
}

function renderTicker(content: SiteContent, dom: ContentDomWriter): void {
    const template = dom.getById('ticker-content') as HTMLTemplateElement | null;
    if (!template) return;

    const items = content.ticker.items
        .map((item) => `<span class="flex items-center gap-2">${renderIconMarkup(item.iconClass)} ${escapeHtml(item.label)}</span>`)
        .join('');

    template.innerHTML = `<div class="text-2xl font-bold text-slate-300 flex gap-16 items-center pr-16">${items}</div>`;
}

function renderFooter(content: SiteContent, dom: ContentDomWriter): void {
    renderFooterSection(content, dom);
}
