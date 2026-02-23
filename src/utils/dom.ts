/**
 * Select a single element.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function qs<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T | null {
    return scope.querySelector<T>(selector);
}

/**
 * Select multiple elements.
 */
export function qsa<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T[] {
    return Array.from(scope.querySelectorAll<T>(selector));
}

export class DomContractError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomContractError';
    }
}

/**
 * Require a selector to exist or fail fast with a descriptive runtime error.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function requireQs<T extends Element = HTMLElement>(
    selector: string,
    scope: ParentNode = document,
    context = 'DOM'
): T {
    const element = qs<T>(selector, scope);
    if (!element) {
        throw new DomContractError(`[${context}] Missing required element: ${selector}`);
    }
    return element;
}

/**
 * Require an element by id using querySelector so it also works on Element scopes.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function requireById<T extends HTMLElement = HTMLElement>(
    id: string,
    scope: ParentNode = document,
    context = 'DOM'
): T {
    return requireQs<T>(`#${id}`, scope, context);
}
