import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Matrix docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('matrix'));
    await waitForAllPreviews(page, 2);
  });

  test('loads matrix documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Matrix');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default preview shows grid with columns and rows', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Framework Evaluation');
    await expect(preview).toContainText('Performance');
    await expect(preview).toContainText('React');
  });
});
