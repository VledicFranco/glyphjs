import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Architecture doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('architecture'));
    await waitForAllPreviews(page, 2);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('simple preview contains svg with role="img"', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });

  test('simple preview contains expected node labels', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Web App');
    await expect(preview).toContainText('API Server');
    await expect(preview).toContainText('Database');
  });

  test('VPC preview contains svg with role="img"', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });

  test('VPC preview contains expected node labels', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Load Balancer');
    await expect(preview).toContainText('API Service');
    await expect(preview).toContainText('PostgreSQL');
    await expect(preview).toContainText('Redis');
  });

  test('architecture previews match screenshots', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await expect(previews.nth(i)).toHaveScreenshot(`architecture-preview-${i}.png`);
    }
  });
});
