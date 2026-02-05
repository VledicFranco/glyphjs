import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Table doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('table'));
    await waitForAllPreviews(page, 2);
  });

  test('preview renders without error and has valid dimensions', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await assertPreviewRendered(preview);
  });

  test('contains a table with headers and data rows', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const table = preview.locator('table, [role="grid"]');
    await expect(table).toBeVisible();

    // Verify column headers
    await expect(preview).toContainText('Employee');
    await expect(preview).toContainText('Role');
    await expect(preview).toContainText('Salary (USD)');

    // Verify data rows
    await expect(preview).toContainText('Alice');
    await expect(preview).toContainText('Bob');
    await expect(preview).toContainText('Carol');
    await expect(preview).toContainText('Dave');
  });
});
