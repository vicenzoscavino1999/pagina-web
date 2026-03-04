import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderTrackingWidget } from './trackingWidgetRenderer';
import { renderIconMarkup } from './iconMarkup';
import { escapeAttribute, escapeHtml, sanitizeHtmlWithLineBreaks, sanitizePercent } from './sanitize';

export function renderTrackingSections(content: SiteContent, dom: ContentDomWriter): void {
    renderTracking(content, dom);
    renderTruck(content, dom);
}

function renderTracking(content: SiteContent, dom: ContentDomWriter): void {
    renderTrackingWidget(content, dom);
}

function renderTruck(content: SiteContent, dom: ContentDomWriter): void {
    const firstStatus = content.truck.statuses[0];
    if (firstStatus) {
        dom.setText('ts-status', firstStatus);
    }

    dom.setHtml('truck-headline', sanitizeHtmlWithLineBreaks(content.truck.headlineHtml));
    dom.setText('truck-subheading', content.truck.subheading);
    dom.setText('truck-origin-label', content.truck.originLabel);
    dom.setText('truck-destination-label', content.truck.destinationLabel);
    dom.setText('truck-scroll-cue-text', content.truck.scrollCue);
    renderTruckWaypoints(content, dom);
}

function renderTruckWaypoints(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('truck-waypoints');
    if (!container) return;

    container.innerHTML = content.truck.waypoints
        .map((waypoint) => {
            const waypointClass = waypoint.isHome ? 'ts-waypoint ts-waypoint--home' : 'ts-waypoint';
            const pinClass = waypoint.isHome ? 'wp-pin wp-pin--home' : 'wp-pin';
            return `
                <div class="${waypointClass}" style="left:${escapeAttribute(sanitizePercent(waypoint.left))}">
                    <div class="wp-pole"></div>
                    <div class="${pinClass}">${renderIconMarkup(waypoint.iconClass)}</div>
                    <div class="wp-label">${escapeHtml(waypoint.title)}<br><span>${escapeHtml(waypoint.subtitle)}</span></div>
                </div>
            `;
        })
        .join('');
}
