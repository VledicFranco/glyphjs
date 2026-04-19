import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Gauge doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('gauge'));
    await waitForAllPreviews(page, 3);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();
    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('CSAT preview exposes meter semantics', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const meter = preview.locator('[role="meter"]');
    await expect(meter).toHaveAttribute('aria-valuemin', '0');
    await expect(meter).toHaveAttribute('aria-valuemax', '100');
    await expect(meter).toHaveAttribute('aria-valuenow', '78');
    await expect(preview).toContainText('Customer satisfaction');
  });

  test('full-dial preview renders engine RPM gauge', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    const meter = preview.locator('[role="meter"]');
    await expect(meter).toHaveAttribute('aria-valuenow', '4200');
    await expect(preview).toContainText('Engine RPM');
  });

  test('confidence preview uses a 0-1 scale', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    const meter = preview.locator('[role="meter"]');
    await expect(meter).toHaveAttribute('aria-valuemin', '0');
    await expect(meter).toHaveAttribute('aria-valuemax', '1');
    await expect(meter).toHaveAttribute('aria-valuenow', '0.82');
  });
});
