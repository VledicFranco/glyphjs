import { test, expect } from '@playwright/test';

const DOCS_URL = 'http://localhost:4321/glyphjs';

test.describe('Equation docs page', () => {
  test('page loads and has title', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/equation/`);
    await expect(page.locator('h1')).toContainText('Equation');
  });

  test('live preview renders math', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/equation/`);
    const preview = page.locator('[data-glyph-preview] [role="math"]');
    await expect(preview.first()).toBeVisible({ timeout: 15000 });
  });

  test('properties table is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/equation/`);
    const table = page.locator('table');
    await expect(table.first()).toBeVisible();
  });

  test('page has live examples', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/equation/`);
    const previews = page.locator('[data-glyph-preview]');
    await expect(previews.first()).toBeVisible({ timeout: 15000 });
    const count = await previews.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('accessibility section is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/equation/`);
    await expect(page.locator('h2#accessibility')).toBeVisible();
  });
});
