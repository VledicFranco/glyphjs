import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Steps doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('steps'));
    await waitForAllPreviews(page, 1);
  });

  test('preview renders without error and has valid dimensions', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await assertPreviewRendered(preview);
  });

  test('contains an ordered list with 3 step items', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const ol = preview.locator('ol');
    await expect(ol).toBeVisible();

    const items = ol.locator('li');
    await expect(items).toHaveCount(3);
  });

  test('step titles are present', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Install dependencies');
    await expect(preview).toContainText('Configure the project');
    await expect(preview).toContainText('Build and deploy');
  });

  test('steps preview matches screenshot', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toHaveScreenshot('steps-preview-0.png');
  });
});
