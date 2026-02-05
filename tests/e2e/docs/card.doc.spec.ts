import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Card docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('card'));
    await waitForAllPreviews(page, 4);
  });

  test('loads card documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Card');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default card preview shows getting started cards', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Getting Started');
    await expect(preview).toContainText('Installation');
  });

  test('outlined preview shows features', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Features');
    await expect(preview).toContainText('Markdown Parsing');
  });

  test('elevated preview shows popular packages', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    await expect(preview).toContainText('Popular Packages');
  });
});
