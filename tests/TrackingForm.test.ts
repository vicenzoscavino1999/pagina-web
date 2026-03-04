import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TrackingForm } from '@modules/TrackingForm';
import { EventBus } from '@utils/events';
import { DomContractError } from '@utils/dom';

describe('TrackingForm - validacion', () => {
    let form: HTMLFormElement;
    let input: HTMLInputElement;
    let resultContainer: HTMLElement;
    let resultId: HTMLElement;
    let trackingBtn: HTMLButtonElement;
    let resetBtn: HTMLButtonElement;

    const flush = async (): Promise<void> => {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
    };

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
        resultContainer = document.getElementById('tracking-result') as HTMLElement;
        resultId = document.getElementById('result-id') as HTMLElement;
        trackingBtn = document.getElementById('tracking-btn') as HTMLButtonElement;
        resetBtn = document.getElementById('reset-tracking-btn') as HTMLButtonElement;
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('rechaza inputs con caracteres invalidos', () => {
        const emitSpy = vi.spyOn(EventBus, 'emit');
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        new TrackingForm(form);
        input.value = '@@@@';
        form.dispatchEvent(new Event('submit'));

        expect(warnSpy).toHaveBeenCalledWith('Invalid Tracking ID Format');
        expect(emitSpy).not.toHaveBeenCalledWith('tracking:submit', expect.anything());
    });

    it('AbortController cancela operacion pendiente al hacer submit doble', async () => {
        vi.useFakeTimers();
        const emitSpy = vi.spyOn(EventBus, 'emit');

        new TrackingForm(form);

        input.value = 'FIRST-111';
        form.dispatchEvent(new Event('submit'));

        input.value = 'SECOND-222';
        form.dispatchEvent(new Event('submit'));

        vi.advanceTimersByTime(1500);
        await flush();

        const submitEvents = emitSpy.mock.calls.filter(([event]) => event === 'tracking:submit');
        const successEvents = emitSpy.mock.calls.filter(([event]) => event === 'tracking:success');

        expect(submitEvents).toHaveLength(2);
        expect(successEvents).toHaveLength(1);
        expect(successEvents[0]?.[1]).toEqual(expect.objectContaining({ trackingId: 'SECOND-222' }));
        expect(resultId.innerText).toBe('SECOND-222');
    });

    it('sanitiza el input antes de mostrarlo', async () => {
        vi.useFakeTimers();
        const emitSpy = vi.spyOn(EventBus, 'emit');

        new TrackingForm(form);

        input.value = 'ab-12@#$';
        form.dispatchEvent(new Event('submit'));
        expect(resultContainer.getAttribute('aria-busy')).toBe('true');

        vi.advanceTimersByTime(1500);
        await flush();

        expect(emitSpy).toHaveBeenCalledWith('tracking:submit', { trackingId: 'AB-12' });
        expect(resultContainer.classList.contains('hidden')).toBe(false);
        expect(resultContainer.getAttribute('aria-busy')).toBe('false');
        expect(resultId.innerText).toBe('AB-12');
    });

    it('permite resetear el resultado y limpiar el formulario', async () => {
        vi.useFakeTimers();

        new TrackingForm(form);

        input.value = 'PE-2024-001';
        form.dispatchEvent(new Event('submit'));

        vi.advanceTimersByTime(1500);
        await flush();

        expect(resultContainer.classList.contains('hidden')).toBe(false);

        resetBtn.click();

        expect(resultContainer.classList.contains('hidden')).toBe(true);
        expect(input.value).toBe('');
        expect(resultContainer.getAttribute('aria-busy')).toBe('false');
        expect(document.activeElement).toBe(input);
    });

    it('reemplaza el listener del reset al renderizar un nuevo resultado', async () => {
        vi.useFakeTimers();
        const removeSpy = vi.spyOn(resetBtn, 'removeEventListener');

        new TrackingForm(form);

        input.value = 'PE-2024-001';
        form.dispatchEvent(new Event('submit'));
        vi.advanceTimersByTime(1500);
        await flush();

        input.value = 'PE-2024-002';
        form.dispatchEvent(new Event('submit'));
        vi.advanceTimersByTime(1500);
        await flush();

        expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));

        resetBtn.click();
        expect(resultContainer.classList.contains('hidden')).toBe(true);
    });

    it('aborta una solicitud pendiente al destruirse sin emitir exito', async () => {
        vi.useFakeTimers();
        const emitSpy = vi.spyOn(EventBus, 'emit');
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const trackingForm = new TrackingForm(form);

        input.value = 'PE-DESTROY-1';
        form.dispatchEvent(new Event('submit'));
        expect(trackingBtn.disabled).toBe(true);

        trackingForm.destroy();

        vi.advanceTimersByTime(1500);
        await flush();

        const successEvents = emitSpy.mock.calls.filter(([event]) => event === 'tracking:success');

        expect(successEvents).toHaveLength(0);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('desvincula submit y reset al destruirse despues de renderizar resultado', async () => {
        vi.useFakeTimers();
        const formRemoveSpy = vi.spyOn(form, 'removeEventListener');
        const resetRemoveSpy = vi.spyOn(resetBtn, 'removeEventListener');

        const trackingForm = new TrackingForm(form);

        input.value = 'PE-2024-003';
        form.dispatchEvent(new Event('submit'));
        vi.advanceTimersByTime(1500);
        await flush();

        expect(resultContainer.classList.contains('hidden')).toBe(false);

        trackingForm.destroy();
        resetBtn.click();

        expect(formRemoveSpy).toHaveBeenCalledWith('submit', expect.any(Function));
        expect(resetRemoveSpy).toHaveBeenCalledWith('click', expect.any(Function));
        expect(resultContainer.classList.contains('hidden')).toBe(false);
    });

    it('reporta errores no abortados y restaura el boton', async () => {
        const emitSpy = vi.spyOn(EventBus, 'emit');
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(globalThis, 'setTimeout').mockImplementation(() => {
            throw new Error('network down');
        });

        new TrackingForm(form);

        input.value = 'PE-ERROR-1';
        form.dispatchEvent(new Event('submit'));
        await flush();

        const successEvents = emitSpy.mock.calls.filter(([event]) => event === 'tracking:success');

        expect(errorSpy).toHaveBeenCalledWith('Tracking Error:', expect.any(Error));
        expect(successEvents).toHaveLength(0);
        expect(trackingBtn.disabled).toBe(false);
        expect(trackingBtn.innerHTML).toBe('Rastrear');
    });

    it('no falla y avisa si recibe un elemento invalido o nulo', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const invalidElement = document.createElement('div');

        expect(() => new TrackingForm(null)).not.toThrow();
        expect(() => new TrackingForm(invalidElement)).not.toThrow();
        expect(warnSpy).toHaveBeenCalledWith('[TrackingForm] Form not found');
    });

    it('falla rapido si falta markup critico del tracking', () => {
        document.body.innerHTML = `
            <form id="tracking-form">
                <input id="tracking-input" type="text" />
            </form>
        `;

        const brokenForm = document.getElementById('tracking-form') as HTMLFormElement;

        expect(() => new TrackingForm(brokenForm)).toThrow(DomContractError);
        expect(() => new TrackingForm(brokenForm)).toThrow('[TrackingForm]');
    });
});

