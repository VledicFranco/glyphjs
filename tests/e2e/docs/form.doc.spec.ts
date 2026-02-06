import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Form docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('form'));
    await waitForAllPreviews(page, 4);
  });

  test('loads form documentation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Form');
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('default preview shows form fields', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Project Setup');
    await expect(preview).toContainText('Project Name');
    await expect(preview).toContainText('Create Project');
  });
});
