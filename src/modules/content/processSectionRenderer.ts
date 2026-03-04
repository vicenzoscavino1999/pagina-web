import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderIconMarkup } from './iconMarkup';
import { renderResponsiveSourceMarkup } from './responsiveMedia';
import { escapeAttribute, escapeHtml } from './sanitize';

export function renderProcessSections(content: SiteContent, dom: ContentDomWriter): void {
    renderFlow(content, dom);
}

function renderFlow(content: SiteContent, dom: ContentDomWriter): void {
    dom.setText('flow-title', content.flow.title);

    const container = dom.getById('flow-steps');
    if (!container) return;

    const connectorHtml = `
        <div class="flow-connector hidden md:block absolute left-[16%] right-[16%] z-0" aria-hidden="true">
            <span class="flow-connector-line"></span>
            <span class="flow-connector-scan"></span>
            <span class="flow-connector-node flow-connector-node--start"></span>
            <span class="flow-connector-node flow-connector-node--mid"></span>
            <span class="flow-connector-node flow-connector-node--end"></span>
        </div>
    `;

    const stepsHtml = content.flow.steps
        .map((step, index) => {
            const delay = index > 0 ? ` style="transition-delay: ${index * 100}ms;"` : '';
            const sourceMarkup = renderResponsiveSourceMarkup(step.imageSrc);
            return `
                <div class="reveal flow-step-card relative z-10"${delay} data-flow-step="${index + 1}">
                    <article class="flow-step-shell h-full text-left">
                        <div class="flow-step-media">
                            <picture class="flow-step-picture">
                                ${sourceMarkup}
                                <img class="flow-step-image" src="${escapeAttribute(step.imageSrc)}" alt="${escapeAttribute(step.imageAlt)}" loading="lazy" decoding="async">
                            </picture>
                            <div class="flow-step-media-overlay" aria-hidden="true"></div>
                            <div class="flow-step-grid" aria-hidden="true"></div>
                            <span class="flow-step-chip">Paso 0${index + 1}</span>
                            <div class="flow-step-icon" aria-hidden="true">
                                ${renderIconMarkup(step.iconClass)}
                            </div>
                            <span class="flow-step-orb flow-step-orb--one" aria-hidden="true"></span>
                            <span class="flow-step-orb flow-step-orb--two" aria-hidden="true"></span>
                        </div>
                        <div class="flow-step-content">
                            <h3 class="text-xl font-bold text-slate-900 mb-2">${escapeHtml(step.title)}</h3>
                            <p class="text-slate-500 text-sm leading-relaxed">${escapeHtml(step.description)}</p>
                            <div class="flow-step-progress" aria-hidden="true">
                                <span class="flow-step-progress-bar"></span>
                            </div>
                        </div>
                    </article>
                </div>
            `;
        })
        .join('');

    container.innerHTML = `${connectorHtml}${stepsHtml}`;
}
