import { beforeEach, describe, expect, it } from 'vitest';
import { getAppleScrollProgress } from '../src/modules/apple/progress';
import {
    applyAppleSceneVisualState,
    getAppleSceneRangeProgress,
    getAppleSceneVisualState,
    resetAppleSceneVisualState,
} from '../src/modules/apple/view';

describe('apple scene helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('calcula progreso consistente antes, durante y despues del sticky range', () => {
        expect(getAppleScrollProgress(1200, 2600, 1000)).toEqual({
            isActive: false,
            progress: 0,
        });

        expect(getAppleScrollProgress(-700, 2600, 1000)).toEqual({
            isActive: true,
            progress: 0.4375,
        });

        expect(getAppleScrollProgress(-2200, 2600, 1000)).toEqual({
            isActive: true,
            progress: 1,
        });
    });

    it('deriva un estado visual cinematografico a partir del progreso', () => {
        const state = getAppleSceneVisualState(0.5);

        expect(state.blurPx).toBeGreaterThan(12);
        expect(state.overlayOpacity).toBeGreaterThan(0.6);
        expect(state.imageTranslateYPx).toBeLessThan(0);
        expect(state.copyOpacity).toBeGreaterThan(0.9);
        expect(state.headingOpacity).toBeGreaterThan(0.9);
        expect(state.subheadingOpacity).toBeGreaterThan(0.1);
    });

    it('resuelve progreso completo cuando el rango visual es invalido', () => {
        expect(getAppleSceneRangeProgress(0.4, 0.8, 0.2)).toBe(1);
    });

    it('aplica y limpia variables CSS del estado Apple', () => {
        document.body.innerHTML = `
            <section id="apple-section">
                <div id="apple-heading"></div>
                <div id="apple-subheading"></div>
            </section>
        `;

        const section = document.getElementById('apple-section') as HTMLElement;
        const heading = document.getElementById('apple-heading') as HTMLElement;
        const subheading = document.getElementById('apple-subheading') as HTMLElement;

        applyAppleSceneVisualState(
            { heading, section, subheading },
            getAppleSceneVisualState(0.58)
        );

        expect(section.style.getPropertyValue('--apple-overlay-opacity')).not.toBe('');
        expect(section.style.getPropertyValue('--apple-copy-opacity')).not.toBe('');
        expect(heading.classList.contains('apple-text-visible')).toBe(true);
        expect(subheading.classList.contains('apple-text-visible')).toBe(true);

        resetAppleSceneVisualState({ heading, section, subheading });

        expect(section.style.getPropertyValue('--apple-overlay-opacity')).toBe('');
        expect(section.style.getPropertyValue('--apple-copy-opacity')).toBe('');
        expect(heading.classList.contains('apple-text-visible')).toBe(false);
        expect(subheading.classList.contains('apple-text-visible')).toBe(false);
    });

    it('tolera heading y subheading nulos al aplicar y resetear estado', () => {
        document.body.innerHTML = `
            <section id="apple-section"></section>
        `;

        const section = document.getElementById('apple-section') as HTMLElement;

        applyAppleSceneVisualState(
            { heading: null, section, subheading: null },
            getAppleSceneVisualState(0.58)
        );

        expect(section.style.getPropertyValue('--apple-overlay-opacity')).not.toBe('');
        expect(section.style.getPropertyValue('--apple-copy-opacity')).not.toBe('');

        resetAppleSceneVisualState({ heading: null, section, subheading: null });

        expect(section.style.getPropertyValue('--apple-overlay-opacity')).toBe('');
        expect(section.style.getPropertyValue('--apple-copy-opacity')).toBe('');
    });
});
