import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderIconMarkup } from './iconMarkup';
import { formatPhoneDisplay } from './phoneFormatting';
import { escapeAttribute, escapeHtml, sanitizeHref } from './sanitize';

export function renderHeroSection(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('hero-copy');
    if (!container) return;
    const formattedPhone = formatPhoneDisplay(content.contact.phoneDisplay);
    const safeContactHref = escapeAttribute(sanitizeHref(content.contact.phoneHref));

    container.innerHTML = `
        <div
            class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 rounded-full"
        >
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span id="hero-badge-text">${escapeHtml(content.hero.badge)}</span>
        </div>
        <h1 id="hero-title" class="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6 drop-shadow-lg">
            <span id="hero-title-main">${escapeHtml(content.hero.titleMain)}</span> <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600" id="hero-title-sub">${escapeHtml(content.hero.titleSub)}</span>
        </h1>
        <p class="text-xl text-slate-200 mb-10 max-w-xl leading-relaxed font-light drop-shadow" id="hero-description">
            ${escapeHtml(content.hero.description)}
        </p>
        <div class="flex flex-wrap gap-4">
            <a
                href="#contacto"
                id="hero-primary-cta-link"
                data-magnetic
                class="bg-accent-600 hover:bg-accent-700 text-white px-8 py-4 rounded font-bold transition shadow-lg shadow-accent-600/30 transform hover:-translate-y-1 flex items-center gap-2"
            >
                <span id="hero-primary-cta-text">${escapeHtml(content.hero.primaryCta)}</span>
                ${renderIconMarkup('fa-solid fa-arrow-right')}
            </a>
            <a
                href="${safeContactHref}"
                id="hero-contract-link"
                data-magnetic
                class="px-8 py-4 rounded font-bold text-white border border-white/30 hover:bg-white/10 transition backdrop-blur-sm flex items-center gap-2"
            >
                ${renderIconMarkup('fa-solid fa-phone text-xl')}
                <span id="hero-contract-text">${escapeHtml(content.contact.contractsLabel)}: ${escapeHtml(formattedPhone)}</span>
            </a>
        </div>
    `;
}
