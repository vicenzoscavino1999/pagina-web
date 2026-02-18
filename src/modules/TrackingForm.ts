import { EventBus } from '../utils/events';



export class TrackingForm {
    #form: HTMLFormElement | null;
    #abortController: AbortController | null = null;
    static #TRACKING_REGEX = /^[A-Z0-9-]{4,20}$/;

    constructor(formElement: HTMLElement | null) {
        if (!formElement || !(formElement instanceof HTMLFormElement)) {
            console.warn('[TrackingForm] Form not found');
            this.#form = null;
            return;
        }
        this.#form = formElement;
        this.#form.addEventListener('submit', (e) => { void this.#handleSubmit(e); });
    }

    static #validate(value: string): boolean {
        return TrackingForm.#TRACKING_REGEX.test(value.toUpperCase());
    }

    async #handleSubmit(e: Event): Promise<void> {
        e.preventDefault();
        if (!this.#form) return;

        const trackingInput = this.#form.querySelector<HTMLInputElement>('#tracking-input');
        const trackingBtn = this.#form.querySelector<HTMLButtonElement>('#tracking-btn') as HTMLButtonElement;

        const raw = trackingInput?.value ?? '';
        const clean = raw.replace(/[^A-Z0-9-]/gi, '').toUpperCase();

        if (!TrackingForm.#validate(clean)) {
            console.warn('Invalid Tracking ID Format');
            return;
        }

        this.#abortController?.abort();
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;

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
        }
    }

    async #mockFetch(trackingId: string, signal: AbortSignal): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const id = setTimeout(resolve, 1500);
            signal.addEventListener('abort', () => {
                clearTimeout(id);
                reject(new DOMException('Aborted', 'AbortError'));
            });
        });

        if (signal.aborted) return;

        this.#renderResult(trackingId);
        EventBus.emit('tracking:success', { trackingId, date: new Date() });
    }

    #renderResult(trackingId: string): void {
        const trackingResult = document.getElementById('tracking-result');
        const resultId = document.getElementById('result-id');
        const resultDate = document.getElementById('result-date');

        if (!trackingResult || !resultId || !resultDate) return;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toLocaleDateString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' });

        resultId.innerText = trackingId;
        resultDate.innerText = "Estimado: " + dateString;

        trackingResult.classList.remove('hidden');
        trackingResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const resetBtn = document.getElementById('reset-tracking-btn');
        if (resetBtn) {
            resetBtn.onclick = (): void => {
                trackingResult.classList.add('hidden');
                this.#form?.reset();
            };
        }
    }

    destroy(): void {
        this.#abortController?.abort();
        this.#form = null;
    }
}

