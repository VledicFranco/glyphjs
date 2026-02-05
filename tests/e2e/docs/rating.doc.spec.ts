import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Rating docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('rating'));
    await waitForAllPreviews(page, 3);
  });

  test('loads rating documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Rating');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default preview shows title and items', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Rate these features');
    await expect(preview).toContainText('Performance');
  });
});
