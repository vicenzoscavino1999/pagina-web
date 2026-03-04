import { beforeEach, describe, expect, it } from 'vitest';
import {
    getTruckSceneProgress,
    getTruckStatusIndex,
    getTruckViewportLeft,
    hasTruckPassedWaypoint,
} from '../src/modules/truck/progress';
import {
    applyTruckSceneVisualState,
    getTruckSceneRangeProgress,
    getTruckSceneVisualState,
    resetTruckSceneVisualState,
} from '../src/modules/truck/scene';
import { applyTruckSceneState, applyTruckStatus } from '../src/modules/truck/view';

describe('truck scene helpers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('calcula el progreso del scene solo dentro del rango scrollable', () => {
        expect(
            getTruckSceneProgress({
                rectTop: -1000,
                sectionHeight: 3000,
                windowHeight: 1000,
            })
        ).toBe(0.5);

        expect(
            getTruckSceneProgress({
                rectTop: 100,
                sectionHeight: 3000,
                windowHeight: 1000,
            })
        ).toBeNull();

        expect(
            getTruckSceneProgress({
                rectTop: -2500,
                sectionHeight: 3000,
                windowHeight: 1000,
            })
        ).toBeNull();

        expect(
            getTruckSceneProgress({
                rectTop: 0,
                sectionHeight: 1000,
                windowHeight: 1000,
            })
        ).toBe(0);
    });

    it('calcula posicion, status y activacion de waypoints', () => {
        expect(getTruckViewportLeft(0)).toBe(-5);
        expect(getTruckViewportLeft(1)).toBe(92);
        expect(getTruckStatusIndex(0.74, 4)).toBe(2);
        expect(getTruckStatusIndex(0.5, 0)).toBe(0);
        expect(hasTruckPassedWaypoint(0.5, 0.55)).toBe(true);
        expect(hasTruckPassedWaypoint(0.2, 0.55)).toBe(false);
        expect(getTruckSceneRangeProgress(0.4, 0.8, 0.2)).toBe(1);
    });

    it('aplica estado visual y badge del truck scene', () => {
        document.body.innerHTML = `
            <section id="truck-scene"></section>
            <div id="delivery-truck"></div>
            <div id="ts-progress-fill"></div>
            <div id="ts-status"></div>
            <div class="ts-waypoint"></div>
            <div class="ts-waypoint"></div>
        `;

        const section = document.getElementById('truck-scene') as HTMLElement;
        const truck = document.getElementById('delivery-truck') as HTMLElement;
        const progressFill = document.getElementById('ts-progress-fill');
        const statusBadge = document.getElementById('ts-status');
        const waypointElements = document.querySelectorAll<HTMLElement>('.ts-waypoint');
        const motionState = getTruckSceneVisualState(0.5);

        applyTruckSceneState(
            {
                truck,
                progressFill,
                waypoints: [
                    { el: waypointElements[0] as HTMLElement, position: 0.25 },
                    { el: waypointElements[1] as HTMLElement, position: 0.75 },
                ],
            },
            1,
            92,
        );
        applyTruckSceneVisualState(section, motionState);

        expect(truck.style.left).toBe('92vw');
        expect(progressFill?.style.width).toBe('100%');
        expect(truck.classList.contains('truck--arrived')).toBe(true);
        expect(waypointElements[0]?.classList.contains('wp--active')).toBe(true);
        expect(waypointElements[1]?.classList.contains('wp--active')).toBe(true);
        expect(parseFloat(section.style.getPropertyValue('--ts-road-glow-opacity'))).toBeGreaterThan(0.4);
        expect(parseFloat(section.style.getPropertyValue('--ts-overlay-opacity'))).toBeGreaterThan(0.8);

        const flashed = applyTruckStatus(statusBadge, 'Distribucion en curso', '');
        expect(flashed).toBe(true);
        expect(statusBadge?.textContent).toBe('Distribucion en curso');
        expect(statusBadge?.classList.contains('ts-badge--flash')).toBe(true);

        const flashedAgain = applyTruckStatus(statusBadge, 'Distribucion en curso', 'Distribucion en curso');
        expect(flashedAgain).toBe(false);

        resetTruckSceneVisualState(section);
        expect(section.style.getPropertyValue('--ts-road-glow-opacity')).toBe('');
    });
});
