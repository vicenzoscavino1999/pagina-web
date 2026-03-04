import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderFooterSection } from './footerSectionRenderer';
import { renderIconMarkup } from './iconMarkup';
import { formatPhoneDisplay } from './phoneFormatting';
import { escapeAttribute, escapeHtml, sanitizeHref } from './sanitize';

export function renderSupportSections(content: SiteContent, dom: ContentDomWriter): void {
    renderContactCta(content, dom);
    renderFaq(content, dom);
    renderTicker(content, dom);
    renderFooter(content, dom);
}

function renderContactCta(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('contact-cta-panel');
    if (!container) return;

    const safePhoneHref = escapeAttribute(sanitizeHref(content.contact.phoneHref));
    const safeWhatsappHref = escapeAttribute(sanitizeHref(content.contact.whatsappHref));
    const formattedPhone = escapeHtml(formatPhoneDisplay(content.contact.phoneDisplay));
    const coverageSummary = content.footer.coverageItems.slice(0, 2).join(' - ');

    container.innerHTML = `
        <div class="contact-cta-shell">
            <div class="contact-cta-grid">
                <article class="contact-cta-card">
                    <div class="contact-cta-icon-wrap">${renderIconMarkup('fa-solid fa-phone-volume')}</div>
                    <p class="contact-cta-eyebrow">Canal comercial directo</p>
                    <h3 class="contact-cta-title">Coordinacion inmediata por llamada</h3>
                    <p class="contact-cta-description">
                        Agenda recojos, cobertura y operacion con el equipo de contratos en una sola llamada.
                    </p>
                    <a href="${safePhoneHref}" id="contact-cta-call-link" class="contact-cta-link contact-cta-link--primary">
                        ${renderIconMarkup('fa-solid fa-phone')}
                        <span>Llamar ${formattedPhone}</span>
                    </a>
                </article>
                <article class="contact-cta-card">
                    <div class="contact-cta-icon-wrap contact-cta-icon-wrap--whatsapp">${renderIconMarkup('fa-brands fa-whatsapp')}</div>
                    <p class="contact-cta-eyebrow">Canal rapido</p>
                    <h3 class="contact-cta-title">Atencion por WhatsApp empresarial</h3>
                    <p class="contact-cta-description">
                        Comparte tu requerimiento y recibe respuesta comercial para documentos, valorados y paqueteria.
                    </p>
                    <a
                        href="${safeWhatsappHref}"
                        target="_blank"
                        rel="noopener noreferrer"
                        id="contact-cta-whatsapp-link"
                        class="contact-cta-link contact-cta-link--ghost"
                    >
                        ${renderIconMarkup('fa-brands fa-whatsapp')}
                        <span>Escribir por WhatsApp</span>
                    </a>
                </article>
            </div>
            <div class="contact-cta-meta" aria-label="Indicadores clave">
                <span class="contact-cta-pill">
                    ${renderIconMarkup('fa-solid fa-bolt')}
                    <strong>${escapeHtml(content.stats.items[0]?.target ? `${content.stats.items[0].target}+` : '15+')}</strong> anos de experiencia
                </span>
                <span class="contact-cta-pill">
                    ${renderIconMarkup('fa-solid fa-map-location-dot')}
                    ${escapeHtml(coverageSummary)}
                </span>
                <span class="contact-cta-pill">
                    ${renderIconMarkup('fa-solid fa-route')}
                    ${escapeHtml(content.features.mockup.receiptThreeValue)} visitas incluidas
                </span>
            </div>
        </div>
    `;
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
