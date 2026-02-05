import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Ranker docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('ranker'));
    await waitForAllPreviews(page, 2);
  });

  test('loads ranker documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Ranker');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default preview shows ranked items', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Rank by importance');
    await expect(preview).toContainText('Authentication');
  });
});
