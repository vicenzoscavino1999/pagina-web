import { DomContractError, qs } from '../utils/dom';
import { getDomContractRules, type DomContractSectionName } from './domContracts';

export function assertCriticalDomContract(
    documentRoot: Document = document,
    sections?: readonly DomContractSectionName[]
): void {
    // Allows unit tests that intentionally use an empty DOM.
    if (documentRoot.body.children.length === 0) return;

    const missing = getDomContractRules(sections).filter((rule) => !qs(rule.selector, documentRoot));
    if (missing.length === 0) return;

    const details = missing.map((rule) => `- ${rule.selector} (${rule.label})`).join('\n');
    throw new DomContractError(
        `[App DOM Contract] Missing critical DOM elements.\n${details}\n` +
            'This usually means the static HTML structure was edited and no longer matches the TypeScript modules.'
    );
}
