import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderIconMarkup } from './iconMarkup';
import { escapeAttribute, escapeHtml, sanitizeHtmlWithLineBreaks } from './sanitize';

export function renderCarouselSection(content: SiteContent, dom: ContentDomWriter): void {
    renderCarouselTrack(content, dom);
    renderCarouselDots(content, dom);
}

function renderCarouselTrack(content: SiteContent, dom: ContentDomWriter): void {
    const track = dom.getById('carousel-track');
    if (!track) return;

    track.innerHTML = [
        renderCarouselSlideOne(content),
        renderCarouselSlideTwo(content),
        renderCarouselSlideThree(content),
    ].join('');
}

function renderCarouselDots(content: SiteContent, dom: ContentDomWriter): void {
    const dots = dom.getById('carousel-dots');
    if (!dots) return;

    const labels = [
        content.carousel.slideOne.label,
        content.carousel.slideTwo.label,
        content.carousel.slideThree.label,
    ];

    dots.innerHTML = labels
        .map(
            (label, index) => `
                <button
                    type="button"
                    class="${index === 0 ? 'carousel-dot carousel-dot--active' : 'carousel-dot'}"
                    data-slide="${index}"
                    id="carousel-tab-${index + 1}"
                    role="tab"
                    aria-label="${escapeAttribute(label)}"
                    aria-controls="slide-${index + 1}"
                    aria-selected="${index === 0 ? 'true' : 'false'}"
                    tabindex="${index === 0 ? '0' : '-1'}"
                ></button>
            `
        )
        .join('');
}

