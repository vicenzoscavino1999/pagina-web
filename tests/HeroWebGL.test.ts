import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHeroWebGLScene, getHeroWebGLUniformState } from '../src/modules/hero/webgl';

function createWebGLContextMock(overrides: Record<string, unknown> = {}): WebGLRenderingContext {
    return {
        ARRAY_BUFFER: 0x8892,
        COLOR_BUFFER_BIT: 0x4000,
        COMPILE_STATUS: 0x8b81,
        FLOAT: 0x1406,
        FRAGMENT_SHADER: 0x8b30,
        LINK_STATUS: 0x8b82,
        STATIC_DRAW: 0x88e4,
        TRIANGLE_STRIP: 0x0005,
        VERTEX_SHADER: 0x8b31,
        attachShader: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        clear: vi.fn(),
        clearColor: vi.fn(),
        compileShader: vi.fn(),
        createBuffer: vi.fn(() => ({})),
        createProgram: vi.fn(() => ({})),
        createShader: vi.fn(() => ({})),
        deleteBuffer: vi.fn(),
        deleteProgram: vi.fn(),
        deleteShader: vi.fn(),
        drawArrays: vi.fn(),
        enableVertexAttribArray: vi.fn(),
        getAttribLocation: vi.fn(() => 0),
        getProgramParameter: vi.fn(() => true),
        getShaderParameter: vi.fn(() => true),
        getUniformLocation: vi.fn(() => ({})),
        linkProgram: vi.fn(),
        shaderSource: vi.fn(),
        uniform1f: vi.fn(),
        uniform2f: vi.fn(),
        useProgram: vi.fn(),
        vertexAttribPointer: vi.fn(),
        viewport: vi.fn(),
        ...overrides,
    } as unknown as WebGLRenderingContext;
}

