import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Matrix', () => {
  test('default story renders title and grid', async ({ page }) => {
    await page.goto(storyUrl('components-matrix--default'));
    await expect(page.locator('role=region[name="Framework Evaluation"]')).toBeVisible();
    await expect(page.locator('role=grid')).toBeVisible();
  });

  test('column headers are visible', async ({ page }) => {
    await page.goto(storyUrl('components-matrix--default'));
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=DX')).toBeVisible();
    await expect(page.locator('text=Ecosystem')).toBeVisible();
  });

  test('row labels are visible', async ({ page }) => {
    await page.goto(storyUrl('components-matrix--default'));
    await expect(page.locator('text=React')).toBeVisible();
    await expect(page.locator('text=Vue')).toBeVisible();
    await expect(page.locator('text=Svelte')).toBeVisible();
  });

  test('score inputs are present and interactive', async ({ page }) => {
    await page.goto(storyUrl('components-matrix--default'));
    // Wait for the grid to be fully rendered before counting
    await page.locator('role=grid').waitFor();
    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
    const count = await inputs.count();
    // 3 rows × 3 cols = 9 cells minimum
    expect(count).toBeGreaterThanOrEqual(9);
  });

  test('totals column renders when showTotals is enabled', async ({ page }) => {
    await page.goto(storyUrl('components-matrix--default'));
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('no totals story hides the totals column', async ({ page }) => {
    await page.goto(storyUrl('components-matrix--no-totals'));
    await expect(page.locator('text=Simple Scoring')).toBeVisible();
    await expect(page.locator('text=Option A')).toBeVisible();
    await expect(page.locator('text=Option B')).toBeVisible();
    await expect(page.locator('text=Total')).not.toBeVisible();
  });

  test('weight labels shown on column headers', async ({ page }) => {
    await page.goto(storyUrl('components-matrix--default'));
    // Weighted columns show their weight value
    await expect(page.locator('text=×2')).toBeVisible();
  });
});
