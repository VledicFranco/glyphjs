import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Annotate', () => {
  test('default story renders title, text, and label legend', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    await expect(page.locator('text=Code Review')).toBeVisible();
    await expect(page.locator('text=Bug')).toBeVisible();
    await expect(page.locator('text=Unclear')).toBeVisible();
    await expect(page.locator('text=Good')).toBeVisible();
  });

  test('source text is displayed', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    await expect(page.locator('text=processData')).toBeVisible();
  });

  test('pre-existing annotation is highlighted in the text', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    // The annotation span should be present (eval() is annotated as Bug)
    await expect(page.locator('text=eval')).toBeVisible();
  });

  test('annotation note appears in the sidebar', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    await expect(page.locator('text=eval() is dangerous')).toBeVisible();
  });

  test('label picker shows all available labels', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    // All 3 labels should be visible in the UI
    await expect(page.locator('text=Bug')).toBeVisible();
    await expect(page.locator('text=Unclear')).toBeVisible();
    await expect(page.locator('text=Good')).toBeVisible();
  });

  test('prose text story renders document content', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--prose-text'));
    await expect(page.locator('text=Document Review')).toBeVisible();
    await expect(page.locator('text=shall process all incoming requests')).toBeVisible();
  });

  test('no annotations story renders text with no sidebar entries', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--no-annotations'));
    await expect(page.locator('text=Fresh Document')).toBeVisible();
    await expect(page.locator('text=Select any text')).toBeVisible();
    // Sidebar should be empty — no annotation notes visible
    await expect(page.locator('text=eval() is dangerous')).not.toBeVisible();
  });
});
