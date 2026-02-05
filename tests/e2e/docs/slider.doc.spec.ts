import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Slider docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('slider'));
    await waitForAllPreviews(page, 2);
  });

  test('loads slider documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Slider');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default preview shows parameters', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Configure preferences');
    await expect(preview).toContainText('Performance');
  });
});
