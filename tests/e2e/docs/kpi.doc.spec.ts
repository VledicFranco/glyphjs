import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('KPI doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('kpi'));
    await waitForAllPreviews(page, 3);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default KPI preview shows metric cards', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Revenue');
    await expect(preview).toContainText('$2.3M');
    const groups = preview.locator('[role="group"]');
    await expect(groups).toHaveCount(4);
  });

  test('single metric preview renders one card', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Total Revenue');
    await expect(preview).toContainText('$12.5M');
  });

  test('system snapshot preview renders four cards without deltas', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    await expect(preview).toContainText('System Status');
    await expect(preview).toContainText('CPU');
    await expect(preview).toContainText('72%');
  });

  test('KPI previews match screenshots', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await expect(previews.nth(i)).toHaveScreenshot(`kpi-preview-${i}.png`);
    }
  });
});
