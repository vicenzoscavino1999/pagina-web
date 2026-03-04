import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderIconMarkup } from './iconMarkup';
import { escapeHtml, sanitizeHtmlWithLineBreaks } from './sanitize';

export function renderUniversityFeatureMockups(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('uf-mockup-screens');
    if (!container) return;

    const { mockup } = content.features;

    container.innerHTML = `
        <div class="mockup-screen mockup-screen--visible" id="ms-0">
            <div class="ms-inner ms-campus">
                <div class="ms-icon">${renderIconMarkup('fa-solid fa-truck')}</div>
                <div class="ms-chip" id="uf-mockup-chip">${escapeHtml(mockup.coverageChip)}</div>
                <p class="ms-text" id="uf-mockup-pickup-text">${sanitizeHtmlWithLineBreaks(mockup.pickupTextHtml)}</p>
                <div class="ms-badge-row">
                    <div class="ms-campus-card">${renderIconMarkup('fa-solid fa-location-dot')} <span id="uf-mockup-pickup-tag-one">${escapeHtml(mockup.pickupTagOne)}</span></div>
                    <div class="ms-campus-card">${renderIconMarkup('fa-solid fa-location-dot')} <span id="uf-mockup-pickup-tag-two">${escapeHtml(mockup.pickupTagTwo)}</span></div>
                </div>
            </div>
        </div>
        <div class="mockup-screen" id="ms-1">
            <div class="ms-inner ms-shield">
                <div class="ms-shield-icon">${renderIconMarkup('fa-solid fa-shield-halved')}</div>
                <p class="ms-text ms-text--light" id="uf-mockup-shield-text">${escapeHtml(mockup.shieldText)}</p>
                <div class="ms-coverage">
                    <div class="ms-bar">
                        <div class="ms-bar-fill" style="width:100%"></div>
                    </div>
                    <span id="uf-mockup-shield-coverage">${escapeHtml(mockup.shieldCoverage)}</span>
                </div>
            </div>
        </div>
        <div class="mockup-screen" id="ms-2">
            <div class="ms-inner ms-notify">
                <div class="ms-notify-icon">${renderIconMarkup('fa-brands fa-whatsapp')}</div>
                <div class="ms-notification">
                    <div class="notif-row"><span class="notif-dot done"></span><span id="uf-mockup-notif-one">${escapeHtml(mockup.notificationOne)}</span></div>
                    <div class="notif-row"><span class="notif-dot active pulse"></span><span id="uf-mockup-notif-two">${escapeHtml(mockup.notificationTwo)}</span></div>
                    <div class="notif-row dimmed"><span class="notif-dot"></span><span id="uf-mockup-notif-three">${escapeHtml(mockup.notificationThree)}</span></div>
                </div>
            </div>
        </div>
        <div class="mockup-screen" id="ms-3">
            <div class="ms-inner ms-payment">
                <div class="ms-payment-row">
                    <div class="pay-method active">${renderIconMarkup('fa-solid fa-clipboard-check')} <span id="uf-mockup-method-one">${escapeHtml(mockup.methodOne)}</span></div>
                    <div class="pay-method">${renderIconMarkup('fa-solid fa-box-open')} <span id="uf-mockup-method-two">${escapeHtml(mockup.methodTwo)}</span></div>
                    <div class="pay-method">${renderIconMarkup('fa-solid fa-truck-fast')} <span id="uf-mockup-method-three">${escapeHtml(mockup.methodThree)}</span></div>
                    <div class="pay-method">${renderIconMarkup('fa-solid fa-circle-check')} <span id="uf-mockup-method-four">${escapeHtml(mockup.methodFour)}</span></div>
                </div>
                <div class="ms-receipt">
                    <div class="receipt-row"><span id="uf-mockup-receipt-one-label">${escapeHtml(mockup.receiptOneLabel)}</span><span id="uf-mockup-receipt-one-value">${escapeHtml(mockup.receiptOneValue)}</span></div>
                    <div class="receipt-row"><span id="uf-mockup-receipt-two-label">${escapeHtml(mockup.receiptTwoLabel)}</span><span id="uf-mockup-receipt-two-value">${escapeHtml(mockup.receiptTwoValue)}</span></div>
                    <div class="receipt-row receipt-total"><span id="uf-mockup-receipt-three-label">${escapeHtml(mockup.receiptThreeLabel)}</span><span id="uf-mockup-receipt-three-value">${escapeHtml(mockup.receiptThreeValue)}</span></div>
                </div>
            </div>
        </div>
    `;
}
