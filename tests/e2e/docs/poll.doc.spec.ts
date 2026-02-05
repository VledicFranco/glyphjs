import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Poll docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('poll'));
    await waitForAllPreviews(page, 3);
  });

  test('loads poll documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Poll');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default preview shows question and options', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Which framework do you prefer?');
    await expect(preview).toContainText('React');
    await expect(preview).toContainText('Svelte');
  });

  test('interactive preview allows voting', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const radio = preview.locator('input[type="radio"]').first();
    await radio.click();
    const voteButton = preview.locator('button', { hasText: 'Vote' });
    await voteButton.click();
    await expect(preview.locator('[role="progressbar"]').first()).toBeVisible();
  });
});
