import { test, expect } from '@playwright/test';

const DOCS_URL = 'http://localhost:4321/glyphjs';

test.describe('Sankey docs page', () => {
  test('page loads and has title', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/sankey/`);
    await expect(page.locator('h1')).toContainText('Sankey');
  });

  test('live preview renders an SVG', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/sankey/`);
    const preview = page.locator('[data-glyph-preview] svg');
    await expect(preview.first()).toBeVisible({ timeout: 15000 });
  });

  test('multiple examples are present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/sankey/`);
    const previews = page.locator('[data-glyph-preview]');
    await expect(previews.first()).toBeVisible({ timeout: 15000 });
    const count = await previews.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('properties table is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/sankey/`);
    const tables = page.locator('main table');
    await expect(tables.first()).toBeVisible();
  });

  test('accessibility section is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/sankey/`);
    await expect(page.locator('h2#accessibility')).toBeVisible();
  });

  test('first preview exposes the hidden flows table', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/sankey/`);
    const previewContainers = page.locator('[data-glyph-preview]');
    await expect(previewContainers.first()).toBeVisible({ timeout: 15000 });
    const flowsTable = previewContainers.first().locator('table[aria-label="Sankey flows"]');
    await expect(flowsTable).toHaveCount(1);
  });
});
