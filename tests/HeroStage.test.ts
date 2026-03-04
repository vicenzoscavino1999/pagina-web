import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createHeroWebGLSceneSpy, createHeroCanvasSceneSpy, gsapKillTweensOfSpy } = vi.hoisted(() => ({
    createHeroCanvasSceneSpy: vi.fn(),
    createHeroWebGLSceneSpy: vi.fn(),
    gsapKillTweensOfSpy: vi.fn(),
}));

vi.mock('gsap', () => ({
    gsap: {
        killTweensOf: gsapKillTweensOfSpy,
        to: vi.fn(),
    },
}));

vi.mock('../src/modules/hero/webgl', () => ({
    createHeroWebGLScene: createHeroWebGLSceneSpy,
}));

vi.mock('../src/modules/hero/canvas', () => ({
    createHeroCanvasScene: createHeroCanvasSceneSpy,
}));

import { createHeroStageScene } from '../src/modules/hero/stage';

describe('HeroStage scene selection', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('prefiere la escena webgl y expone el modo en el section dataset', () => {
        document.body.innerHTML = `
            <section id="hero-section">
                <div id="hero-media">
                    <img id="hero-bg">
                    <div class="hero-overlay"></div>
                </div>
                <div id="hero-layout"></div>
            </section>
        `;

        const section = document.getElementById('hero-section') as HTMLElement;
        const background = document.getElementById('hero-bg') as HTMLElement;
        const layout = document.getElementById('hero-layout') as HTMLElement;
        const webglScene = {
            destroy: vi.fn(),
            kind: 'webgl' as const,
            setFocus: vi.fn(),
        };

        createHeroWebGLSceneSpy.mockReturnValue(webglScene);
        createHeroCanvasSceneSpy.mockReturnValue(null);

        const stage = createHeroStageScene({
            background,
            layout,
            prefersReducedMotion: true,
            section,
            supportsFinePointer: false,
        });

        expect(stage).not.toBeNull();
        expect(createHeroWebGLSceneSpy).toHaveBeenCalledWith(background.parentElement);
        expect(createHeroCanvasSceneSpy).not.toHaveBeenCalled();
        expect(section.dataset.heroScene).toBe('webgl');

        stage?.destroy();

        expect(webglScene.destroy).toHaveBeenCalled();
        expect(section.dataset.heroScene).toBeUndefined();
    });

    it('usa canvas como fallback cuando webgl no esta disponible', () => {
        document.body.innerHTML = `
            <section id="hero-section">
                <div id="hero-media">
                    <img id="hero-bg">
                    <div class="hero-overlay"></div>
                </div>
                <div id="hero-layout"></div>
            </section>
        `;

        const section = document.getElementById('hero-section') as HTMLElement;
        const background = document.getElementById('hero-bg') as HTMLElement;
        const layout = document.getElementById('hero-layout') as HTMLElement;
        const canvasScene = {
            destroy: vi.fn(),
            kind: 'canvas' as const,
            setFocus: vi.fn(),
        };

        createHeroWebGLSceneSpy.mockReturnValue(null);
        createHeroCanvasSceneSpy.mockReturnValue(canvasScene);

        const stage = createHeroStageScene({
            background,
            layout,
            prefersReducedMotion: true,
            section,
            supportsFinePointer: false,
        });

        expect(stage).not.toBeNull();
        expect(createHeroCanvasSceneSpy).toHaveBeenCalledWith(background.parentElement);
        expect(section.dataset.heroScene).toBe('canvas');

        stage?.destroy();

        expect(canvasScene.destroy).toHaveBeenCalled();
        expect(section.dataset.heroScene).toBeUndefined();
    });

    it('mantiene scroll-driven stage aunque no haya fine pointer', () => {
        document.body.innerHTML = `
            <section id="hero-section">
                <div id="hero-media">
                    <img id="hero-bg">
                    <div class="hero-overlay"></div>
                </div>
                <div id="hero-layout"></div>
            </section>
        `;

        const section = document.getElementById('hero-section') as HTMLElement;
        const background = document.getElementById('hero-bg') as HTMLElement;
        const layout = document.getElementById('hero-layout') as HTMLElement;
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

        createHeroWebGLSceneSpy.mockReturnValue({
            destroy: vi.fn(),
            kind: 'webgl' as const,
            setFocus: vi.fn(),
        });
        createHeroCanvasSceneSpy.mockReturnValue(null);

        const stage = createHeroStageScene({
            background,
            layout,
            prefersReducedMotion: false,
            section,
            supportsFinePointer: false,
        });

        expect(stage).not.toBeNull();
        expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(section.style.getPropertyValue('--hero-stage-energy')).not.toBe('');
        expect(section.style.getPropertyValue('--hero-pointer-x')).not.toBe('');
        expect(section.style.getPropertyValue('--hero-pointer-y')).not.toBe('');

        stage?.destroy();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(section.style.getPropertyValue('--hero-stage-energy')).toBe('');
        expect(section.style.getPropertyValue('--hero-pointer-x')).toBe('');
        expect(section.style.getPropertyValue('--hero-pointer-y')).toBe('');
    });
});
