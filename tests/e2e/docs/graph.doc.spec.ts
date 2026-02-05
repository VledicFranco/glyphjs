import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Graph doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('graph'));
    await waitForAllPreviews(page, 2);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('DAG preview contains svg with role="img"', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });

  test('DAG preview contains expected node labels', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('API Gateway');
    await expect(preview).toContainText('Auth Service');
    await expect(preview).toContainText('PostgreSQL');
    await expect(preview).toContainText('Redis Cache');
  });

  test('mind map preview contains svg with role="img"', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });

  test('mind map preview contains expected node labels', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Glyph JS');
    await expect(preview).toContainText('Parser');
    await expect(preview).toContainText('Compiler');
    await expect(preview).toContainText('Runtime');
  });
});
