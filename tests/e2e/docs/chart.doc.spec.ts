import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Chart doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('chart'));
    await waitForAllPreviews(page, 3);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('line chart preview contains svg with role="img"', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });

  test('line chart preview contains axis labels', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Month');
    await expect(preview).toContainText('Amount (USD)');
  });

  test('bar chart preview contains svg with role="img"', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });

  test('bar chart preview contains axis labels', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Package');
    await expect(preview).toContainText('Weekly Downloads');
  });
});
