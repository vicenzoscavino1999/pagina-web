import { clamp } from '../../utils/math';

export interface HeroWebGLFocus {
    x: number;
    y: number;
    intensity: number;
}

export interface HeroWebGLUniformState {
    beamRadius: number;
    beamStrength: number;
    focusX: number;
    focusY: number;
    resolutionX: number;
    resolutionY: number;
    routeCurve: number;
    routeGlow: number;
}

export interface HeroWebGLScene {
    kind: 'webgl';
    setFocus(focus: Partial<HeroWebGLFocus>): void;
    destroy(): void;
}

interface WindowLike {
    addEventListener(type: 'resize', listener: () => void): void;
    removeEventListener(type: 'resize', listener: () => void): void;
    devicePixelRatio?: number;
}

interface HeroWebGLHandles {
    aPosition: number;
    uBeamRadius: WebGLUniformLocation;
    uBeamStrength: WebGLUniformLocation;
    uFocus: WebGLUniformLocation;
    uResolution: WebGLUniformLocation;
    uRouteCurve: WebGLUniformLocation;
    uRouteGlow: WebGLUniformLocation;
}

const DEFAULT_FOCUS: HeroWebGLFocus = {
    x: 0.52,
    y: 0.44,
    intensity: 0.58,
};

const WEBGL_CONTEXT_OPTIONS: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
};

const VERTEX_SHADER_SOURCE = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uFocus;
uniform float uBeamStrength;
uniform float uBeamRadius;
uniform float uRouteCurve;
uniform float uRouteGlow;

float glowCircle(vec2 uv, vec2 center, float radius, float softness) {
    float distanceToCenter = distance(uv, center);
    return smoothstep(radius, radius - softness, distanceToCenter);
}

float routeMask(vec2 uv, float focusOffset, float routeCurve) {
    float bend = sin((uv.x * 3.1415926) - 0.32) * 0.075;
    float taper = pow(uv.x - 0.52, 2.0) * 0.18;
    float routeY = 0.58 + bend + focusOffset * 0.08 + (routeCurve - 0.5) * 0.18 - taper;
    return smoothstep(0.034, 0.0, abs(uv.y - routeY));
}

float gridMask(vec2 uv, vec2 focusDelta) {
    float gridX = abs(sin((uv.x + focusDelta.x * 0.06) * 30.0));
    float gridY = abs(sin((uv.y + focusDelta.y * 0.05) * 26.0));
    float vertical = smoothstep(0.97, 1.0, gridX);
    float horizontal = smoothstep(0.985, 1.0, gridY);
    return (vertical + horizontal) * 0.5;
}

