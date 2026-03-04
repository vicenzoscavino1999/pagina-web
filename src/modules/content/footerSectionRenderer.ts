import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderIconMarkup } from './iconMarkup';
import { escapeAttribute, escapeHtml, sanitizeHref } from './sanitize';

export function renderFooterSection(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('footer-content');
    if (!container) return;
    const safeWhatsappHref = escapeAttribute(sanitizeHref(content.contact.whatsappHref));
    const safePhoneHref = escapeAttribute(sanitizeHref(content.contact.phoneHref));

    container.innerHTML = `
        <div class="grid md:grid-cols-4 gap-12 mb-12">
            <div class="col-span-1 md:col-span-1">
                <div class="flex items-center gap-2 mb-6">
                    <div class="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white">${renderIconMarkup('fa-solid fa-box-open')}</div>
                    <span class="font-bold text-xl text-white" id="footer-brand-name">${escapeHtml(content.brand.footerBrand)}</span>
                </div>
                <p class="mb-6 leading-relaxed" id="footer-intro">${escapeHtml(content.footer.intro)}</p>
                <a
                    href="${safeWhatsappHref}"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="footer-whatsapp-link"
                    class="inline-flex items-center gap-2 bg-green-700 px-4 py-2 rounded-lg text-white hover:bg-green-600 transition font-bold"
                >
                    ${renderIconMarkup('fa-brands fa-whatsapp')}
                    <span id="footer-whatsapp-text">${escapeHtml(content.footer.whatsappLabel)}</span>
                </a>
            </div>
            <div>
                <h4 class="text-white font-bold uppercase tracking-wider mb-6" id="footer-company-heading">${escapeHtml(content.footer.companyHeading)}</h4>
                <ul class="space-y-3" id="footer-company-list">
                    ${content.footer.companyItems
                        .map((item) => `<li class="hover:text-white transition">${escapeHtml(item)}</li>`)
                        .join('')}
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold uppercase tracking-wider mb-6" id="footer-coverage-heading">${escapeHtml(content.footer.coverageHeading)}</h4>
                <ul class="space-y-3" id="footer-coverage-list">
                    ${content.footer.coverageItems
                        .map((item) => `<li class="hover:text-white transition">${escapeHtml(item)}</li>`)
                        .join('')}
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold uppercase tracking-wider mb-6" id="footer-contracts-heading">${escapeHtml(content.footer.contractsHeading)}</h4>
                <p class="mb-4 text-xs" id="footer-contracts-description">${escapeHtml(content.footer.contractsDescription)}</p>
                <a
                    href="${safePhoneHref}"
                    id="footer-contract-link"
                    class="inline-flex items-center gap-2 bg-brand-600 px-4 py-2 rounded-lg text-white hover:bg-brand-500 transition font-bold"
                    aria-label="Llamar a contratos"
                >
                    ${renderIconMarkup('fa-solid fa-phone')}
                    <span id="footer-contract-text">${escapeHtml(content.contact.phoneDisplay)}</span>
                </a>
            </div>
        </div>
        <div class="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p id="footer-copyright">${escapeHtml(content.footer.copyright)}</p>
            <div class="flex gap-6" id="footer-signoff">
                ${content.footer.signoff.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
            </div>
        </div>
    `;
}
