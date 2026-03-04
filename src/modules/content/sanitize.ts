const HTML_ESCAPE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
};

const SAFE_CLASS_TOKEN = /^[a-zA-Z0-9:_/-]+$/;
const SAFE_PERCENT = /^\d+%$/;

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function escapeHtml(value: string): string {
    return value.replace(/[&<>"'`]/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

export function escapeAttribute(value: string): string {
    return escapeHtml(value);
}

export function sanitizeHtmlWithLineBreaks(value: string): string {
    return escapeHtml(value).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
}

export function sanitizeHref(value: string): string {
    if (value.startsWith('/')) return value;
    if (value.startsWith('#')) return value;

    try {
        const parsed = new URL(value);
        if (SAFE_SCHEMES.has(parsed.protocol)) {
            return value;
        }
    } catch {
        // Fall through to safe default.
    }

    return '#';
}

export function sanitizeClassName(value: string): string {
    return value
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 0 && SAFE_CLASS_TOKEN.test(token))
        .join(' ');
}

export function sanitizePercent(value: string): string {
    return SAFE_PERCENT.test(value) ? value : '0%';
}
