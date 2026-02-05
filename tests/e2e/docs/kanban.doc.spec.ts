import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Kanban docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('kanban'));
    await waitForAllPreviews(page, 2);
  });

  test('loads kanban documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Kanban');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default preview shows columns and cards', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Sprint Board');
    await expect(preview).toContainText('To Do');
    await expect(preview).toContainText('Implement Auth');
  });
});
