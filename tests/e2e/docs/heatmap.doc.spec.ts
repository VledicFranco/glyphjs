import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Heatmap docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('heatmap'));
    await waitForAllPreviews(page, 2);
  });

  test('loads heatmap documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Heatmap');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('first preview shows the sequential freshness grid', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Data freshness across leaders');
    await expect(preview).toContainText('Alice');
    await expect(preview).toContainText('Mongo');
  });

  test('second preview shows the diverging correlation grid', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Feature correlations');
    await expect(preview).toContainText('revenue');
  });
});
