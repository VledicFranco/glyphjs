import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Annotate docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('annotate'));
    await waitForAllPreviews(page, 3);
  });

  test('loads annotate documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Annotate');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default preview shows text and annotations sidebar', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Code Review');
    await expect(preview).toContainText('processData');
    await expect(preview).toContainText('Annotations');
  });
});
