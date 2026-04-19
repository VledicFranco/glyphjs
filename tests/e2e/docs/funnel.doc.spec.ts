import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Funnel doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('funnel'));
    // 3 GlyphPreview instances: acceptance, signup, pipeline
    await waitForAllPreviews(page, 3);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();
    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('acceptance preview shows stage labels and conversion percentages', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Recommended');
    await expect(preview).toContainText('Executed');
    // 74% conversion Recommended → Reviewed
    await expect(preview).toContainText('74%');
  });

  test('signup preview renders horizontally with four stages', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Visited');
    await expect(preview).toContainText('Verified');
    const stages = preview.locator('li');
    await expect(stages).toHaveCount(4);
  });

  test('pipeline preview hides conversion when showConversion is false', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    await expect(preview).toContainText('Leads');
    await expect(preview).toContainText('Won');
    // Should not render a "50%" style conversion text inside this preview
    const innerText = (await preview.innerText()).toString();
    expect(/\b\d+%\b/.test(innerText)).toBe(false);
  });
});
