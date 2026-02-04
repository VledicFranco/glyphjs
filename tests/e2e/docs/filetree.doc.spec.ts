import { test, expect } from '@playwright/test';

const DOCS_URL = 'http://localhost:4321/glyphjs';

test.describe('FileTree docs page', () => {
  test('page loads and has title', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/filetree/`);
    await expect(page.locator('h1')).toContainText('FileTree');
  });

  test('live preview renders a tree', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/filetree/`);
    const preview = page.locator('[data-glyph-preview] [role="tree"]');
    await expect(preview.first()).toBeVisible({ timeout: 15000 });
  });

  test('properties table is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/filetree/`);
    const table = page.locator('table');
    await expect(table.first()).toBeVisible();
  });

  test('page has multiple live examples', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/filetree/`);
    const previews = page.locator('[data-glyph-preview]');
    const count = await previews.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('accessibility section is present', async ({ page }) => {
    await page.goto(`${DOCS_URL}/components/filetree/`);
    await expect(page.locator('text=Accessibility')).toBeVisible();
  });
});
