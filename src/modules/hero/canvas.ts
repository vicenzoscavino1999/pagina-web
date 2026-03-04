import { clamp } from '../../utils/math';

export interface HeroCanvasFocus {
    x: number;
    y: number;
    intensity: number;
}

export interface HeroCanvasPoint {
    x: number;
    y: number;
}

export interface HeroCanvasOrb extends HeroCanvasPoint {
    radius: number;
    opacity: number;
}

export interface HeroCanvasRouteSegment {
    control: HeroCanvasPoint;
    end: HeroCanvasPoint;
}

export interface HeroCanvasRenderableRoute {
    firstPoint: HeroCanvasPoint;
    lastPoint: HeroCanvasPoint;
    segments: HeroCanvasRouteSegment[];
}

export interface HeroCanvasSceneModel {
    beam: HeroCanvasOrb;
    groundGlow: HeroCanvasOrb;
    followGlow: HeroCanvasOrb;
    route: HeroCanvasPoint[];
    orbs: HeroCanvasOrb[];
}

export interface HeroCanvasScene {
    kind: 'canvas';
    setFocus(focus: Partial<HeroCanvasFocus>): void;
    destroy(): void;
}

interface WindowLike {
    addEventListener(type: 'resize', listener: () => void): void;
    removeEventListener(type: 'resize', listener: () => void): void;
    devicePixelRatio?: number;
}

const DEFAULT_FOCUS: HeroCanvasFocus = {
    x: 0.52,
    y: 0.44,
    intensity: 0.58,
};

export function getHeroCanvasSceneModel(
    width: number,
    height: number,
    focus: HeroCanvasFocus = DEFAULT_FOCUS
): HeroCanvasSceneModel {
    const safeWidth = Math.max(width, 1);
    const safeHeight = Math.max(height, 1);
    const x = clamp(focus.x, 0, 1);
    const y = clamp(focus.y, 0, 1);
    const intensity = clamp(focus.intensity, 0.2, 1);
    const offsetX = (x - 0.5) * safeWidth * 0.09;
    const offsetY = (y - 0.48) * safeHeight * 0.12;
    const focusX = safeWidth * clamp(0.16 + x * 0.7, 0.14, 0.86);
    const focusY = safeHeight * clamp(0.16 + y * 0.62, 0.16, 0.84);

    return {
        beam: {
            x: focusX,
            y: focusY,
            radius: safeWidth * (0.13 + intensity * 0.09),
            opacity: 0.18 + intensity * 0.2,
        },
        followGlow: {
            x: safeWidth * clamp(0.28 + x * 0.44, 0.24, 0.76),
            y: safeHeight * clamp(0.54 + y * 0.22, 0.52, 0.82),
            radius: safeWidth * (0.16 + intensity * 0.06),
            opacity: 0.12 + intensity * 0.1,
        },
        groundGlow: {
            x: safeWidth * clamp(0.3 + x * 0.36, 0.26, 0.7),
            y: safeHeight * 0.94,
            radius: safeWidth * (0.28 + intensity * 0.08),
            opacity: 0.08 + intensity * 0.08,
        },
        route: [
            { x: safeWidth * 0.12 + offsetX * 0.24, y: safeHeight * 0.34 - offsetY * 0.18 },
            { x: safeWidth * 0.3 + offsetX * 0.32, y: safeHeight * 0.56 + offsetY * 0.12 },
            { x: safeWidth * 0.54 + offsetX * 0.42, y: safeHeight * 0.46 - offsetY * 0.22 },
            { x: safeWidth * 0.84 - offsetX * 0.16, y: safeHeight * 0.74 + offsetY * 0.18 },
        ],
        orbs: [
            {
                x: safeWidth * 0.2 + offsetX * 0.32,
                y: safeHeight * 0.24 - offsetY * 0.25,
                radius: safeWidth * 0.075,
                opacity: 0.18 + intensity * 0.18,
            },
            {
                x: safeWidth * 0.76 - offsetX * 0.18,
                y: safeHeight * 0.31 - offsetY * 0.18,
                radius: safeWidth * 0.062,
                opacity: 0.14 + intensity * 0.14,
            },
            {
                x: safeWidth * 0.66 + offsetX * 0.26,
                y: safeHeight * 0.72 + offsetY * 0.18,
                radius: safeWidth * 0.1,
                opacity: 0.1 + intensity * 0.12,
            },
        ],
    };
}

export function getHeroCanvasRenderableRoute(
    route: readonly (HeroCanvasPoint | null | undefined)[]
): HeroCanvasRenderableRoute | null {
    if (route.length < 2) return null;

    const firstPoint = route[0];
    const lastPoint = route[route.length - 1];
    if (!firstPoint || !lastPoint) return null;

    const segments: HeroCanvasRouteSegment[] = [];

    for (let index = 1; index < route.length; index += 1) {
        const previous = route[index - 1];
        const current = route[index];
        if (!previous || !current) continue;

        segments.push({
            control: previous,
            end: {
                x: (previous.x + current.x) / 2,
                y: (previous.y + current.y) / 2,
            },
        });
    }

    return {
        firstPoint,
        lastPoint,
        segments,
    };
}

