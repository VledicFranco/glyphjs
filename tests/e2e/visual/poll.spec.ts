import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Poll', () => {
  test('default story renders question and options', async ({ page }) => {
    await page.goto(storyUrl('components-poll--default'));
    await expect(page.locator('text=Which framework do you prefer?')).toBeVisible();
    await expect(page.locator('text=React')).toBeVisible();
    await expect(page.locator('text=Vue')).toBeVisible();
    await expect(page.locator('text=Angular')).toBeVisible();
    await expect(page.locator('text=Svelte')).toBeVisible();
  });

  test('options render as radio inputs for single-choice poll', async ({ page }) => {
    await page.goto(storyUrl('components-poll--default'));
    const radios = page.locator('input[type="radio"]');
    await expect(radios).toHaveCount(4);
  });

  test('vote button is present and initially disabled with no selection', async ({ page }) => {
    await page.goto(storyUrl('components-poll--default'));
    const voteButton = page.locator('button', { hasText: 'Vote' });
    await expect(voteButton).toBeVisible();
    await expect(voteButton).toBeDisabled();
  });

  test('selecting an option enables the vote button', async ({ page }) => {
    await page.goto(storyUrl('components-poll--default'));
    await page.locator('input[type="radio"]').first().click();
    const voteButton = page.locator('button', { hasText: 'Vote' });
    await expect(voteButton).not.toBeDisabled();
  });

  test('voting submits and shows results', async ({ page }) => {
    await page.goto(storyUrl('components-poll--default'));
    await page.locator('input[type="radio"]').first().click();
    await page.locator('button', { hasText: 'Vote' }).click();
    // Results section appears
    await expect(page.locator('role=status')).toBeVisible();
    // Progress bars appear (one per option; use .first() to avoid strict-mode)
    await expect(page.locator('[role="progressbar"]').first()).toBeVisible();
  });

  test('multiple selection story uses checkboxes', async ({ page }) => {
    await page.goto(storyUrl('components-poll--multiple-selection'));
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(5);
    await expect(page.locator('text=TypeScript')).toBeVisible();
  });

  test('no results story hides progress bars after voting', async ({ page }) => {
    await page.goto(storyUrl('components-poll--no-results'));
    await page.locator('input[type="radio"]').first().click();
    await page.locator('button', { hasText: 'Vote' }).click();
    // Vote button disappears
    await expect(page.locator('button', { hasText: 'Vote' })).not.toBeVisible();
    // But results section should not be shown (showResults: false)
    await expect(page.locator('role=progressbar')).not.toBeVisible();
  });

  test('results show correct vote count after voting', async ({ page }) => {
    await page.goto(storyUrl('components-poll--default'));
    await page.locator('input[type="radio"]').first().click();
    await page.locator('button', { hasText: 'Vote' }).click();
    await expect(page.locator('text=1 vote')).toBeVisible();
  });
});
