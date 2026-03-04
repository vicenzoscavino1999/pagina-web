import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

function formatViolations(
    violations: Array<{
        id: string;
        impact: string | null;
        description: string;
        nodes: Array<{ target: string[] }>;
    }>
): string {
    return violations
        .map((violation, index) => {
            const targets = violation.nodes
                .slice(0, 3)
                .map((node) => node.target.join(' '))
                .join(' | ');
            return `${index + 1}. [${violation.impact}] ${violation.id} - ${violation.description} (${targets})`;
        })
        .join('\n');
}

async function expectNoBlockingViolations(page: Page, contextLabel: string): Promise<void> {
    const analysis = await new AxeBuilder({ page }).analyze();
    const blockingViolations = analysis.violations.filter((violation) =>
        BLOCKING_IMPACTS.has(violation.impact ?? '')
    );

    expect(
        blockingViolations,
        `A11y blocking violations in ${contextLabel}:\n${formatViolations(blockingViolations)}`
    ).toEqual([]);
}

test.describe('Accessibility Gate', () => {
    test('home desktop sin violaciones serious/critical', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expectNoBlockingViolations(page, 'home desktop');
    });

    test('menu mobile abierto sin violaciones serious/critical', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await page.locator('#mobile-btn').click();
        await expect(page.locator('#mobile-menu')).toBeVisible();
        await expectNoBlockingViolations(page, 'mobile menu open');
    });
});
