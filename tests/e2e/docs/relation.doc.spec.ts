import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Relation doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('relation'));
    await waitForAllPreviews(page, 1);
  });

  test('preview renders without error and has valid dimensions', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await assertPreviewRendered(preview);
  });

  test('contains svg with role="img"', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });

  test('contains entity labels', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Users');
    await expect(preview).toContainText('Posts');
    await expect(preview).toContainText('Comments');
  });

  test('relation preview matches screenshot', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toHaveScreenshot('relation-preview-0.png');
  });
});
