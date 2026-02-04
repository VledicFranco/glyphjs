import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Accordion doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('accordion'));
    await waitForAllPreviews(page, 3);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default accordion preview shows FAQ sections', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Frequently Asked Questions');
    await expect(preview).toContainText('What is GlyphJS?');
    const details = preview.locator('details');
    await expect(details).toHaveCount(3);
  });

  test('exclusive mode preview shows API reference', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('API Reference');
    await expect(preview).toContainText('compile(source)');
  });

  test('collapsed preview shows three sections all closed', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    await expect(preview).toContainText('Getting Started');
    await expect(preview).toContainText('Writing Markdown');
    await expect(preview).toContainText('Deploying');
  });

  test('accordion previews match screenshots', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await expect(previews.nth(i)).toHaveScreenshot(`accordion-preview-${i}.png`);
    }
  });
});
