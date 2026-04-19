import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('DecisionTree visual tests', () => {
  test('Default story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-decisiontree--default&viewMode=story`,
    );
    const svg = page.locator('svg[role="tree"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('ReasoningTrace story renders with confidence badges', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-decisiontree--reasoning-trace&viewMode=story`,
    );
    const svg = page.locator('svg[role="tree"]');
    await expect(svg).toBeVisible({ timeout: 15000 });

    // At least one confidence badge should be present
    const badge = page.locator('[data-testid^="decisiontree-confidence-"]').first();
    await expect(badge).toBeVisible();
  });

  test('TopDown story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-decisiontree--top-down&viewMode=story`,
    );
    const svg = page.locator('svg[role="tree"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('PolicyDocumentation story renders deep tree', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-decisiontree--policy-documentation&viewMode=story`,
    );
    const svg = page.locator('svg[role="tree"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('SingleOutcome story renders trivial tree', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-decisiontree--single-outcome&viewMode=story`,
    );
    const svg = page.locator('svg[role="tree"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });
});
