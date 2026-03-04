import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    applyMagneticState,
    createMagneticBinding,
    getMagneticStyleValues,
    resetMagneticState,
} from '../src/modules/hero/magnetic';
import { triggerHeroReveal } from '../src/modules/hero/reveal';

describe('hero helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('calcula valores magnetic a partir de la posicion del puntero', () => {
        const values = getMagneticStyleValues(
            { left: 0, top: 0, width: 200, height: 100 },
            200,
            100,
        );

        expect(values).toEqual({
            translateX: '7.00px',
            translateY: '5.00px',
            rotate: '1.25deg',
            glowX: '100.00%',
            glowY: '100.00%',
        });
    });

    it('retorna null si el elemento magnetic no tiene area util', () => {
        expect(
            getMagneticStyleValues(
                { left: 0, top: 0, width: 0, height: 100 },
                10,
                10,
            )
        ).toBeNull();
    });

    it('aplica y resetea propiedades magnetic en el elemento', () => {
        const element = document.createElement('button');
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            top: 0,
            left: 0,
            width: 200,
            height: 100,
            bottom: 100,
            right: 200,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        applyMagneticState(element, 200, 100);
        expect(element.style.getPropertyValue('--magnetic-x')).toBe('7.00px');
        expect(element.style.getPropertyValue('--magnetic-glow-y')).toBe('100.00%');

        resetMagneticState(element);
        expect(element.style.getPropertyValue('--magnetic-x')).toBe('0px');
        expect(element.style.getPropertyValue('--magnetic-glow-y')).toBe('50%');
    });

    it('ignora applyMagneticState si el rect no tiene dimensiones validas', () => {
        const element = document.createElement('button');
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            top: 0,
            left: 0,
            width: 0,
            height: 100,
            bottom: 100,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        applyMagneticState(element, 50, 50);

        expect(element.style.getPropertyValue('--magnetic-x')).toBe('');
    });

    it('crea callbacks magnetic que activan hover y resetean el estado', () => {
        const element = document.createElement('button');
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            top: 0,
            left: 0,
            width: 200,
            height: 100,
            bottom: 100,
            right: 200,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        const binding = createMagneticBinding(element);
        binding.onPointerEnter({ clientX: 200, clientY: 100 } as PointerEvent);

        expect(element.classList.contains('is-magnetic-hover')).toBe(true);
        expect(element.style.getPropertyValue('--magnetic-x')).toBe('7.00px');

        binding.onPointerMove({ clientX: 0, clientY: 0 } as PointerEvent);
        expect(element.style.getPropertyValue('--magnetic-x')).toBe('-7.00px');

        binding.onPointerLeave();

        expect(element.classList.contains('is-magnetic-hover')).toBe(false);
        expect(element.style.getPropertyValue('--magnetic-x')).toBe('0px');
    });

    it('activa el reveal del hero de inmediato o tras doble frame', () => {
        expect(() => triggerHeroReveal(null, false)).not.toThrow();

        const reducedSection = document.createElement('section');
        triggerHeroReveal(reducedSection, true);
        expect(reducedSection.classList.contains('hero-stage-ready')).toBe(true);

        const animatedSection = document.createElement('section');
        const frames: FrameRequestCallback[] = [];
        const requestFrame = (callback: FrameRequestCallback): number => {
            frames.push(callback);
            return frames.length;
        };

        triggerHeroReveal(animatedSection, false, requestFrame);
        expect(animatedSection.classList.contains('hero-stage-ready')).toBe(false);

        const first = frames.shift();
        const second = (): FrameRequestCallback | undefined => frames.shift();
        first?.(0);
        expect(animatedSection.classList.contains('hero-stage-ready')).toBe(false);

        second()?.(0);
        expect(animatedSection.classList.contains('hero-stage-ready')).toBe(true);
    });
});
