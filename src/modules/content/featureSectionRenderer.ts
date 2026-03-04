import type { SiteContent } from '../../content/siteContent';
import { renderCarouselSection } from './carouselSectionRenderer';
import { ContentDomWriter } from './domWriter';
import { renderUniversityFeatureMockups } from './featureMockupRenderer';
import { renderIconMarkup } from './iconMarkup';
import { escapeHtml, sanitizeHtmlWithLineBreaks } from './sanitize';

export function renderFeatureSections(content: SiteContent, dom: ContentDomWriter): void {
    renderUniversityFeatures(content, dom);
    renderCarouselSection(content, dom);
}

function renderUniversityFeatures(content: SiteContent, dom: ContentDomWriter): void {
    dom.setHtml('uf-title', sanitizeHtmlWithLineBreaks(content.features.titleHtml));

    const firstFeatureLabel = content.features.items[0]?.title;
    if (firstFeatureLabel) {
        dom.setText('uf-nav-label', firstFeatureLabel);
    }

    renderUniversityFeatureList(content, dom);
    renderUniversityNavDots(content, dom);
    renderUniversityFeatureMockups(content, dom);
}

function renderUniversityFeatureList(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('uf-feature-list');
    if (!container) return;

    container.innerHTML = content.features.items
        .map(
            (item, index) => `
                <div class="feature-item" data-index="${index}">
                    <div class="fi-icon">${renderIconMarkup(item.iconClass)}</div>
                    <div class="fi-text">
                        <h3 class="fi-title">${escapeHtml(item.title)}</h3>
                        <p class="fi-desc">${escapeHtml(item.description)}</p>
                    </div>
                </div>
            `
        )
        .join('');
}

function renderUniversityNavDots(content: SiteContent, dom: ContentDomWriter): void {
    const dotsContainer = dom.getById('uf-nav-dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    content.features.items.forEach((item, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = index === 0 ? 'uf-nav-dot uf-nav-dot--active' : 'uf-nav-dot';
        dot.dataset['index'] = String(index);
        dot.setAttribute('aria-label', item.title);
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.setAttribute('tabindex', index === 0 ? '0' : '-1');
        dotsContainer.appendChild(dot);
    });
}
