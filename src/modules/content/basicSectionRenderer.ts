import type { SiteContent } from '../../content/siteContent';
import { renderAppleSection } from './appleSectionRenderer';
import { ContentDomWriter } from './domWriter';
import { formatPhoneDisplay } from './phoneFormatting';
import { renderHeroSection } from './heroSectionRenderer';
import { getResponsiveSourceSet } from './responsiveMedia';
import { escapeHtml } from './sanitize';

export function renderBasicSections(content: SiteContent, dom: ContentDomWriter): void {
    renderMedia(content, dom);
    renderBrand(content, dom);
    renderNavigation(content, dom);
    renderHero(content, dom);
    renderContact(content, dom);
    renderApple(content, dom);
}

function renderMedia(content: SiteContent, dom: ContentDomWriter): void {
    dom.setAttribute('hero-bg', 'src', content.media.heroBackgroundSrc);
    dom.setAttribute('hero-bg', 'alt', content.media.heroBackgroundAlt);

    const heroSources = getResponsiveSourceSet(content.media.heroBackgroundSrc);
    if (heroSources) {
        dom.setAttribute('hero-bg-avif-source', 'srcset', heroSources.avifSrcSet);
        dom.setAttribute('hero-bg-avif-source', 'sizes', heroSources.sizes);
        dom.setAttribute('hero-bg-webp-source', 'srcset', heroSources.webpSrcSet);
        dom.setAttribute('hero-bg-webp-source', 'sizes', heroSources.sizes);
    }

    dom.setAttribute('apple-bg-image', 'src', content.media.appleBackgroundSrc);
    dom.setAttribute('apple-bg-image', 'alt', content.media.appleBackgroundAlt);

    const appleSources = getResponsiveSourceSet(content.media.appleBackgroundSrc);
    if (appleSources) {
        dom.setAttribute('apple-bg-avif-source', 'srcset', appleSources.avifSrcSet);
        dom.setAttribute('apple-bg-avif-source', 'sizes', appleSources.sizes);
        dom.setAttribute('apple-bg-webp-source', 'srcset', appleSources.webpSrcSet);
        dom.setAttribute('apple-bg-webp-source', 'sizes', appleSources.sizes);
    }

    dom.setAttribute('stats-bg', 'src', content.media.statsBackgroundSrc);
    dom.setAttribute('stats-bg', 'alt', content.media.statsBackgroundAlt);
}

function renderBrand(content: SiteContent, dom: ContentDomWriter): void {
    dom.setText('uf-company-label', content.brand.legalName);
}

function renderNavigation(content: SiteContent, dom: ContentDomWriter): void {
    dom.setText('nav-services-link', content.nav.servicesLabel);
    dom.setText('nav-tracking-link', content.nav.trackingLabel);
    dom.setText('nav-coverage-link', content.nav.coverageLabel);

    dom.setText('mobile-services-link', content.nav.servicesLabel);
    dom.setText('mobile-tracking-link', content.nav.trackingLabel);
    dom.setText('mobile-coverage-link', content.nav.coverageLabel);
}

function renderContact(content: SiteContent, dom: ContentDomWriter): void {
    const formattedPhone = formatPhoneDisplay(content.contact.phoneDisplay);
    const safeContractsLabel = escapeHtml(content.contact.contractsLabel);
    const safeFormattedPhone = escapeHtml(formattedPhone);
    const phoneLinkIds = ['nav-contract-link', 'mobile-contract-link', 'contact-contract-link'];

    phoneLinkIds.forEach((id) => {
        dom.setHref(id, content.contact.phoneHref);
    });

    dom.setHtml(
        'nav-contract-link',
        `
            <span class="nav-contract-label">${safeContractsLabel}</span>
            <span class="nav-contract-divider" aria-hidden="true">&bull;</span>
            <span class="nav-contract-number">${safeFormattedPhone}</span>
        `
    );
    dom.setText('mobile-contract-link', `${content.contact.contractsLabel}: ${formattedPhone}`);
    dom.setText('contact-contract-link', formattedPhone);
    dom.setText('contact-title', content.contact.sectionTitle);
    dom.setText('contact-subtitle-prefix', content.contact.sectionSubtitlePrefix);

    ['floating-whatsapp-link'].forEach((id) => {
        dom.setHref(id, content.contact.whatsappHref);
    });
    dom.setText('floating-whatsapp-text', `Chat ${formattedPhone}`);
}

function renderHero(content: SiteContent, dom: ContentDomWriter): void {
    renderHeroSection(content, dom);
}

function renderApple(content: SiteContent, dom: ContentDomWriter): void {
    renderAppleSection(content, dom);
}
