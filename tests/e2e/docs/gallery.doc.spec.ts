import { test, expect } from '@playwright/test';
import { docsUrl, getPreviewContainers, waitForAllPreviews, assertPreviewRendered } from './setup';

test.describe('Gallery doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsUrl('gallery'));
    await waitForAllPreviews(page, 8);
  });

  test('all previews render without error and have valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('technical documentation preview contains callout and steps', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Breaking Changes Ahead');
    await expect(preview).toContainText('Update Dependencies');
  });

  test('installation guides preview contains tabs', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('npm');
    await expect(preview).toContainText('pnpm');
    await expect(preview).toContainText('yarn');
  });

  test('data visualization preview contains chart and table', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(2);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
    await expect(preview).toContainText('Quarter');
  });

  test('architecture diagram preview contains graph', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(3);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
    await expect(preview).toContainText('API Gateway');
  });

  test('platform architecture preview contains architecture diagram', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(4);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
    await expect(preview).toContainText('API Gateway');
    await expect(preview).toContainText('PostgreSQL');
  });

  test('data model preview contains relation diagram', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(5);
    const svg = preview.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
    await expect(preview).toContainText('User');
    await expect(preview).toContainText('Post');
  });

  test('project timeline preview contains timeline', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(6);
    await expect(preview).toContainText('Alpha Release');
    await expect(preview).toContainText('Beta Release');
  });

  test('kitchen sink preview contains multiple components', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(7);
    // Callout
    await expect(preview).toContainText('Sprint Summary');
    // Table
    await expect(preview).toContainText('Bug');
    // Steps
    await expect(preview).toContainText('Review open bugs');
  });

  test('gallery previews match screenshots', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await expect(previews.nth(i)).toHaveScreenshot(`gallery-preview-${i}.png`);
    }
  });
});
