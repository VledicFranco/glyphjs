import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Quiz docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('quiz'));
    await waitForAllPreviews(page, 3);
  });

  test('loads quiz documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Quiz');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default quiz preview shows title and questions', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('JavaScript Fundamentals');
    await expect(preview).toContainText('Which keyword declares a block-scoped variable?');
  });

  test('true-false preview shows True or False title', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('True or False');
  });

  test('no-score preview shows Practice Quiz', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    await expect(preview).toContainText('Practice Quiz');
  });
});
