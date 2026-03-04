import { test } from '@playwright/test';
import { registerCoreSmokeTests } from './smoke.shared';

test.describe('Landing Smoke Core', () => {
    registerCoreSmokeTests();
});
