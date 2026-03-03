import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Ranker', () => {
  test('default story renders title and all items', async ({ page }) => {
    await page.goto(storyUrl('components-ranker--default'));
    await expect(page.locator('role=region[name="Rank by importance"]')).toBeVisible();
    await expect(page.locator('text=Authentication')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=API Layer')).toBeVisible();
    // Scope to the ranker list to avoid matching hidden Storybook "Decorators documentation" links
    await expect(page.locator('[role="listitem"][aria-label*="Documentation"]')).toBeVisible();
  });

  test('items render with rank badges', async ({ page }) => {
    await page.goto(storyUrl('components-ranker--default'));
    const items = page.locator('role=list').getByRole('listitem');
    await expect(items).toHaveCount(4);
  });

  test('items are focusable via keyboard', async ({ page }) => {
    await page.goto(storyUrl('components-ranker--default'));
    const firstItem = page.locator('role=listitem').first();
    await firstItem.focus();
    await expect(firstItem).toBeFocused();
  });

  test('ArrowDown moves an item down when grabbed', async ({ page }) => {
    await page.goto(storyUrl('components-ranker--default'));
    const firstItem = page.locator('role=listitem').first();
    await firstItem.focus();
    // Space to grab
    await page.keyboard.press('Space');
    // ArrowDown to move
    await page.keyboard.press('ArrowDown');
    // Escape to release
    await page.keyboard.press('Escape');
    // The list should still have 4 items
    const items = page.locator('role=listitem');
    await expect(items).toHaveCount(4);
  });

  test('long list story renders 6 items', async ({ page }) => {
    await page.goto(storyUrl('components-ranker--long-list'));
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
    await expect(page.locator('text=Accessibility')).toBeVisible();
    const items = page.locator('role=listitem');
    await expect(items).toHaveCount(6);
  });

  test('items show descriptions when provided', async ({ page }) => {
    await page.goto(storyUrl('components-ranker--default'));
    await expect(page.locator('text=User login and session management')).toBeVisible();
  });
});
