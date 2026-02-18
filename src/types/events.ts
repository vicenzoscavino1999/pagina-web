// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler<T = any> = (payload: T) => void;



export interface AppEvents {
    'scroll': { y: number; direction: 'up' | 'down'; delta: number };
    'resize': { width: number; height: number };
    'tracking:submit': { trackingId: string };
    'tracking:success': { trackingId: string; date?: Date };
    // Add other events as discovered
}
