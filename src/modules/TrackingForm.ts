import { EventBus } from '../utils/events';
import { requireById, requireQs } from '../utils/dom';



export class TrackingForm {
    #form: HTMLFormElement | null;
    #abortController: AbortController | null = null;
    #submitHandler: ((e: Event) => void) | null = null;
    #resetBtn: HTMLElement | null = null;
    #resetHandler: (() => void) | null = null;
    static #TRACKING_REGEX = /^[A-Z0-9-]{4,20}$/;

    constructor(formElement: HTMLElement | null) {
        if (!formElement || !(formElement instanceof HTMLFormElement)) {
            console.warn('[TrackingForm] Form not found');
            this.#form = null;
            return;
        }
        const form = formElement;
        this.#form = form;
        this.#assertMarkupContract(form);
        this.#submitHandler = (e: Event): void => {
            void this.#handleSubmit(e, form);
        };
        form.addEventListener('submit', this.#submitHandler);
    }

    static #validate(value: string): boolean {
        return TrackingForm.#TRACKING_REGEX.test(value.toUpperCase());
    }

    #assertMarkupContract(form: HTMLFormElement): void {
        requireQs('#tracking-input', form, 'TrackingForm');
        requireQs('#tracking-btn', form, 'TrackingForm');
        requireById('tracking-result', document, 'TrackingForm');
        requireById('result-id', document, 'TrackingForm');
        requireById('result-date', document, 'TrackingForm');
        requireById('reset-tracking-btn', document, 'TrackingForm');
    }

    async #handleSubmit(e: Event, form: HTMLFormElement): Promise<void> {
        e.preventDefault();

        const trackingInput = requireQs<HTMLInputElement>('#tracking-input', form, 'TrackingForm');
        const trackingBtn = requireQs<HTMLButtonElement>('#tracking-btn', form, 'TrackingForm');
        const trackingResult = requireById('tracking-result', document, 'TrackingForm');

        const raw = trackingInput.value;
        const clean = raw.replace(/[^A-Z0-9-]/gi, '').toUpperCase();

        if (!TrackingForm.#validate(clean)) {
            console.warn('Invalid Tracking ID Format');
            return;
        }

        this.#abortController?.abort();
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;
        trackingResult.setAttribute('aria-busy', 'true');

        const originalBtnContent = trackingBtn.innerHTML;
        trackingBtn.disabled = true;
        trackingBtn.innerHTML = '<div class="loader"></div>';

        EventBus.emit('tracking:submit', { trackingId: clean });

        try {
            await this.#mockFetch(clean, signal);
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error('Tracking Error:', err);
            }
        } finally {
            if (!signal.aborted) {
                trackingBtn.innerHTML = originalBtnContent;
                trackingBtn.disabled = false;
            }
            trackingResult.setAttribute('aria-busy', 'false');
        }
    }

    async #mockFetch(trackingId: string, signal: AbortSignal): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const id = setTimeout(resolve, 1500);
            signal.addEventListener('abort', () => {
                clearTimeout(id);
                reject(new DOMException('Aborted', 'AbortError'));
            }, { once: true });
        });

        this.#renderResult(trackingId);
        EventBus.emit('tracking:success', { trackingId, date: new Date() });
    }

    #renderResult(trackingId: string): void {
        const trackingResult = requireById('tracking-result', document, 'TrackingForm');
        const resultId = requireById('result-id', document, 'TrackingForm');
        const resultDate = requireById('result-date', document, 'TrackingForm');

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toLocaleDateString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' });

        resultId.innerText = trackingId;
        resultDate.innerText = "Estimado: " + dateString;

        trackingResult.classList.remove('hidden');
        trackingResult.setAttribute('aria-busy', 'false');
        trackingResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const resetBtn = requireById('reset-tracking-btn', document, 'TrackingForm');
        this.#bindResetButton(resetBtn, trackingResult);
    }

    #bindResetButton(resetBtn: HTMLElement, trackingResult: HTMLElement): void {
        if (this.#resetBtn && this.#resetHandler) {
            this.#resetBtn.removeEventListener('click', this.#resetHandler);
        }

        this.#resetBtn = resetBtn;
        this.#resetHandler = (): void => {
            trackingResult.classList.add('hidden');
            trackingResult.setAttribute('aria-busy', 'false');
            this.#form?.reset();
            const trackingInput = requireQs<HTMLInputElement>('#tracking-input', this.#form as HTMLFormElement, 'TrackingForm');
            trackingInput.focus();
        };

        this.#resetBtn.addEventListener('click', this.#resetHandler);
    }

    destroy(): void {
        this.#abortController?.abort();
        if (this.#form && this.#submitHandler) {
            this.#form.removeEventListener('submit', this.#submitHandler);
        }
        if (this.#resetBtn && this.#resetHandler) {
            this.#resetBtn.removeEventListener('click', this.#resetHandler);
        }
        this.#form = null;
        this.#submitHandler = null;
        this.#resetBtn = null;
        this.#resetHandler = null;
    }
}

