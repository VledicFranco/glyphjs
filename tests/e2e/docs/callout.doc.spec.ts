import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Callout doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('callout'));
    await waitForAllPreviews(page, 4);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('warning callout contains role="note" and variant text', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const callout = preview.locator('[role="note"]');
    await expect(callout).toBeVisible();
    await expect(preview).toContainText('Breaking change in v2');
  });

  test('info callout (no title) renders correctly', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    const callout = preview.locator('[role="note"]');
    await expect(callout).toBeVisible();
    await expect(preview).toContainText('Glyph JS validates all YAML payloads');
  });

  test('tip callout renders correctly', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    const callout = preview.locator('[role="note"]');
    await expect(callout).toBeVisible();
    await expect(preview).toContainText('LLM authoring');
  });

  test('error callout renders correctly', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(3);
    const callout = preview.locator('[role="note"]');
    await expect(callout).toBeVisible();
    await expect(preview).toContainText('Validation failed');
  });

  test('callout previews match screenshots', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await expect(previews.nth(i)).toHaveScreenshot(`callout-preview-${i}.png`);
    }
  });
});