float grain(vec2 uv) {
    vec2 noiseCell = floor(uv * 160.0);
    return fract(sin(dot(noiseCell, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;
    vec2 focusDelta = uFocus - vec2(0.5, 0.48);
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 centered = uv - vec2(0.5);
    centered.x *= aspect;

    vec3 color = vec3(0.0);

    float beam = glowCircle(uv, uFocus, uBeamRadius, uBeamRadius * 0.78);
    color += vec3(0.12, 0.62, 0.95) * beam * (0.55 + uBeamStrength * 0.35);

    vec2 followCenter = vec2(
        mix(0.46, uFocus.x, 0.88),
        mix(0.74, uFocus.y, 0.52)
    );
    float focusTrail = glowCircle(uv, followCenter, uBeamRadius * 0.72, uBeamRadius * 0.88);
    color += vec3(0.1, 0.74, 1.0) * focusTrail * (0.18 + uBeamStrength * 0.2);

    float route = routeMask(uv, focusDelta.y, uRouteCurve);
    vec3 routeColor = mix(vec3(0.32, 0.92, 0.68), vec3(0.18, 0.74, 1.0), uv.x);
    color += routeColor * route * (uRouteGlow * 0.82);

    float grid = gridMask(uv, focusDelta);
    color += vec3(0.52, 0.84, 1.0) * grid * 0.1;

    float orbA = glowCircle(uv, vec2(0.18 + focusDelta.x * 0.18, 0.28 - focusDelta.y * 0.12), 0.12, 0.16);
    float orbB = glowCircle(uv, vec2(0.78 - focusDelta.x * 0.12, 0.26 - focusDelta.y * 0.08), 0.09, 0.14);
    float orbC = glowCircle(uv, vec2(0.68 + focusDelta.x * 0.16, 0.74 + focusDelta.y * 0.12), 0.14, 0.18);
    color += vec3(0.6, 0.86, 1.0) * orbA * 0.16;
    color += vec3(0.48, 0.94, 0.82) * orbB * 0.14;
    color += vec3(0.22, 0.7, 1.0) * orbC * 0.16;

    vec2 groundCenter = vec2(
        mix(0.44, uFocus.x, 0.34),
        0.94 - abs(focusDelta.y) * 0.06
    );
    float groundGlow = glowCircle(uv, groundCenter, 0.44 + uBeamStrength * 0.12, 0.34);
    color += vec3(0.04, 0.28, 0.62) * groundGlow * (0.18 + uBeamStrength * 0.16);

    float vignette = smoothstep(1.16, 0.1, length(centered));
    color += vec3(0.22, 0.35, 0.56) * vignette * 0.08;

    color += vec3(grain(uv)) * 0.025;

    float alpha = clamp(
        max(beam * 0.72, route * 0.58) + focusTrail * 0.34 + groundGlow * 0.18 + grid * 0.14 + vignette * 0.1,
        0.0,
        0.94
    );

    gl_FragColor = vec4(color, alpha);
}
`;

export function getHeroWebGLUniformState(
    width: number,
    height: number,
    focus: HeroWebGLFocus = DEFAULT_FOCUS
): HeroWebGLUniformState {
    const safeWidth = Math.max(width, 1);
    const safeHeight = Math.max(height, 1);
    const x = clamp(focus.x, 0, 1);
    const y = clamp(focus.y, 0, 1);
    const intensity = clamp(focus.intensity, 0.2, 1);

    return {
        beamRadius: 0.16 + intensity * 0.1,
        beamStrength: 0.42 + intensity * 0.48,
        focusX: x,
        focusY: y,
        resolutionX: safeWidth,
        resolutionY: safeHeight,
        routeCurve: 0.46 + (y - 0.5) * 0.42,
        routeGlow: 0.5 + intensity * 0.34,
    };
}

export function createHeroWebGLScene(
    mountRoot: HTMLElement | null,
    windowRef: WindowLike = window
): HeroWebGLScene | null {
    if (!mountRoot) return null;

    const canvas = mountRoot.ownerDocument.createElement('canvas');
    canvas.className = 'hero-canvas-layer hero-webgl-layer';
    canvas.setAttribute('aria-hidden', 'true');
    mountRoot.appendChild(canvas);

    const context = getWebGLContext(canvas);
    if (!context) {
        canvas.remove();
        return null;
    }

    const program = createProgram(context, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    if (!program) {
        canvas.remove();
        return null;
    }

    const handles = getHandles(context, program);
    if (!handles) {
        context.deleteProgram(program);
        canvas.remove();
        return null;
    }

    const buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(
        context.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        context.STATIC_DRAW
    );

    context.useProgram(program);
    context.enableVertexAttribArray(handles.aPosition);
    context.vertexAttribPointer(handles.aPosition, 2, context.FLOAT, false, 0, 0);
    context.clearColor(0, 0, 0, 0);

    const focus: HeroWebGLFocus = { ...DEFAULT_FOCUS };

    const render = (): void => {
        const rect = mountRoot.getBoundingClientRect();
        const width = rect.width || mountRoot.clientWidth || mountRoot.scrollWidth;
        const height = rect.height || mountRoot.clientHeight || mountRoot.scrollHeight;

        if (width <= 0 || height <= 0) return;

        const devicePixelRatio = Math.min(windowRef.devicePixelRatio ?? 1, 2);
        canvas.width = Math.round(width * devicePixelRatio);
        canvas.height = Math.round(height * devicePixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.viewport(0, 0, canvas.width, canvas.height);
        context.clear(context.COLOR_BUFFER_BIT);

        const uniforms = getHeroWebGLUniformState(width, height, focus);
        context.uniform2f(handles.uResolution, uniforms.resolutionX, uniforms.resolutionY);
        context.uniform2f(handles.uFocus, uniforms.focusX, uniforms.focusY);
        context.uniform1f(handles.uBeamStrength, uniforms.beamStrength);
        context.uniform1f(handles.uBeamRadius, uniforms.beamRadius);
        context.uniform1f(handles.uRouteCurve, uniforms.routeCurve);
        context.uniform1f(handles.uRouteGlow, uniforms.routeGlow);
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
    };

    const resizeObserver =
        typeof ResizeObserver === 'undefined'
            ? null
            : new ResizeObserver(() => {
                  render();
              });

    resizeObserver?.observe(mountRoot);
    windowRef.addEventListener('resize', render);
    render();

    return {
        kind: 'webgl',
        setFocus(nextFocus: Partial<HeroWebGLFocus>): void {
            focus.x = clamp(nextFocus.x ?? focus.x, 0, 1);
            focus.y = clamp(nextFocus.y ?? focus.y, 0, 1);
            focus.intensity = clamp(nextFocus.intensity ?? focus.intensity, 0.2, 1);
            render();
        },
        destroy(): void {
            resizeObserver?.disconnect();
            windowRef.removeEventListener('resize', render);
            context.bindBuffer(context.ARRAY_BUFFER, null);
            context.deleteBuffer(buffer);
            context.deleteProgram(program);
            canvas.remove();
        },
    };
}

function createProgram(
    context: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string
): WebGLProgram | null {
    const vertexShader = createShader(context, context.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(context, context.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) {
        if (vertexShader) context.deleteShader(vertexShader);
        if (fragmentShader) context.deleteShader(fragmentShader);
        return null;
    }

    const program = context.createProgram();

    context.attachShader(program, vertexShader);
    context.attachShader(program, fragmentShader);
    context.linkProgram(program);

    const linked = Boolean(context.getProgramParameter(program, context.LINK_STATUS));
    context.deleteShader(vertexShader);
    context.deleteShader(fragmentShader);

    if (!linked) {
        context.deleteProgram(program);
        return null;
    }

    return program;
}

function createShader(
    context: WebGLRenderingContext,
    type: number,
    source: string
): WebGLShader | null {
    const shader = context.createShader(type);
    if (!shader) return null;

    context.shaderSource(shader, source);
    context.compileShader(shader);

    const compiled = Boolean(context.getShaderParameter(shader, context.COMPILE_STATUS));
    if (!compiled) {
        context.deleteShader(shader);
        return null;
    }

    return shader;
}

function getHandles(
    context: WebGLRenderingContext,
    program: WebGLProgram
): HeroWebGLHandles | null {
    const aPosition = context.getAttribLocation(program, 'aPosition');
    const uResolution = context.getUniformLocation(program, 'uResolution');
    const uFocus = context.getUniformLocation(program, 'uFocus');
    const uBeamStrength = context.getUniformLocation(program, 'uBeamStrength');
    const uBeamRadius = context.getUniformLocation(program, 'uBeamRadius');
    const uRouteCurve = context.getUniformLocation(program, 'uRouteCurve');
    const uRouteGlow = context.getUniformLocation(program, 'uRouteGlow');

    if (
        aPosition < 0 ||
        !uResolution ||
        !uFocus ||
        !uBeamStrength ||
        !uBeamRadius ||
        !uRouteCurve ||
        !uRouteGlow
    ) {
        return null;
    }

    return {
        aPosition,
        uBeamRadius,
        uBeamStrength,
        uFocus,
        uResolution,
        uRouteCurve,
        uRouteGlow,
    };
}

function getWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
    const primary = canvas.getContext('webgl', WEBGL_CONTEXT_OPTIONS);
    if (isWebGLContext(primary)) {
        return primary;
    }

    const fallback = canvas.getContext('experimental-webgl', WEBGL_CONTEXT_OPTIONS);
    return isWebGLContext(fallback) ? fallback : null;
}

function isWebGLContext(context: RenderingContext | null): context is WebGLRenderingContext {
    return (
        context !== null &&
        'attachShader' in context &&
        'createShader' in context &&
        'drawArrays' in context &&
        'getUniformLocation' in context &&
        'viewport' in context
    );
}
