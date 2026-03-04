import { EventBus } from '../utils/events';
import { requireById, requireQs } from '../utils/dom';



export class TrackingForm {
    static #TRACKING_REGEX = /^[A-Z0-9-]{4,20}$/;
    static #STATUS_MESSAGE: Record<TrackingState, string> = {
        idle: 'Ingresa tu guia para rastrear.',
        invalid: 'Formato invalido. Usa letras, numeros y guion (4-20).',
        ready: 'Guia valida. Listo para rastrear.',
        loading: 'Consultando estado de la guia...',
        success: 'Seguimiento actualizado correctamente.',
    };

    #form: HTMLFormElement | null;
    #trackingInput: HTMLInputElement | null = null;
    #trackingBtn: HTMLButtonElement | null = null;
    #inlineStatus: HTMLElement | null = null;
    #abortController: AbortController | null = null;
    #submitHandler: ((e: Event) => void) | null = null;
    #inputHandler: (() => void) | null = null;
    #resetBtn: HTMLElement | null = null;
    #resetHandler: (() => void) | null = null;

    constructor(formElement: HTMLElement | null) {
        if (!formElement || !(formElement instanceof HTMLFormElement)) {
            console.warn('[TrackingForm] Form not found');
            this.#form = null;
            return;
        }
        const form = formElement;
        this.#form = form;
        this.#assertMarkupContract(form);

        this.#trackingInput = requireQs<HTMLInputElement>('#tracking-input', form, 'TrackingForm');
        this.#trackingBtn = requireQs<HTMLButtonElement>('#tracking-btn', form, 'TrackingForm');
        this.#inlineStatus = document.getElementById('tracking-inline-status');

        this.#submitHandler = (e: Event): void => {
            void this.#handleSubmit(e, form);
        };
        form.addEventListener('submit', this.#submitHandler);

        this.#inputHandler = (): void => {
            this.#syncTrackingInputState();
        };
        this.#trackingInput.addEventListener('input', this.#inputHandler);

        this.#syncTrackingInputState();
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

        const trackingInput = this.#trackingInput ?? requireQs<HTMLInputElement>('#tracking-input', form, 'TrackingForm');
        const trackingBtn = this.#trackingBtn ?? requireQs<HTMLButtonElement>('#tracking-btn', form, 'TrackingForm');
        const trackingResult = requireById('tracking-result', document, 'TrackingForm');

        const raw = trackingInput.value;
        const clean = TrackingForm.#sanitize(raw);
        trackingInput.value = clean;

        if (!TrackingForm.#validate(clean)) {
            console.warn('Invalid Tracking ID Format');
            this.#setTrackingState('invalid');
            return;
        }

        this.#abortController?.abort();
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;
        trackingResult.setAttribute('aria-busy', 'true');
        this.#setTrackingState('loading');

        const originalBtnContent = trackingBtn.innerHTML;
        trackingBtn.disabled = true;
        trackingBtn.setAttribute('aria-disabled', 'true');
        trackingBtn.innerHTML = '<div class="loader"></div>';

        EventBus.emit('tracking:submit', { trackingId: clean });
        let trackingWasResolved = false;

        try {
            await this.#mockFetch(clean, signal);
            trackingWasResolved = true;
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error('Tracking Error:', err);
            }
        } finally {
            if (!signal.aborted) {
                trackingBtn.innerHTML = originalBtnContent;
                trackingBtn.disabled = false;
                trackingBtn.setAttribute('aria-disabled', 'false');
                if (trackingWasResolved) {
                    this.#setTrackingState('success');
                } else {
                    this.#syncTrackingInputState();
                }
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
        this.#setTrackingState('success');

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
            this.#syncTrackingInputState();
            trackingInput.focus();
        };

        this.#resetBtn.addEventListener('click', this.#resetHandler);
    }

    static #sanitize(value: string): string {
        return value.replace(/[^A-Z0-9-]/gi, '').toUpperCase();
    }

    #syncTrackingInputState(): void {
        if (!this.#trackingInput || !this.#trackingBtn || !this.#form) return;

        const sanitizedValue = TrackingForm.#sanitize(this.#trackingInput.value);
        if (this.#trackingInput.value !== sanitizedValue) {
            this.#trackingInput.value = sanitizedValue;
        }

        if (sanitizedValue.length === 0) {
            this.#trackingBtn.disabled = true;
            this.#trackingBtn.setAttribute('aria-disabled', 'true');
            this.#setTrackingState('idle');
            return;
        }

        const isValid = TrackingForm.#validate(sanitizedValue);
        this.#trackingBtn.disabled = !isValid;
        this.#trackingBtn.setAttribute('aria-disabled', String(!isValid));
        this.#setTrackingState(isValid ? 'ready' : 'invalid');
    }

    #setTrackingState(state: TrackingState): void {
        if (!this.#form) return;

        this.#form.dataset['trackingState'] = state;
        if (!this.#inlineStatus) return;
        this.#inlineStatus.textContent = TrackingForm.#STATUS_MESSAGE[state];
    }

    destroy(): void {
        this.#abortController?.abort();
        if (this.#form && this.#submitHandler) {
            this.#form.removeEventListener('submit', this.#submitHandler);
        }
        if (this.#trackingInput && this.#inputHandler) {
            this.#trackingInput.removeEventListener('input', this.#inputHandler);
        }
        if (this.#resetBtn && this.#resetHandler) {
            this.#resetBtn.removeEventListener('click', this.#resetHandler);
        }
        this.#form = null;
        this.#trackingInput = null;
        this.#trackingBtn = null;
        this.#inlineStatus = null;
        this.#submitHandler = null;
        this.#inputHandler = null;
        this.#resetBtn = null;
        this.#resetHandler = null;
    }
}

type TrackingState = 'idle' | 'invalid' | 'ready' | 'loading' | 'success';

