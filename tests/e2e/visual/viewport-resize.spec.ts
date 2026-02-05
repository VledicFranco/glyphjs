import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Viewport resize — container adaptation', () => {
  test('Card Default: wide viewport shows 3 columns', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(storyUrl('components-card--default'));

    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();

    const grid = page.locator('[role="list"]');
    const gridCols = await grid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
    // At 1200px, the default 3-card story should render 3 columns
    const colCount = gridCols.trim().split(/\s+/).length;
    expect(colCount).toBe(3);
  });

  test('Card Compact: narrow viewport shows single column', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(storyUrl('components-card--compact'));

    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();

    // At compact tier, should be single column
    const grid = page.locator('[role="list"]');
    const gridCols = await grid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
    const colCount = gridCols.trim().split(/\s+/).length;
    expect(colCount).toBe(1);
  });

  test('KPI Default: wide viewport is visible', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(storyUrl('components-kpi--default'));

    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();
    // Verify it has metric groups
    const groups = page.locator('[role="group"]');
    await expect(groups).toHaveCount(3);
  });

  test('KPI Compact: narrow viewport is visible', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(storyUrl('components-kpi--compact'));

    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();
  });

  test('Table Compact: narrow viewport has overflow wrapper', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(storyUrl('components-table--compact'));

    const overflowWrapper = page.locator('div[style*="overflow"]');
    await expect(overflowWrapper).toBeVisible();
  });
});
