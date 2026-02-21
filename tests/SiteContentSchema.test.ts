import { describe, expect, it } from 'vitest';
import { SITE_CONTENT } from '../src/content/siteContent';
import { siteContentSchema } from '../src/content/siteContentSchema';

describe('siteContentSchema', () => {
    it('valida el contenido productivo actual', () => {
        const parsed = siteContentSchema.parse(SITE_CONTENT);
        expect(parsed.brand.legalName).toBe('Postal Express SAC');
    });

    it('rechaza phoneDisplay con formato invalido', () => {
        const invalidContent = structuredClone(SITE_CONTENT);
        invalidContent.contact.phoneDisplay = 'ABC123';

        const result = siteContentSchema.safeParse(invalidContent);
        expect(result.success).toBe(false);
    });
});
