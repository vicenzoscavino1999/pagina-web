import { DomContractError, qs } from '../utils/dom';

interface DomRule {
    selector: string;
    label: string;
}

const CRITICAL_DOM_RULES: readonly DomRule[] = [
    { selector: '#navbar', label: 'Navegacion principal' },
    { selector: '#hero-section', label: 'Hero section' },
    { selector: '#hero-title-main', label: 'Titulo principal del hero' },
    { selector: '#tracking-form', label: 'Formulario de tracking' },
    { selector: '#tracking-input', label: 'Input de tracking' },
    { selector: '#tracking-btn', label: 'Boton de tracking' },
    { selector: '#tracking-result', label: 'Panel de resultado tracking' },
    { selector: '#servicios', label: 'Seccion de servicios' },
    { selector: '#services-grid', label: 'Grid de servicios' },
    { selector: '#features-carousel', label: 'Carousel horizontal' },
    { selector: '#contacto', label: 'Seccion de contacto/FAQ' },
    { selector: '#floating-whatsapp-link', label: 'Boton flotante de WhatsApp' },
];

export function assertCriticalDomContract(documentRoot: Document = document): void {
    // Allows unit tests that intentionally use an empty DOM.
    if (documentRoot.body.children.length === 0) return;

    const missing = CRITICAL_DOM_RULES.filter((rule) => !qs(rule.selector, documentRoot));
    if (missing.length === 0) return;

    const details = missing.map((rule) => `- ${rule.selector} (${rule.label})`).join('\n');
    throw new DomContractError(
        `[App DOM Contract] Missing critical DOM elements.\n${details}\n` +
            'This usually means the static HTML structure was edited and no longer matches the TypeScript modules.'
    );
}
