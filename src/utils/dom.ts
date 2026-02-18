/**
 * Select a single element.
 */
// eslint-disable-next-line
export function qs<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T | null {
    return scope.querySelector<T>(selector);
}

/**
 * Select multiple elements.
 */
//
export function qsa<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T[] {
    return Array.from(scope.querySelectorAll<T>(selector));
}
