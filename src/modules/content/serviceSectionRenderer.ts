import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderIconMarkup } from './iconMarkup';
import { renderResponsiveSourceMarkup } from './responsiveMedia';
import { escapeAttribute, escapeHtml, sanitizeClassName } from './sanitize';

interface ServiceScenePreset {
    kind: string;
    primaryIcon: string;
    secondaryIcon: string;
    tertiaryIcon: string;
}

const SCENE_PRESETS: readonly ServiceScenePreset[] = [
    {
        kind: 'docs',
        primaryIcon: 'fa-solid fa-file-lines',
        secondaryIcon: 'fa-solid fa-pen',
        tertiaryIcon: 'fa-solid fa-circle-check',
    },
    {
        kind: 'valued',
        primaryIcon: 'fa-solid fa-shield-halved',
        secondaryIcon: 'fa-solid fa-certificate',
        tertiaryIcon: 'fa-solid fa-lock',
    },
    {
        kind: 'parcel',
        primaryIcon: 'fa-solid fa-truck-fast',
        secondaryIcon: 'fa-solid fa-box-open',
        tertiaryIcon: 'fa-solid fa-location-dot',
    },
] as const;

const FALLBACK_SCENE_PRESET: ServiceScenePreset = {
    kind: 'docs',
    primaryIcon: 'fa-solid fa-file-lines',
    secondaryIcon: 'fa-solid fa-pen',
    tertiaryIcon: 'fa-solid fa-circle-check',
};

export function renderServiceSections(content: SiteContent, dom: ContentDomWriter): void {
    renderServices(content, dom);
    renderServiceCharacteristics(content, dom);
}

function renderServices(content: SiteContent, dom: ContentDomWriter): void {
    dom.setText('services-eyebrow', content.services.eyebrow);
    dom.setText('services-title', content.services.title);

    const container = dom.getById('services-grid');
    if (!container) return;

    container.innerHTML = content.services.cards
        .map((card, index) => {
            const delay = index > 0 ? ` style="transition-delay: ${index * 100}ms;"` : '';
            const preset = SCENE_PRESETS[index] ?? FALLBACK_SCENE_PRESET;
            const imageLoading = index === 0 ? 'eager' : 'lazy';
            const sourceMarkup = renderResponsiveSourceMarkup(card.imageSrc);
            const safeKind = sanitizeClassName(preset.kind);
            const safeBadgeClass = sanitizeClassName(card.badgeClass);
            return `
                <div class="reveal group service-card service-card--${safeKind}" data-service-card data-service-kind="${escapeAttribute(safeKind)}"${delay}>
                    <div class="service-card-media parallax-wrapper">
                        <picture class="service-card-picture">
                            ${sourceMarkup}
                            <img src="${escapeAttribute(card.imageSrc)}" width="800" height="500" alt="${escapeAttribute(card.imageAlt)}" class="parallax-img service-card-bg" loading="${imageLoading}" decoding="async">
                        </picture>
                        <div class="service-card-veil"></div>

                        <div class="service-scene" aria-hidden="true">
                            <span class="service-orb service-orb--one"></span>
                            <span class="service-orb service-orb--two"></span>
                            <span class="service-route" data-service-depth="0.2"></span>
                            <span class="service-icon-chip service-icon-chip--primary" data-service-depth="0.55">${renderIconMarkup(preset.primaryIcon)}</span>
                            <span class="service-icon-chip service-icon-chip--secondary" data-service-depth="0.38">${renderIconMarkup(preset.secondaryIcon)}</span>
                            <span class="service-icon-chip service-icon-chip--tertiary" data-service-depth="0.72">${renderIconMarkup(preset.tertiaryIcon)}</span>
                        </div>

                        <div class="service-badge absolute bottom-4 left-4 ${safeBadgeClass} text-white px-3 py-1 text-xs font-bold uppercase rounded shadow z-10">${escapeHtml(card.badge)}</div>
                    </div>
                    <div class="service-card-body p-8 relative">
                        <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">${escapeHtml(card.title)}</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6">${escapeHtml(card.description)}</p>
                        <span class="text-brand-600 font-bold text-sm uppercase tracking-wide flex items-center gap-2 group-hover:gap-4 transition-[gap]">${escapeHtml(card.cta)} ${renderIconMarkup('fa-solid fa-arrow-right')}</span>
                    </div>
                </div>
            `;
        })
        .join('');
}

function renderServiceCharacteristics(content: SiteContent, dom: ContentDomWriter): void {
    dom.setText('service-characteristics-title', content.serviceCharacteristics.title);

    const list = dom.getById('service-characteristics-list');
    if (!list) return;

    list.innerHTML = content.serviceCharacteristics.items
        .map((item, index) => {
            const delay = index > 0 ? ` style="transition-delay: ${index * 40}ms;"` : '';
            return `
                <li class="reveal flex items-start gap-3 bg-white rounded-xl border border-slate-100 p-4 shadow-sm"${delay}>
                    <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">&#10003;</span>
                    <span class="text-sm text-slate-700 leading-relaxed">${escapeHtml(item)}</span>
                </li>
            `;
        })
        .join('');
}
