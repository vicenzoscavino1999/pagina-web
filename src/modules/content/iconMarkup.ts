import { sanitizeClassName } from './sanitize';

const ICON_GROUP_TOKENS = new Set(['fa-solid', 'fa-regular', 'fa-brands']);

const ICON_MARKUP = {
    'arrow-right': '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />',
    bars: '<path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" />',
    bell: '<path d="M18 17H6l1.2-1.6A3 3 0 0 0 8 13.6V10a4 4 0 1 1 8 0v3.6a3 3 0 0 0 .8 1.8L18 17Z" /><path d="M10 20a2 2 0 0 0 4 0" />',
    bolt: '<path d="M13 2 5 13h6l-1 9 8-11h-6z" />',
    box: '<path d="m3 7.5 9-4.5 9 4.5-9 4.5-9-4.5Z" /><path d="M3 7.5v9L12 21l9-4.5v-9" /><path d="M12 12v9" />',
    'box-open': '<path d="m3 8 9 4 9-4" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 12v9" /><path d="m7 5 5 2 5-2" />',
    building: '<path d="M2 21h20" /><path d="M4 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16" /><path d="M17 21V10a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v11" /><path d="M8 8h2" /><path d="M12 8h2" /><path d="M8 12h2" /><path d="M12 12h2" /><path d="M9 21v-4h2v4" />',
    certificate: '<circle cx="12" cy="8" r="4" /><path d="M10 12v9l2-2 2 2v-9" /><path d="m10.5 8 1 1 2-2" />',
    check: '<path d="m5 12 4 4 10-10" />',
    'chevron-down': '<path d="m6 9 6 6 6-6" />',
    'chevron-left': '<path d="m15 6-6 6 6 6" />',
    'chevron-right': '<path d="m9 6 6 6-6 6" />',
    'circle-check': '<circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />',
    'clipboard-check': '<rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4.5h6" /><path d="m9 13 2 2 4-4" />',
    clock: '<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />',
    'envelope-open-text': '<path d="M3 8v10h18V8" /><path d="m3 8 9 6 9-6" /><path d="M7 5h10" /><path d="M8 12h8" /><path d="M8 15h5" />',
    'file-lines': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /><path d="M9 9h2" />',
    'file-signature': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 12h3" /><path d="M9 16c1.2-1.3 2.3-1.6 3.3-.8.9.8 1.8.6 2.8-.6" />',
    gift: '<path d="M20 12v8H4v-8" /><path d="M2 7h20v5H2z" /><path d="M12 7v13" /><path d="M12 7c0-2-1-4-3-4-1.5 0-2.5 1.1-2.5 2.4 0 1.4 1 1.6 2 1.6H12Z" /><path d="M12 7c0-2 1-4 3-4 1.5 0 2.5 1.1 2.5 2.4 0 1.4-1 1.6-2 1.6H12Z" />',
    house: '<path d="M3 11.5 12 4l9 7.5" /><path d="M5 10.5V20h14v-9.5" /><path d="M10 20v-5h4v5" />',
    'id-card': '<rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M13 10h5" /><path d="M13 14h5" /><path d="M6 16c1-.9 3-.9 4 0" />',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 1 1 8 0v3" />',
    'location-dot': '<path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" />',
    'magnifying-glass': '<circle cx="11" cy="11" r="6" /><path d="m20 20-4.35-4.35" />',
    'map-location-dot': '<path d="m9 3-6 2v16l6-2 6 2 6-2V3l-6 2-6-2Z" /><path d="M9 3v16" /><path d="M15 5v16" /><circle cx="15" cy="10" r="1.5" />',
    pen: '<path d="m4 20 4.5-1 9-9a1.5 1.5 0 0 0 0-2.1L16 6.4a1.5 1.5 0 0 0-2.1 0l-9 9L4 20Z" /><path d="m13 7 4 4" />',
    phone: '<path d="M22 16.5v3a2 2 0 0 1-2.2 2c-9.2-1-16.1-7.9-17.1-17.1A2 2 0 0 1 4.7 2h3A2 2 0 0 1 9.7 3.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.9 5.9l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.5Z" />',
    scroll: '<path d="M8 6h8a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h8" /><path d="M8 6a3 3 0 1 0 0 6" /><path d="M16 12a3 3 0 1 1 0 6" />',
    'satellite-dish': '<path d="M4 20h4" /><path d="M6 16v4" /><path d="M6 18 14 10" /><path d="M8.5 15.5a7 7 0 0 0 7-7" /><path d="M10.5 13.5a4 4 0 0 0 4-4" /><circle cx="15.5" cy="8.5" r="1.5" />',
    'shield-halved': '<path d="m12 3 7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" /><path d="M12 3v18" />',
    truck: '<path d="M3 9h10v7H3z" /><path d="M13 11h4l3 3v2h-7" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="17.5" cy="18" r="1.5" />',
    'truck-fast': '<path d="M10 9H4v7h9v-5" /><path d="M13 11h4l3 3v2h-7" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="17.5" cy="18" r="1.5" /><path d="M2 10h2" /><path d="M1 13h3" /><path d="M2 16h2" />',
    whatsapp: '<path d="M20 11.5a8.5 8.5 0 0 1-12.5 7.5L4 20l1-3.1A8.5 8.5 0 1 1 20 11.5Z" /><path d="M9 8.5c-.5 0-1 .4-1 .9 0 2.8 3.7 6.6 6.5 6.6.5 0 .9-.4 1-.9l.1-.8c.1-.4-.1-.8-.5-1l-1.4-.6c-.3-.1-.7-.1-.9.2l-.3.4c-.6-.3-1.5-1.2-1.8-1.8l.4-.3c.3-.2.3-.6.2-.9l-.6-1.4c-.2-.4-.6-.6-1-.5l-.9.1z" />',
} as const;

type IconName = keyof typeof ICON_MARKUP;

function getDescriptorParts(descriptor: string): { iconName: IconName; extraClassName: string } {
    const tokens = descriptor.trim().split(/\s+/).filter(Boolean);
    const iconToken = tokens.find((token) => token.startsWith('fa-') && !ICON_GROUP_TOKENS.has(token));
    const extraClassName = sanitizeClassName(tokens.filter((token) => !token.startsWith('fa-')).join(' '));

    if (!iconToken) {
        return { iconName: 'circle-check', extraClassName };
    }

    const iconName = iconToken.slice(3) as IconName;
    if (!(iconName in ICON_MARKUP)) {
        return { iconName: 'circle-check', extraClassName };
    }

    return { iconName, extraClassName };
}

export function renderIconMarkup(descriptor: string, className = ''): string {
    const { iconName, extraClassName } = getDescriptorParts(descriptor);
    const svgClassName = sanitizeClassName(['app-icon', extraClassName, className].filter(Boolean).join(' '));

    return `
        <svg
            class="${svgClassName}"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            ${ICON_MARKUP[iconName]}
        </svg>
    `.trim();
}