function renderCarouselSlideOne(content: SiteContent): string {
    const slide = content.carousel.slideOne;

    return `
        <div
            class="carousel-slide slide--active"
            id="slide-1"
            role="tabpanel"
            aria-labelledby="carousel-tab-1"
            aria-hidden="false"
            tabindex="-1"
        >
            <div class="carousel-content">
                <div class="slide-icon-wrap">
                    <div class="slide-icon">
                        ${renderIconMarkup('fa-solid fa-clipboard-check')}
                    </div>
                    <div class="slide-icon-ring"></div>
                </div>
                <div class="slide-label" id="carousel-slide-1-label">${escapeHtml(slide.label)}</div>
                <h2 class="slide-title" id="carousel-slide-1-title">${sanitizeHtmlWithLineBreaks(slide.titleHtml)}</h2>
                <p class="slide-body" id="carousel-slide-1-body">${escapeHtml(slide.body)}</p>
                <div class="slide-universities">
                    <span class="uni-badge">${renderIconMarkup('fa-solid fa-file-lines')} <span id="carousel-slide-1-badge-one">${escapeHtml(slide.badgeOne)}</span></span>
                    <span class="uni-badge">${renderIconMarkup('fa-solid fa-scroll')} <span id="carousel-slide-1-badge-two">${escapeHtml(slide.badgeTwo)}</span></span>
                    <span class="uni-badge">${renderIconMarkup('fa-solid fa-id-card')} <span id="carousel-slide-1-badge-three">${escapeHtml(slide.badgeThree)}</span></span>
                </div>
            </div>
            <div class="slide-visual">
                <div class="phone-mockup">
                    <div class="phone-screen screen-pickup">
                        <div class="pm-header">
                            <span class="pm-dot green"></span>
                            <span class="pm-title" id="carousel-slide-1-phone-title">${escapeHtml(slide.phoneTitle)}</span>
                        </div>
                        <div class="pm-map">
                            <div class="pm-pin bounce">
                                ${renderIconMarkup('fa-solid fa-location-dot text-brand-500')}
                            </div>
                            <div class="pm-map-grid"></div>
                            <div class="pm-campus-label" id="carousel-slide-1-phone-label">${escapeHtml(slide.phoneLabel)}</div>
                        </div>
                        <div class="pm-cta" id="carousel-slide-1-phone-cta">${escapeHtml(slide.phoneCta)}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCarouselSlideTwo(content: SiteContent): string {
    const slide = content.carousel.slideTwo;

    return `
        <div
            class="carousel-slide"
            id="slide-2"
            role="tabpanel"
            aria-labelledby="carousel-tab-2"
            aria-hidden="true"
            tabindex="-1"
        >
            <div class="carousel-content">
                <div class="slide-icon-wrap">
                    <div class="slide-icon slide-icon--blue">
                        ${renderIconMarkup('fa-solid fa-satellite-dish')}
                    </div>
                    <div class="slide-icon-ring ring--blue"></div>
                </div>
                <div class="slide-label" id="carousel-slide-2-label">${escapeHtml(slide.label)}</div>
                <h2 class="slide-title" id="carousel-slide-2-title">${sanitizeHtmlWithLineBreaks(slide.titleHtml)}</h2>
                <p class="slide-body" id="carousel-slide-2-body">${escapeHtml(slide.body)}</p>
                <div class="slide-stat-row">
                    <div class="slide-stat">
                        <span class="slide-stat-num">48h</span>
                        <span class="slide-stat-label" id="carousel-slide-2-stat-one-label">${escapeHtml(slide.statOneLabel)}</span>
                    </div>
                    <div class="slide-stat">
                        <span class="slide-stat-num">24h</span>
                        <span class="slide-stat-label" id="carousel-slide-2-stat-two-label">${escapeHtml(slide.statTwoLabel)}</span>
                    </div>
                </div>
            </div>
            <div class="slide-visual">
                <div class="phone-mockup">
                    <div class="phone-screen screen-tracking">
                        <div class="pm-header">
                            <span class="pm-dot blue"></span>
                            <span class="pm-title" id="carousel-slide-2-phone-title">${escapeHtml(slide.phoneTitle)}</span>
                        </div>
                        <div class="track-route">
                            <div class="route-line">
                                <div class="route-dot route-dot--done"></div>
                                <div class="route-segment done"></div>
                                <div class="route-dot route-dot--active pulse"></div>
                                <div class="route-segment pending"></div>
                                <div class="route-dot route-dot--pending"></div>
                            </div>
                            <div class="route-labels">
                                <span id="carousel-slide-2-route-one">${escapeHtml(slide.routeOne)}</span>
                                <span class="active-label" id="carousel-slide-2-route-two">${escapeHtml(slide.routeTwo)}</span>
                                <span id="carousel-slide-2-route-three">${escapeHtml(slide.routeThree)}</span>
                            </div>
                        </div>
                        <div class="pm-eta"><span id="carousel-slide-2-eta-prefix">${escapeHtml(slide.etaPrefix)}</span> <strong id="carousel-slide-2-eta-value">${escapeHtml(slide.etaValue)}</strong></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCarouselSlideThree(content: SiteContent): string {
    const slide = content.carousel.slideThree;

    return `
        <div
            class="carousel-slide"
            id="slide-3"
            role="tabpanel"
            aria-labelledby="carousel-tab-3"
            aria-hidden="true"
            tabindex="-1"
        >
            <div class="carousel-content">
                <div class="slide-icon-wrap">
                    <div class="slide-icon slide-icon--green">
                        ${renderIconMarkup('fa-solid fa-bolt')}
                    </div>
                    <div class="slide-icon-ring ring--green"></div>
                </div>
                <div class="slide-label" id="carousel-slide-3-label">${escapeHtml(slide.label)}</div>
                <h2 class="slide-title" id="carousel-slide-3-title">${sanitizeHtmlWithLineBreaks(slide.titleHtml)}</h2>
                <p class="slide-body" id="carousel-slide-3-body">${escapeHtml(slide.body)}</p>
                <div class="slide-timer">
                    <div class="timer-circle">
                        ${renderIconMarkup('fa-regular fa-clock')}
                        <span id="carousel-slide-3-timer-one">${escapeHtml(slide.timerOne)}</span>
                    </div>
                    <div class="timer-arrow">&rarr;</div>
                    <div class="timer-circle timer-circle--green">
                        ${renderIconMarkup('fa-solid fa-check')}
                        <span id="carousel-slide-3-timer-two">${escapeHtml(slide.timerTwo)}</span>
                    </div>
                </div>
            </div>
            <div class="slide-visual">
                <div class="phone-mockup">
                    <div class="phone-screen screen-delivered">
                        <div class="pm-header">
                            <span class="pm-dot green"></span>
                            <span class="pm-title" id="carousel-slide-3-phone-title">${escapeHtml(slide.phoneTitle)}</span>
                        </div>
                        <div class="delivered-check">
                            <div class="check-circle">
                                ${renderIconMarkup('fa-solid fa-circle-check')}
                            </div>
                            <p class="delivered-msg" id="carousel-slide-3-delivered-message">${escapeHtml(slide.deliveredMessage)}</p>
                            <p class="delivered-time" id="carousel-slide-3-delivered-time">${escapeHtml(slide.deliveredTime)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
