import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('CodeDiff', () => {
  test('default story renders diff with labels', async ({ page }) => {
    await page.goto(storyUrl('components-codediff--default'));
    await expect(page.locator('text=Before')).toBeVisible();
    await expect(page.locator('text=After')).toBeVisible();
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();
  });

  test('additions only story shows added lines', async ({ page }) => {
    await page.goto(storyUrl('components-codediff--additions-only'));
    const addedRows = page.locator('tr[aria-label="added"]');
    const count = await addedRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deletions only story shows removed lines', async ({ page }) => {
    await page.goto(storyUrl('components-codediff--deletions-only'));
    const removedRows = page.locator('tr[aria-label="removed"]');
    const count = await removedRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('mixed changes story shows both added and removed', async ({ page }) => {
    await page.goto(storyUrl('components-codediff--mixed-changes'));
    const addedRows = page.locator('tr[aria-label="added"]');
    const removedRows = page.locator('tr[aria-label="removed"]');
    expect(await addedRows.count()).toBeGreaterThan(0);
    expect(await removedRows.count()).toBeGreaterThan(0);
  });

  test('region has diff summary in aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-codediff--default'));
    const region = page.locator('[role="region"]');
    const label = await region.getAttribute('aria-label');
    expect(label).toMatch(/Code diff:/);
  });

  test('gutter markers are visible', async ({ page }) => {
    await page.goto(storyUrl('components-codediff--additions-only'));
    await expect(page.locator('td:has-text("+")')).toHaveCount(2);
  });
});
