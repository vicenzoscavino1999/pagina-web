export function formatPhoneDisplay(phoneDigits: string): string {
    const normalized = phoneDigits.replace(/\D/g, '');
    const match = normalized.match(/^(\d{3})(\d{3})(\d{3})$/);
    if (!match) return phoneDigits;

    const [, a, b, c] = match;
    return `${a} ${b} ${c}`;
}
