import { test, expect } from '@playwright/test';
import {
  docsComponentUrl,
  getPreviewContainers,
  waitForAllPreviews,
  assertPreviewRendered,
} from './setup';

test.describe('Timeline doc page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(docsComponentUrl('timeline'));
    await waitForAllPreviews(page, 2);
  });

  test('each preview renders without error and has valid dimensions', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await assertPreviewRendered(previews.nth(i));
    }
  });

  test('vertical timeline contains event titles', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    await expect(preview).toContainText('Project kickoff');
    await expect(preview).toContainText('Parser v0.1');
    await expect(preview).toContainText('Compiler v0.1');
    await expect(preview).toContainText('Runtime v0.1');
    await expect(preview).toContainText('Public beta');
  });

  test('vertical timeline has sufficient height', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(0);
    const box = await preview.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(200);
  });

  test('horizontal timeline contains event titles', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    await expect(preview).toContainText('Alpha');
    await expect(preview).toContainText('Beta');
    await expect(preview).toContainText('GA');
  });

  test('horizontal timeline has sufficient height', async ({ page }) => {
    const preview = getPreviewContainers(page).nth(1);
    const box = await preview.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(200);
  });

  test('timeline previews match screenshots', async ({ page }) => {
    const previews = getPreviewContainers(page);
    const count = await previews.count();

    for (let i = 0; i < count; i++) {
      await expect(previews.nth(i)).toHaveScreenshot(`timeline-preview-${i}.png`);
    }
  });
});