export function createHeroCanvasScene(
    mountRoot: HTMLElement | null,
    windowRef: WindowLike = window
): HeroCanvasScene | null {
    if (!mountRoot) return null;

    const canvas = mountRoot.ownerDocument.createElement('canvas');
    canvas.className = 'hero-canvas-layer';
    canvas.setAttribute('aria-hidden', 'true');
    mountRoot.appendChild(canvas);

    const context = canvas.getContext('2d');
    if (!context) {
        canvas.remove();
        return null;
    }

    const focus: HeroCanvasFocus = { ...DEFAULT_FOCUS };

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

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        renderHeroCanvas(context, width, height, focus);
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
        kind: 'canvas',
        setFocus(nextFocus: Partial<HeroCanvasFocus>): void {
            focus.x = clamp(nextFocus.x ?? focus.x, 0, 1);
            focus.y = clamp(nextFocus.y ?? focus.y, 0, 1);
            focus.intensity = clamp(nextFocus.intensity ?? focus.intensity, 0.2, 1);
            render();
        },
        destroy(): void {
            resizeObserver?.disconnect();
            windowRef.removeEventListener('resize', render);
            canvas.remove();
        },
    };
}

function renderHeroCanvas(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    focus: HeroCanvasFocus
): void {
    const model = getHeroCanvasSceneModel(width, height, focus);

    renderBackgroundGrid(context, width, height, focus);
    renderOrb(context, model.groundGlow, 'rgba(14, 165, 233, 1)');
    renderOrb(context, model.followGlow, 'rgba(56, 189, 248, 1)');
    renderBeam(context, model.beam);
    renderHeroCanvasRoute(context, model.route);
    model.orbs.forEach((orb) => {
        renderOrb(context, orb, 'rgba(125, 211, 252, 1)');
    });
}

function renderBackgroundGrid(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    focus: HeroCanvasFocus
): void {
    const lineCount = 7;
    const sway = (focus.x - 0.5) * width * 0.05;

    context.save();
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(186, 230, 253, 0.08)';

    for (let index = 0; index < lineCount; index += 1) {
        const y = height * (0.16 + index * 0.11);
        context.beginPath();
        context.moveTo(width * 0.08 - sway * 0.12, y);
        context.quadraticCurveTo(width * 0.46 + sway, y - height * 0.08, width * 0.94 + sway * 0.14, y + height * 0.03);
        context.stroke();
    }

    context.restore();
}

function renderBeam(context: CanvasRenderingContext2D, beam: HeroCanvasOrb): void {
    const gradient = context.createRadialGradient(beam.x, beam.y, 0, beam.x, beam.y, beam.radius);
    gradient.addColorStop(0, `rgba(56, 189, 248, ${beam.opacity})`);
    gradient.addColorStop(0.45, `rgba(14, 165, 233, ${beam.opacity * 0.45})`);
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

    context.save();
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(beam.x, beam.y, beam.radius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = 'rgba(148, 226, 255, 0.28)';
    context.lineWidth = 1.2;
    context.beginPath();
    context.arc(beam.x, beam.y, beam.radius * 0.46, 0, Math.PI * 2);
    context.stroke();
    context.restore();
}

export function renderHeroCanvasRoute(
    context: CanvasRenderingContext2D,
    route: HeroCanvasPoint[]
): void {
    const renderableRoute = getHeroCanvasRenderableRoute(route);
    if (!renderableRoute) return;

    const { firstPoint, lastPoint, segments } = renderableRoute;

    const gradient = context.createLinearGradient(firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y);
    gradient.addColorStop(0, 'rgba(125, 211, 252, 0.18)');
    gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.9)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.28)');

    context.save();
    context.strokeStyle = gradient;
    context.lineWidth = 2.1;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(firstPoint.x, firstPoint.y);

    segments.forEach((segment) => {
        context.quadraticCurveTo(segment.control.x, segment.control.y, segment.end.x, segment.end.y);
    });

    context.lineTo(lastPoint.x, lastPoint.y);
    context.stroke();

    route.forEach((point, index) => {
        renderOrb(
            context,
            {
                ...point,
                radius: index === route.length - 1 ? 10 : 6,
                opacity: index === route.length - 1 ? 0.95 : 0.72,
            },
            index === route.length - 1 ? 'rgba(34, 197, 94, 1)' : 'rgba(125, 211, 252, 1)'
        );
    });

    context.restore();
}

function renderOrb(context: CanvasRenderingContext2D, orb: HeroCanvasOrb, color: string): void {
    const glow = context.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
    glow.addColorStop(0, color.replace(', 1)', `, ${orb.opacity})`));
    glow.addColorStop(0.45, color.replace(', 1)', `, ${orb.opacity * 0.38})`));
    glow.addColorStop(1, color.replace(', 1)', ', 0)'));

    context.fillStyle = glow;
    context.beginPath();
    context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    context.fill();
}
