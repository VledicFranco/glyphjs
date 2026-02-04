import { test, expect } from '@playwright/test';

const DOCS_URL = 'http://localhost:4321/glyphjs';

test.describe('Flowchart docs page', () => {
  test('page loads and has title', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/flowchart/`);
    await expect(page.locator('h1')).toContainText('Flowchart');
  });

  test('live preview renders an SVG', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/flowchart/`);
    const preview = page.locator('[data-glyph-preview] svg');
    await expect(preview.first()).toBeVisible({ timeout: 15000 });
  });

  test('properties table is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/flowchart/`);
    const table = page.locator('table');
    await expect(table.first()).toBeVisible();
  });

  test('page has multiple live examples', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/flowchart/`);
    const previews = page.locator('[data-glyph-preview]');
    const count = await previews.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('accessibility section is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/flowchart/`);
    await expect(page.locator('text=Accessibility')).toBeVisible();
  });
});
