import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TrackingForm } from '@modules/TrackingForm';
import { EventBus } from '@utils/events';
import { DomContractError } from '@utils/dom';

describe('TrackingForm - validacion', () => {
    let form: HTMLFormElement;
    let input: HTMLInputElement;
    let resultContainer: HTMLElement;
    let resultId: HTMLElement;

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

        vi.advanceTimersByTime(1500);
        await flush();

        expect(emitSpy).toHaveBeenCalledWith('tracking:submit', { trackingId: 'AB-12' });
        expect(resultContainer.classList.contains('hidden')).toBe(false);
        expect(resultId.innerText).toBe('AB-12');
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

