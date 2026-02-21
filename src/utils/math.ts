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
export const debounce = <TArgs extends unknown[]>(
    func: (...args: TArgs) => void,
    wait: number
): ((...args: TArgs) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: TArgs): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
};

/**
 * Throttles a function execution.
 */
export const throttle = <TArgs extends unknown[]>(
    func: (...args: TArgs) => void,
    limit: number
): ((...args: TArgs) => void) => {
    let inThrottle = false;
    return (...args: TArgs): void => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};