describe('hero webgl helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('retorna null si no recibe un contenedor de montaje', () => {
        expect(createHeroWebGLScene(null)).toBeNull();
    });

    it('calcula uniforms deterministas y dentro de rango', () => {
        const uniforms = getHeroWebGLUniformState(1440, 900, {
            intensity: 0.92,
            x: 0.74,
            y: 0.28,
        });

        expect(uniforms.resolutionX).toBe(1440);
        expect(uniforms.resolutionY).toBe(900);
        expect(uniforms.focusX).toBe(0.74);
        expect(uniforms.focusY).toBe(0.28);
        expect(uniforms.beamRadius).toBeGreaterThan(0.24);
        expect(uniforms.beamStrength).toBeGreaterThan(0.8);
        expect(uniforms.routeGlow).toBeGreaterThan(0.7);
    });

    it('hace fallback a experimental-webgl si el contexto principal no es valido', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        vi.spyOn(mountRoot, 'getBoundingClientRect').mockReturnValue({
            bottom: 680,
            height: 680,
            left: 0,
            right: 1280,
            top: 0,
            width: 1280,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        const experimentalContext = createWebGLContextMock();
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return { clearColor: vi.fn() } as never;
                }

                if (contextId === 'experimental-webgl') {
                    return experimentalContext as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).not.toBeNull();
        expect(scene?.kind).toBe('webgl');
        expect(getContextSpy).toHaveBeenCalledWith('experimental-webgl', expect.any(Object));

        scene?.destroy();
        getContextSpy.mockRestore();
    });

    it('monta y desmonta la escena webgl del hero', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        vi.spyOn(mountRoot, 'getBoundingClientRect').mockReturnValue({
            bottom: 680,
            height: 680,
            left: 0,
            right: 1280,
            top: 0,
            width: 1280,
            x: 0,
            y: 0,
            toJSON: () => '',
        } as DOMRect);

        const windowMock = {
            addEventListener: vi.fn(),
            devicePixelRatio: 1.5,
            removeEventListener: vi.fn(),
        };

        const scene = createHeroWebGLScene(mountRoot, windowMock);

        expect(scene).not.toBeNull();
        expect(scene?.kind).toBe('webgl');
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeInstanceOf(HTMLCanvasElement);
        expect(windowMock.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

        scene?.setFocus({ intensity: 0.88, x: 0.63 });
        scene?.destroy();

        expect(windowMock.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeNull();
    });

    it('usa fallback de devicePixelRatio, limita el maximo y tolera setFocus parcial', () => {
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

        const fallbackScene = createHeroWebGLScene(mountRoot, fallbackWindowMock);
        expect(fallbackScene).not.toBeNull();

        const fallbackCanvas = mountRoot.querySelector('canvas.hero-webgl-layer') as HTMLCanvasElement;
        expect(fallbackCanvas.width).toBe(800);
        expect(fallbackCanvas.height).toBe(400);

        fallbackScene?.setFocus({ intensity: 0.91 });
        expect(fallbackCanvas.width).toBe(800);
        expect(fallbackCanvas.height).toBe(400);
        fallbackScene?.destroy();

        const cappedWindowMock = {
            addEventListener: vi.fn(),
            devicePixelRatio: 3,
            removeEventListener: vi.fn(),
        };

        const cappedScene = createHeroWebGLScene(mountRoot, cappedWindowMock);
        expect(cappedScene).not.toBeNull();

        const cappedCanvas = mountRoot.querySelector('canvas.hero-webgl-layer') as HTMLCanvasElement;
        expect(cappedCanvas.width).toBe(1600);
        expect(cappedCanvas.height).toBe(800);
        cappedScene?.destroy();
    });

    it('omite el montaje si webgl no esta disponible', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;

        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl' || contextId === 'experimental-webgl') {
                    return null;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).toBeNull();
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeNull();

        getContextSpy.mockRestore();
    });

    it('omite el montaje si el link del programa falla', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        const deleteProgramSpy = vi.fn();
        const context = createWebGLContextMock({
            deleteProgram: deleteProgramSpy,
            getProgramParameter: vi.fn(() => false),
        });
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return context as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).toBeNull();
        expect(deleteProgramSpy).toHaveBeenCalled();
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeNull();

        getContextSpy.mockRestore();
    });

    it('omite el montaje si faltan handles del shader', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        const deleteProgramSpy = vi.fn();
        const context = createWebGLContextMock({
            deleteProgram: deleteProgramSpy,
            getUniformLocation: vi.fn((_program: unknown, name: string) =>
                name === 'uFocus' ? null : {}
            ),
        });
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return context as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).toBeNull();
        expect(deleteProgramSpy).toHaveBeenCalled();
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeNull();

        getContextSpy.mockRestore();
    });

    it('omite el montaje si compilar el shader falla', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        const deleteShaderSpy = vi.fn();
        const context = createWebGLContextMock({
            deleteShader: deleteShaderSpy,
            getShaderParameter: vi.fn(() => false),
        });
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return context as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).toBeNull();
        expect(deleteShaderSpy).toHaveBeenCalled();
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeNull();

        getContextSpy.mockRestore();
    });

    it('libera el shader compilado si falla el segundo shader durante la creacion del programa', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        let shaderParameterCalls = 0;
        const deleteShaderSpy = vi.fn();
        const context = createWebGLContextMock({
            deleteShader: deleteShaderSpy,
            getShaderParameter: vi.fn(() => {
                shaderParameterCalls += 1;
                return shaderParameterCalls === 1;
            }),
        });
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return context as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).toBeNull();
        expect(deleteShaderSpy).toHaveBeenCalled();
        expect(deleteShaderSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeNull();

        getContextSpy.mockRestore();
    });

    it('libera el fragment shader si el shader de vertice no puede crearse', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        const fragmentShader = {};
        const deleteShaderSpy = vi.fn();
        const context = createWebGLContextMock({
            createShader: vi.fn((type: number) => (type === 0x8b31 ? null : fragmentShader)),
            deleteShader: deleteShaderSpy,
        });
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return context as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).toBeNull();
        expect(deleteShaderSpy).toHaveBeenCalledWith(fragmentShader);
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeNull();

        getContextSpy.mockRestore();
    });

    it('omite el montaje si falta el atributo principal del shader', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        const deleteProgramSpy = vi.fn();
        const context = createWebGLContextMock({
            deleteProgram: deleteProgramSpy,
            getAttribLocation: vi.fn(() => -1),
        });
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return context as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).toBeNull();
        expect(deleteProgramSpy).toHaveBeenCalled();
        expect(mountRoot.querySelector('canvas.hero-webgl-layer')).toBeNull();

        getContextSpy.mockRestore();
    });

    it('tolera renders sin tamano util hasta que el contenedor tenga medidas', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        const drawArraysSpy = vi.fn();
        const viewportSpy = vi.fn();
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

        const context = createWebGLContextMock({
            drawArrays: drawArraysSpy,
            viewport: viewportSpy,
        });
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return context as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);
        expect(scene).not.toBeNull();

        const canvas = mountRoot.querySelector('canvas.hero-webgl-layer') as HTMLCanvasElement;
        expect(canvas.style.width).toBe('');
        expect(canvas.style.height).toBe('');
        expect(viewportSpy).not.toHaveBeenCalled();
        expect(drawArraysSpy).not.toHaveBeenCalled();

        currentWidth = 960;
        currentHeight = 560;
        scene?.setFocus({ x: 0.64, y: 0.36 });

        expect(canvas.style.width).toBe('960px');
        expect(canvas.style.height).toBe('560px');
        expect(viewportSpy).toHaveBeenCalled();
        expect(drawArraysSpy).toHaveBeenCalled();

        scene?.destroy();
        getContextSpy.mockRestore();
    });

    it('re-renderiza cuando ResizeObserver notifica cambios de tamano', () => {
        document.body.innerHTML = '<div id="hero-media"></div>';
        const mountRoot = document.getElementById('hero-media') as HTMLElement;
        const viewportSpy = vi.fn();
        const drawArraysSpy = vi.fn();
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

        let onResize: (() => void) | null = null;
        const resizeObserverRef = globalThis.ResizeObserver;
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

        const context = createWebGLContextMock({
            drawArrays: drawArraysSpy,
            viewport: viewportSpy,
        });
        const getContextSpy = vi
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementation((contextId: string) => {
                if (contextId === 'webgl') {
                    return context as never;
                }

                return null;
            });

        const scene = createHeroWebGLScene(mountRoot);
        expect(scene).not.toBeNull();

        const resizeCallback = onResize as (() => void) | null;
        if (resizeCallback) {
            resizeCallback();
        }

        expect(viewportSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
        expect(drawArraysSpy.mock.calls.length).toBeGreaterThanOrEqual(2);

        scene?.destroy();
        getContextSpy.mockRestore();
        vi.stubGlobal('ResizeObserver', resizeObserverRef);
    });

    it('funciona aunque ResizeObserver no este disponible', () => {
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
        vi.stubGlobal('ResizeObserver', undefined);

        const scene = createHeroWebGLScene(mountRoot);

        expect(scene).not.toBeNull();
        scene?.destroy();

        vi.stubGlobal('ResizeObserver', resizeObserverRef);
    });
});
