import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Tabs doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('tabs'));
    await waitForAllPreviews(page, 1);
  });

  test('preview renders without error and has valid dimensions', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await assertPreviewRendered(preview);
  });

  test('contains a tablist with 3 tabs', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const tablist = preview.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    const tabs = preview.locator('[role="tab"]');
    await expect(tabs).toHaveCount(3);
  });

  test('tab labels are correct', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Overview');
    await expect(preview).toContainText('Installation');
    await expect(preview).toContainText('Configuration');
  });

  test('tabs preview matches screenshot', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toHaveScreenshot('tabs-preview-0.png');
  });
});
