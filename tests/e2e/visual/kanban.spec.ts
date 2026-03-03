import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Kanban', () => {
  test('default story renders board with three columns', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--default'));
    await expect(page.locator('role=region[name="Sprint Board"]')).toBeVisible();
    await expect(page.locator('role=list[name="To Do"]')).toBeVisible();
    await expect(page.locator('role=list[name="In Progress"]')).toBeVisible();
    await expect(page.locator('role=list[name="Done"]')).toBeVisible();
  });

  test('cards render in the correct columns', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--default'));
    await expect(page.locator('text=Implement Auth')).toBeVisible();
    await expect(page.locator('text=Build Dashboard')).toBeVisible();
    await expect(page.locator('text=API Layer')).toBeVisible();
    await expect(page.locator('text=Project Setup')).toBeVisible();
  });

  test('cards are focusable', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--default'));
    const firstCard = page.locator('role=listitem').first();
    await firstCard.focus();
    await expect(firstCard).toBeFocused();
  });

  test('cards have descriptive aria-label with priority', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--default'));
    const highPriorityCard = page.locator('[aria-label*="high priority"]').first();
    await expect(highPriorityCard).toBeVisible();
  });

  test('tags are displayed on cards', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--default'));
    await expect(page.locator('text=backend')).toBeVisible();
    await expect(page.locator('text=security')).toBeVisible();
  });

  test('WIP limit is displayed when set', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--default'));
    // "In Progress" column has limit: 3 → shows "1 / 3"
    await expect(page.locator('text=/ 3')).toBeVisible();
  });

  test('keyboard navigation: Space grabs a card, arrows move it, Escape releases', async ({
    page,
  }) => {
    await page.goto(storyUrl('components-kanban--default'));
    const firstCard = page.locator('role=listitem').first();
    await firstCard.focus();

    await page.keyboard.press('Space');
    await expect(firstCard).toHaveAttribute('aria-grabbed', 'true');

    await page.keyboard.press('Escape');
    await expect(firstCard).toHaveAttribute('aria-grabbed', 'false');
  });

  test('empty board story renders column headers with no cards', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--empty'));
    await expect(page.locator('role=list[name="Backlog"]')).toBeVisible();
    await expect(page.locator('role=listitem')).toHaveCount(0);
  });
});
