import { test, expect } from '@playwright/test';

const DOCS_URL = 'http://localhost:4321/glyphjs';

test.describe('DecisionTree docs page', () => {
  test('page loads and has title', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/decisiontree/`);
    await expect(page.locator('h1')).toContainText('DecisionTree');
  });

  test('live preview renders an SVG with role="tree"', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/decisiontree/`);
    const preview = page.locator('[data-glyph-preview] svg[role="tree"]');
    await expect(preview.first()).toBeVisible({ timeout: 15000 });
  });

  test('properties table is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/decisiontree/`);
    const table = page.locator('table');
    await expect(table.first()).toBeVisible();
  });

  test('page has at least two live examples', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/decisiontree/`);
    const previews = page.locator('[data-glyph-preview]');
    await expect(previews.first()).toBeVisible({ timeout: 15000 });
    const count = await previews.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('accessibility section is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/decisiontree/`);
    await expect(page.locator('h2#accessibility')).toBeVisible();
  });
});
