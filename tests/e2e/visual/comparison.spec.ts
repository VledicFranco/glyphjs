import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Comparison', () => {
  test('default story renders option headers and feature rows', async ({ page }) => {
    await page.goto(storyUrl('components-comparison--default'));
    await expect(page.locator('text=React')).toBeVisible();
    await expect(page.locator('text=Vue')).toBeVisible();
    await expect(page.locator('text=Svelte')).toBeVisible();
    await expect(page.locator('text=Learning curve')).toBeVisible();
    await expect(page.locator('text=SSR built-in')).toBeVisible();
  });

  test('two options story renders a table with two columns', async ({ page }) => {
    await page.goto(storyUrl('components-comparison--two-options'));
    await expect(page.locator('[role="region"]')).toBeVisible();
    // Check that the grid has 2 option column headers (plus Feature header = 3 total)
    const colHeaders = page.locator('th[scope="col"]');
    await expect(colHeaders).toHaveCount(3);
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();
  });

  test('max options story renders six option columns', async ({ page }) => {
    await page.goto(storyUrl('components-comparison--max-options'));
    const colHeaders = page.locator('th[scope="col"]');
    // 1 Feature header + 6 option headers = 7
    await expect(colHeaders).toHaveCount(7);
  });

  test('custom text values display as plain text', async ({ page }) => {
    await page.goto(storyUrl('components-comparison--custom-text-values'));
    await expect(page.locator('text=1 GB')).toBeVisible();
    await expect(page.locator('text=100 GB')).toBeVisible();
    await expect(page.locator('text=Community')).toBeVisible();
  });

  test('region has correct aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-comparison--default'));
    const region = page.locator('[role="region"]');
    await expect(region).toHaveAttribute('aria-label', 'Frontend Frameworks');
  });

  test('grid uses proper table headers', async ({ page }) => {
    await page.goto(storyUrl('components-comparison--default'));
    const rowHeaders = page.locator('th[scope="row"]');
    await expect(rowHeaders).toHaveCount(5);
  });
});
