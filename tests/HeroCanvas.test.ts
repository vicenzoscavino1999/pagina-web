import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createHeroCanvasScene,
    getHeroCanvasRenderableRoute,
    getHeroCanvasSceneModel,
    renderHeroCanvasRoute,
} from '../src/modules/hero/canvas';

describe('hero canvas helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('retorna null si no recibe un contenedor de montaje', () => {
        expect(createHeroCanvasScene(null)).toBeNull();
    });

    it('calcula un modelo de escena deterministico y dentro del viewport', () => {
        const model = getHeroCanvasSceneModel(1200, 800, {
            intensity: 0.9,
            x: 0.72,
            y: 0.3,
        });

        expect(model.route).toHaveLength(4);
        expect(model.orbs).toHaveLength(3);
        expect(model.beam.radius).toBeGreaterThan(200);
        expect(model.beam.x).toBeGreaterThan(500);
        expect(model.route[0]?.y).toBeGreaterThan(200);
        expect(model.route[3]?.x).toBeLessThan(1100);
    });

    it('deriva una ruta renderizable y omite segmentos invalidos', () => {
        const route = getHeroCanvasRenderableRoute([
            { x: 20, y: 30 },
            null,
            { x: 120, y: 90 },
            { x: 220, y: 140 },
        ]);

        expect(route).not.toBeNull();
        if (!route) {
            throw new Error('route should be renderable');
        }

        expect(route.firstPoint).toEqual({ x: 20, y: 30 });
        expect(route.lastPoint).toEqual({ x: 220, y: 140 });
        expect(route.segments).toHaveLength(1);
        expect(route.segments[0]?.control).toEqual({ x: 120, y: 90 });
    });

    it('omite rutas invalidas', () => {
        expect(getHeroCanvasRenderableRoute([{ x: 10, y: 10 }])).toBeNull();
        expect(
            getHeroCanvasRenderableRoute([
                null,
                { x: 80, y: 50 },
            ])
        ).toBeNull();
    });

    it('omite el dibujo de la ruta si no hay suficientes puntos validos', () => {
        const arcSpy = vi.fn();
        const createLinearGradientSpy = vi.fn(() => ({
            addColorStop: vi.fn(),
        }));
        const moveToSpy = vi.fn();
        const strokeSpy = vi.fn();
        const context = {
            arc: arcSpy,
            beginPath: vi.fn(),
            createLinearGradient: createLinearGradientSpy,
            fill: vi.fn(),
            lineTo: vi.fn(),
            moveTo: moveToSpy,
            quadraticCurveTo: vi.fn(),
            restore: vi.fn(),
            save: vi.fn(),
            stroke: strokeSpy,
        } as unknown as CanvasRenderingContext2D;

        renderHeroCanvasRoute(context, [{ x: 24, y: 40 }]);

        expect(createLinearGradientSpy).not.toHaveBeenCalled();
        expect(moveToSpy).not.toHaveBeenCalled();
        expect(strokeSpy).not.toHaveBeenCalled();
        expect(arcSpy).not.toHaveBeenCalled();
    });

    it('monta y desmonta el canvas del hero', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        vi.spyOn(mountRoot, 'getBoundingClientRect').mockReturnValue({
            bottom: 640,
            height: 640,
            left: 0,
            right: 1200,
            top: 0,
            width: 1200,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        const windowMock = {
            addEventListener: vi.fn(),
            devicePixelRatio: 1,
            removeEventListener: vi.fn(),
        };

        const scene = createHeroCanvasScene(mountRoot, windowMock);
        expect(scene).not.toBeNull();
        expect(scene?.kind).toBe('canvas');
        expect(mountRoot.querySelector('canvas.hero-canvas-layer')).toBeInstanceOf(HTMLCanvasElement);
        expect(windowMock.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

        scene?.setFocus({ x: 0.61 });
        scene?.setFocus({});
        scene?.destroy();

        expect(windowMock.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(mountRoot.querySelector('canvas.hero-canvas-layer')).toBeNull();
    });

    it('usa fallback de devicePixelRatio y limita el valor maximo a 2', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        vi.spyOn(mountRoot, 'getBoundingClientRect').mockReturnValue({
            bottom: 400,
            height: 400,
            left: 0,
            right: 800,
            top: 0,
            width: 800,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        const fallbackWindowMock = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };

        const fallbackScene = createHeroCanvasScene(mountRoot, fallbackWindowMock);
        expect(fallbackScene).not.toBeNull();

        const fallbackCanvas = mountRoot.querySelector('canvas.hero-canvas-layer') as HTMLCanvasElement;
        expect(fallbackCanvas.width).toBe(800);
        expect(fallbackCanvas.height).toBe(400);
        fallbackScene?.destroy();

        const cappedWindowMock = {
            addEventListener: vi.fn(),
            devicePixelRatio: 3,
            removeEventListener: vi.fn(),
        };

        const cappedScene = createHeroCanvasScene(mountRoot, cappedWindowMock);
        expect(cappedScene).not.toBeNull();

        const cappedCanvas = mountRoot.querySelector('canvas.hero-canvas-layer') as HTMLCanvasElement;
        expect(cappedCanvas.width).toBe(1600);
        expect(cappedCanvas.height).toBe(800);
        cappedScene?.destroy();
    });

    it('omite el montaje si el contexto 2d no esta disponible', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockReturnValueOnce(null);

        const scene = createHeroCanvasScene(mountRoot);

        expect(scene).toBeNull();
        expect(mountRoot.querySelector('canvas.hero-canvas-layer')).toBeNull();

        getContextSpy.mockRestore();
    });

    it('tolera renders sin tamano util hasta que el contenedor tenga medidas', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        let currentWidth = 0;
        let currentHeight = 0;

        Object.defineProperty(mountRoot, 'clientWidth', {
            configurable: true,
            get: () => currentWidth,
        });
        Object.defineProperty(mountRoot, 'scrollWidth', {
            configurable: true,
            get: () => currentWidth,
        });
        Object.defineProperty(mountRoot, 'clientHeight', {
            configurable: true,
            get: () => currentHeight,
        });
        Object.defineProperty(mountRoot, 'scrollHeight', {
            configurable: true,
            get: () => currentHeight,
        });

        vi.spyOn(mountRoot, 'getBoundingClientRect').mockImplementation(
            () =>
                ({
                    bottom: currentHeight,
                    height: currentHeight,
                    left: 0,
                    right: currentWidth,
                    top: 0,
                    width: currentWidth,
                    x: 0,
                    y: 0,
                    toJSON: () => '',
                }) as DOMRect
        );

        const scene = createHeroCanvasScene(mountRoot);
        expect(scene).not.toBeNull();

        const canvas = mountRoot.querySelector('canvas.hero-canvas-layer') as HTMLCanvasElement;
        expect(canvas.style.width).toBe('');
        expect(canvas.style.height).toBe('');

        currentWidth = 900;
        currentHeight = 540;
        scene?.setFocus({ y: 0.32, intensity: 0.91 });

        expect(canvas.width).toBeGreaterThan(0);
        expect(canvas.height).toBeGreaterThan(0);
        expect(canvas.style.width).toBe('900px');
        expect(canvas.style.height).toBe('540px');

        scene?.destroy();
    });

    it('funciona con y sin ResizeObserver', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        vi.spyOn(mountRoot, 'getBoundingClientRect').mockReturnValue({
            bottom: 640,
            height: 640,
            left: 0,
            right: 1200,
            top: 0,
            width: 1200,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        const resizeObserverRef = globalThis.ResizeObserver;
        let onResize: (() => void) | null = null;

        vi.stubGlobal(
            'ResizeObserver',
            vi.fn((callback: () => void) => {
                onResize = callback;
                return {
                    disconnect: vi.fn(),
                    observe: vi.fn(),
                    unobserve: vi.fn(),
                };
            })
        );

        const sceneWithObserver = createHeroCanvasScene(mountRoot);
        const resizeCallback = onResize as (() => void) | null;
        if (resizeCallback) {
            resizeCallback();
        }
        sceneWithObserver?.destroy();

        vi.stubGlobal('ResizeObserver', undefined);
        const sceneWithoutObserver = createHeroCanvasScene(mountRoot);
        expect(sceneWithoutObserver).not.toBeNull();
        sceneWithoutObserver?.destroy();

        vi.stubGlobal('ResizeObserver', resizeObserverRef);
    });
});
