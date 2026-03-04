import { vi } from 'vitest';

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

vi.stubGlobal(
    'ResizeObserver',
    vi.fn(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
        unobserve: vi.fn(),
    }))
);

const createCanvas2DContextMock = () =>
    ({
        arc: vi.fn(),
        beginPath: vi.fn(),
        clearRect: vi.fn(),
        createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
        })),
        createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
        })),
        fill: vi.fn(),
        lineTo: vi.fn(),
        moveTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        restore: vi.fn(),
        save: vi.fn(),
        setTransform: vi.fn(),
        stroke: vi.fn(),
    }) as const;

const createWebGLContextMock = () =>
    ({
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
    }) as const;

HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
    if (contextId === '2d') {
        return createCanvas2DContextMock();
    }

    if (contextId === 'webgl' || contextId === 'experimental-webgl') {
        return createWebGLContextMock();
    }

    return null;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock window.scrollTo
vi.stubGlobal('scrollTo', vi.fn());

// Mock window.matchMedia
vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }))
);

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();
