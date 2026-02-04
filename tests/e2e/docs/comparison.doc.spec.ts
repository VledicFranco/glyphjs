import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Comparison doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('comparison'));
    await waitForAllPreviews(page, 3);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default comparison shows framework options', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Frontend Frameworks');
    await expect(preview).toContainText('React');
    await expect(preview).toContainText('Vue');
    await expect(preview).toContainText('Svelte');
  });

  test('pricing comparison shows plan names', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Pricing Plans');
    await expect(preview).toContainText('Free');
    await expect(preview).toContainText('Pro');
  });

  test('two-option comparison shows SQL vs NoSQL', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    await expect(preview).toContainText('SQL vs NoSQL');
    await expect(preview).toContainText('ACID');
  });

  test('comparison previews match screenshots', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await expect(previews.nth(i)).toHaveScreenshot(`comparison-preview-${i}.png`);
    }
  });
});
