import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('CodeDiff doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('codediff'));
    await waitForAllPreviews(page, 3);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default diff preview shows code changes', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Before');
    await expect(preview).toContainText('After');
    const grid = preview.locator('[role="grid"]');
    await expect(grid).toBeVisible();
  });

  test('additions preview shows config changes', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('port');
  });

  test('migration preview shows package.json diff', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    await expect(preview).toContainText('package.json');
  });
});
