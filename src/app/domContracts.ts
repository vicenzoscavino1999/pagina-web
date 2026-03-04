export interface DomRule {
    selector: string;
    label: string;
}

export const DOM_CONTRACT_SECTIONS: Record<string, readonly DomRule[]> = {
    shell: [
        { selector: '#skip-to-content', label: 'Atajo de navegacion principal' },
        { selector: '#navbar', label: 'Navegacion principal' },
        { selector: '#main-content', label: 'Landmark main del documento' },
    ],
    hero: [
        { selector: '#hero-section', label: 'Hero section' },
        { selector: '#hero-layout', label: 'Layout principal del hero' },
        { selector: '#hero-copy', label: 'Contenedor del copy del hero' },
    ],
    tracking: [{ selector: '#tracking-widget', label: 'Widget de tracking' }],
    services: [
        { selector: '#servicios', label: 'Seccion de servicios' },
        { selector: '#services-grid', label: 'Grid de servicios' },
    ],
    discovery: [{ selector: '#features-carousel', label: 'Carousel horizontal' }],
    contact: [{ selector: '#contacto', label: 'Seccion de contacto/FAQ' }],
    support: [{ selector: '#floating-whatsapp-link', label: 'Boton flotante de WhatsApp' }],
} as const;

export type DomContractSectionName = keyof typeof DOM_CONTRACT_SECTIONS;

export const DOM_CONTRACT_SECTION_ORDER: readonly DomContractSectionName[] = [
    'shell',
    'hero',
    'tracking',
    'services',
    'discovery',
    'contact',
    'support',
] as const;

export function getDomContractRules(
    sections: readonly DomContractSectionName[] = DOM_CONTRACT_SECTION_ORDER
): readonly DomRule[] {
    return sections.flatMap((section) => DOM_CONTRACT_SECTIONS[section] ?? []);
}

export const CRITICAL_DOM_RULES = getDomContractRules();
export const CRITICAL_DOM_SELECTORS = CRITICAL_DOM_RULES.map((rule) => rule.selector);
