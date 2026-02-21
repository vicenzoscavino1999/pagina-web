export interface AppEvents {
    'scroll': { y: number; direction: 'up' | 'down'; delta: number };
    'resize': { width: number; height: number };
    'tracking:submit': { trackingId: string };
    'tracking:success': { trackingId: string; date?: Date };
}

export type EventName = keyof AppEvents;

export type EventHandler<K extends EventName = EventName> = (payload: AppEvents[K]) => void;
