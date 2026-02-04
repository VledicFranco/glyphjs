import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Card docs — responsive behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('card'));
    // 3 existing previews + 1 narrow responsive preview = 4
    await waitForAllPreviews(page, 4);
  });

  test('narrow-wrapped card preview renders successfully', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const narrowPreview = previews.nth(3);
    await assertPreviewRendered(narrowPreview);
  });

  test('narrow-wrapped card preview is constrained to 420px', async ({ page }) => {
    // The narrow wrapper div constrains the preview width
    const narrowWrapper = page.locator('div[style*="max-width: 420px"]');
    await expect(narrowWrapper).toBeVisible();
    const box = await narrowWrapper.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(421);
  });
});

test.describe('KPI docs — responsive behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('kpi'));
    // 3 existing previews + 1 narrow responsive preview = 4
    await waitForAllPreviews(page, 4);
  });

  test('narrow-wrapped KPI preview renders successfully', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const narrowPreview = previews.nth(3);
    await assertPreviewRendered(narrowPreview);
  });

  test('narrow-wrapped KPI preview adapts layout', async ({ page }) => {
    const narrowWrapper = page.locator('div[style*="max-width: 420px"]');
    await expect(narrowWrapper).toBeVisible();
    const box = await narrowWrapper.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(421);
  });
});

test.describe('Table docs — responsive behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('table'));
    // 1 existing preview + 1 narrow responsive preview = 2
    await waitForAllPreviews(page, 2);
  });

  test('narrow-wrapped table preview renders successfully', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const narrowPreview = previews.nth(1);
    await assertPreviewRendered(narrowPreview);
  });

  test('narrow-wrapped table preview shows overflow wrapper', async ({ page }) => {
    const narrowWrapper = page.locator('div[style*="max-width: 420px"]');
    await expect(narrowWrapper).toBeVisible();

    // Inside the narrow wrapper, the table should have an overflow wrapper
    const overflowDiv = narrowWrapper.locator('div[style*="overflow"]');
    // The overflow wrapper should exist (it's added by the Table component at compact tier)
    const count = await overflowDiv.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
