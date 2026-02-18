import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TrackingForm } from '@modules/TrackingForm';
import { EventBus } from '@utils/events';

describe('TrackingForm', () => {
    let form: HTMLFormElement;
    let input: HTMLInputElement;
    let btn: HTMLButtonElement;
    let resultContainer: HTMLElement;
    let resultId: HTMLElement;
    let resultDate: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = `
            <form id="tracking-form">
                <input id="tracking-input" type="text" />
                <button id="tracking-btn">Rastrear</button>
            </form>
            <div id="tracking-result" class="hidden">
                 <span id="result-id"></span>
                 <span id="result-date"></span>
                 <button id="reset-tracking-btn"></button>
            </div>
        `;
        form = document.getElementById('tracking-form') as HTMLFormElement;
        input = document.getElementById('tracking-input') as HTMLInputElement;
        btn = document.getElementById('tracking-btn') as HTMLButtonElement;
        resultContainer = document.getElementById('tracking-result') as HTMLElement;
        resultId = document.getElementById('result-id') as HTMLElement;
        resultDate = document.getElementById('result-date') as HTMLElement;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('sanitiza el input eliminando caracteres inválidos', () => {
        const emitSpy = vi.spyOn(EventBus, 'emit');
        new TrackingForm(form);

        input.value = 'AB-12@#$';
        form.dispatchEvent(new Event('submit'));

        // Se espera que 'AB-12@#$' se convierta en 'AB-12' (o similar según regex)
        // El regex permite A-Z, 0-9, -
        // El replace es /[^A-Z0-9\-]/gi
        // AB-12@#$ -> AB-12
        expect(emitSpy).toHaveBeenCalledWith('tracking:submit', { trackingId: 'AB-12' });
    });

    it('rechaza inputs cortos o inválidos según regex', () => {
        const emitSpy = vi.spyOn(EventBus, 'emit');
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        new TrackingForm(form);

        input.value = 'ABC'; // Muy corto (min 4)
        form.dispatchEvent(new Event('submit'));

        expect(emitSpy).not.toHaveBeenCalledWith('tracking:submit', expect.any(Object));
        expect(consoleSpy).toHaveBeenCalledWith('Invalid Tracking ID Format');
    });

    it('bloquea el botón durante el envío', async () => {
        new TrackingForm(form);
        input.value = 'VALID-123';

        // Mock setTimeout to be faster or just check synchronous state?
        // The mockFetch uses a real setTimeout 1500.
        // We can use fake timers.
        vi.useFakeTimers();

        form.dispatchEvent(new Event('submit'));

        expect(btn.disabled).toBe(true);
        expect(btn.innerHTML).toContain('loader');

        vi.runAllTimers(); // Fast-forward mockFetch

        // Wait for async handler
        await Promise.resolve();
        await Promise.resolve(); // Microtasks

        expect(btn.disabled).toBe(false);
        vi.useRealTimers();
    });

    it('muestra el resultado tras un envío exitoso', async () => {
        vi.useFakeTimers();
        const emitSpy = vi.spyOn(EventBus, 'emit');
        new TrackingForm(form);

        input.value = 'VALID-123';
        form.dispatchEvent(new Event('submit'));

        // Fast-forward fetch delay (1500ms)
        vi.advanceTimersByTime(1500);

        // Wait for promises
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve(); // Extra tick for finally block

        expect(emitSpy).toHaveBeenCalledWith('tracking:success', expect.objectContaining({
            trackingId: 'VALID-123'
        }));

        expect(resultContainer.classList.contains('hidden')).toBe(false);
        expect(resultId.innerText).toBe('VALID-123');
        expect(resultDate.innerText).toContain('Estimado:');

        vi.useRealTimers();
    });

    it('destroy limpia referencias', () => {
        const formInstance = new TrackingForm(form);
        expect(() => formInstance.destroy()).not.toThrow();
    });

    it('maneja errores en el fetch', async () => {
        vi.useFakeTimers();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        new TrackingForm(form);

        input.value = 'FAIL-123';

        // Mock failure via EventBus error on success event
        vi.spyOn(EventBus, 'emit').mockImplementation((event) => {
            if (event === 'tracking:success') {
                throw new Error('Simulated Error');
            }
        });

        form.dispatchEvent(new Event('submit'));

        // Fast-forward fetch
        vi.advanceTimersByTime(2000);

        // Wait for promises
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(consoleSpy).toHaveBeenCalledWith('Tracking Error:', expect.any(Error));

        vi.useRealTimers();
    });
});
