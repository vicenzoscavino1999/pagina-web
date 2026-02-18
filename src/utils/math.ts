/**
 * Clamps a value between a minimum and maximum.
 */
export const clamp = (val: number, min: number, max: number): number => Math.min(Math.max(val, min), max);

/**
 * Linear interpolation between two values.
 */
export const lerp = (start: number, end: number, t: number): number => start * (1 - t) + end * t;

/**
 * Debounces a function execution.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { func(...args); }, wait);
    };
};

/**
 * Throttles a function execution.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}
