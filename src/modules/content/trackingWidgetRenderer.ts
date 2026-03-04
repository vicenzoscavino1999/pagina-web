import type { SiteContent } from '../../content/siteContent';
import { ContentDomWriter } from './domWriter';
import { renderIconMarkup } from './iconMarkup';
import { escapeAttribute, escapeHtml } from './sanitize';

type TimelineState = SiteContent['tracking']['timeline'][number]['state'];

export function renderTrackingWidget(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('tracking-widget');
    if (!container) return;

    container.innerHTML = `
        <div
            class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000 ease-in-out"
        ></div>
        <h3 class="text-2xl font-bold text-slate-900 mb-2 relative z-10" id="tracking-title">${escapeHtml(content.tracking.title)}</h3>
        <p class="text-slate-500 text-sm mb-6 relative z-10" id="tracking-subtitle">${escapeHtml(content.tracking.subtitle)}</p>
        <form id="tracking-form" class="space-y-4 relative z-10">
            <div>
                <label for="tracking-input" class="sr-only">Numero de guia</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        ${renderIconMarkup('fa-solid fa-magnifying-glass text-brand-400')}
                    </div>
                    <input
                        type="text"
                        id="tracking-input"
                        class="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400 font-mono uppercase tracking-wide transition-all shadow-inner focus:outline-none focus-visible:outline-none"
                        placeholder="${escapeAttribute(content.tracking.inputPlaceholder)}"
                        required
                    >
                </div>
            </div>
            <p id="tracking-inline-status" class="tracking-inline-status text-xs text-slate-400 -mt-2">
                Ingresa tu guia para rastrear.
            </p>
            <button
                type="submit"
                id="tracking-btn"
                data-magnetic
                class="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-brand-900/30 flex justify-center items-center gap-3"
            >
                <span id="tracking-submit-text">${escapeHtml(content.tracking.submitLabel)}</span>
                ${renderIconMarkup('fa-solid fa-chevron-right text-xs')}
            </button>
        </form>
        <div
            id="tracking-result"
            class="hidden mt-6 pt-6 border-t border-slate-100 relative z-10"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-busy="false"
        >
            <div class="flex justify-between items-center mb-4">
                <div>
                    <p class="text-xs text-slate-400 uppercase font-bold" id="tracking-result-guide-label">${escapeHtml(content.tracking.resultGuideLabel)}</p>
                    <p class="text-brand-900 font-mono font-bold" id="result-id">TRACK-123</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-slate-400 uppercase font-bold" id="tracking-result-estimated-label">${escapeHtml(content.tracking.resultEstimatedLabel)}</p>
                    <p class="text-green-600 font-bold" id="result-date">Calculando...</p>
                </div>
            </div>
            <div class="space-y-0 mt-4" id="tracking-timeline"></div>
            <button type="button" id="reset-tracking-btn" class="mt-4 text-xs text-slate-400 hover:text-brand-600 underline w-full text-center">
                <span id="tracking-reset-text">${escapeHtml(content.tracking.resetLabel)}</span>
            </button>
        </div>
    `;

    renderTrackingTimeline(content, dom);
}

function renderTrackingTimeline(content: SiteContent, dom: ContentDomWriter): void {
    const container = dom.getById('tracking-timeline');
    if (!container) return;

    const getTitleClass = (state: TimelineState): string => {
        if (state === 'current') return 'text-sm font-bold text-accent-600';
        if (state === 'pending') return 'text-sm font-bold text-slate-400';
        return 'text-sm font-bold text-slate-800';
    };

    const getDetailClass = (state: TimelineState): string => {
        return state === 'pending' ? 'text-xs text-slate-400' : 'text-xs text-slate-500';
    };

    container.innerHTML = content.tracking.timeline
        .map((step) => {
            const stateClass = step.state === 'pending' ? '' : ` ${step.state}`;
            return `
                <div class="timeline-item${stateClass}">
                    <span class="timeline-dot"></span>
                    <p class="${getTitleClass(step.state)}">${escapeHtml(step.title)}</p>
                    <p class="${getDetailClass(step.state)}">${escapeHtml(step.detail)}</p>
                </div>
            `;
        })
        .join('');
}
