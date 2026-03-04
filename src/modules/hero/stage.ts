import { gsap } from 'gsap';
import { clamp } from '../../utils/math';
import { getHeroStageMetrics, getHeroStageRenderState } from './ambient';
import { createHeroCanvasScene, type HeroCanvasScene } from './canvas';
import { createHeroWebGLScene, type HeroWebGLScene } from './webgl';

export interface HeroStageScene {
    destroy(): void;
}

type HeroVisualScene = HeroCanvasScene | HeroWebGLScene;

interface HeroStageSceneOptions {
    section: HTMLElement | null;
    background: HTMLElement | null;
    layout: HTMLElement | null;
    prefersReducedMotion: boolean;
    supportsFinePointer: boolean;
}

interface HeroMotionState {
    focusX: number;
    focusY: number;
    intensity: number;
    backgroundX: number;
    backgroundY: number;
    layoutX: number;
    layoutY: number;
}

interface HeroFocusState {
    focusX: number;
    focusY: number;
    intensity: number;
}

const createMotionState = (): HeroMotionState => ({
    focusX: 0.52,
    focusY: 0.44,
    intensity: 0.58,
    backgroundX: 0,
    backgroundY: 0,
    layoutX: 0,
    layoutY: 0,
});

const createFocusState = (): HeroFocusState => ({
    focusX: 0.52,
    focusY: 0.44,
    intensity: 0.58,
});

export function createHeroStageScene({
    section,
    background,
    layout,
    prefersReducedMotion,
    supportsFinePointer,
}: HeroStageSceneOptions): HeroStageScene | null {
    if (!section) return null;

    const mountRoot = background?.parentElement as HTMLElement | null;
    const ambientScene = createHeroWebGLScene(mountRoot) ?? createHeroCanvasScene(mountRoot);
    const motionState = createMotionState();
    const focusState = createFocusState();
    const windowRef = section.ownerDocument.defaultView ?? window;

    const render = (): void => {
        const metrics = getHeroStageMetrics(section.getBoundingClientRect(), windowRef.innerHeight);
        const renderState = getHeroStageRenderState(motionState, metrics);
        const focusX = clamp(focusState.focusX, 0.04, 0.96);
        const focusY = clamp(focusState.focusY, 0.08, 0.9);
        const focusIntensity = clamp(
            focusState.intensity + metrics.visibility * 0.06 + metrics.progress * 0.04,
            0.2,
            1
        );

        ambientScene?.setFocus({
            x: focusX,
            y: focusY,
            intensity: focusIntensity,
        });

        section.style.setProperty('--hero-stage-progress', renderState.stageDepth.toFixed(3));
        section.style.setProperty('--hero-stage-energy', renderState.stageEnergy.toFixed(3));
        section.style.setProperty('--hero-stage-sweep', `${(focusX * 100).toFixed(2)}%`);
        section.style.setProperty('--hero-stage-secondary-sweep', `${(82 - renderState.stageDepth * 14).toFixed(2)}%`);
        section.style.setProperty('--hero-pointer-x', `${(focusX * 100).toFixed(2)}%`);
        section.style.setProperty('--hero-pointer-y', `${(focusY * 100).toFixed(2)}%`);

        if (background) {
            background.style.transform = `translate3d(${renderState.backgroundX.toFixed(2)}px, ${renderState.backgroundY.toFixed(2)}px, 0) scale(1.065)`;
        }

        if (layout) {
            layout.style.transform = `translate3d(${renderState.layoutX.toFixed(2)}px, ${renderState.layoutY.toFixed(2)}px, 0)`;
        }
    };

    if (ambientScene) {
        section.dataset.heroScene = ambientScene.kind;
    } else {
        delete section.dataset.heroScene;
    }

    render();

    if (prefersReducedMotion) {
        return createSceneCleanup(background, layout, ambientScene, motionState, focusState, section);
    }

    const handleViewportChange = (): void => {
        render();
    };

    const handlePointerMove = (event: PointerEvent): void => {
        const rect = section.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const normalizedX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const normalizedY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

        focusState.focusX = normalizedX;
        focusState.focusY = normalizedY;
        focusState.intensity = 0.96;

        gsap.to(motionState, {
            backgroundX: (normalizedX - 0.5) * 18,
            backgroundY: (normalizedY - 0.46) * 14,
            duration: 0.24,
            ease: 'power2.out',
            focusX: normalizedX,
            focusY: normalizedY,
            intensity: 0.72,
            layoutX: (normalizedX - 0.5) * -10,
            layoutY: (normalizedY - 0.5) * -8,
            onUpdate: render,
            overwrite: true,
        });

        render();
    };

    const handlePointerLeave = (): void => {
        gsap.to(focusState, {
            duration: 0.22,
            ease: 'power2.out',
            focusX: 0.52,
            focusY: 0.44,
            intensity: 0.58,
            onUpdate: render,
            overwrite: true,
        });

        gsap.to(motionState, {
            backgroundX: 0,
            backgroundY: 0,
            duration: 0.38,
            ease: 'expo.out',
            focusX: 0.52,
            focusY: 0.44,
            intensity: 0.58,
            layoutX: 0,
            layoutY: 0,
            onUpdate: render,
            overwrite: true,
        });
    };

    windowRef.addEventListener('scroll', handleViewportChange);
    windowRef.addEventListener('resize', handleViewportChange);

    if (supportsFinePointer) {
        section.addEventListener('pointermove', handlePointerMove);
        section.addEventListener('pointerleave', handlePointerLeave);
        section.addEventListener('pointercancel', handlePointerLeave);
    }

    return {
        destroy(): void {
            windowRef.removeEventListener('scroll', handleViewportChange);
            windowRef.removeEventListener('resize', handleViewportChange);

            if (supportsFinePointer) {
                section.removeEventListener('pointermove', handlePointerMove);
                section.removeEventListener('pointerleave', handlePointerLeave);
                section.removeEventListener('pointercancel', handlePointerLeave);
            }

            gsap.killTweensOf(motionState);
            gsap.killTweensOf(focusState);
            ambientScene?.destroy();
            clearStageSurface(section);

            if (background) {
                background.style.removeProperty('transform');
            }

            if (layout) {
                layout.style.removeProperty('transform');
            }
        },
    };
}

function createSceneCleanup(
    background: HTMLElement | null,
    layout: HTMLElement | null,
    ambientScene: HeroVisualScene | null,
    motionState: HeroMotionState,
    focusState: HeroFocusState,
    section: HTMLElement
): HeroStageScene {
    return {
        destroy(): void {
            gsap.killTweensOf(motionState);
            gsap.killTweensOf(focusState);
            ambientScene?.destroy();
            clearStageSurface(section);

            if (background) {
                background.style.removeProperty('transform');
            }

            if (layout) {
                layout.style.removeProperty('transform');
            }
        },
    };
}

function clearStageSurface(section: HTMLElement): void {
    delete section.dataset.heroScene;
    section.style.removeProperty('--hero-stage-progress');
    section.style.removeProperty('--hero-stage-energy');
    section.style.removeProperty('--hero-stage-sweep');
    section.style.removeProperty('--hero-stage-secondary-sweep');
    section.style.removeProperty('--hero-pointer-x');
    section.style.removeProperty('--hero-pointer-y');
}
