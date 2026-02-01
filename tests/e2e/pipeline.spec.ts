import { test, expect } from '@playwright/test';

/**
 * Pipeline E2E tests -- verify the full compile-and-render pipeline
 * running against the demo app at http://localhost:5173.
 */

test.describe('Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app shell to be visible
    await expect(page.locator('text=Glyph JS Demo')).toBeVisible();
  });

  test('heading and paragraph markdown renders output', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('# Hello World\n\nThis is a paragraph.');

    // Allow debounce + render
    const preview = page.locator('text=Rendered Output').locator('..');

    // Verify heading renders
    await expect(preview.locator('h1')).toContainText('Hello World');
    // Verify paragraph renders
    await expect(preview.locator('p').filter({ hasText: 'This is a paragraph.' })).toBeVisible();
  });

  test('ui:callout block renders a callout component', async ({ page }) => {
    const textarea = page.locator('textarea');
    const calloutMarkdown = [
      '# Test',
      '',
      '```ui:callout',
      'type: info',
      'title: Test Callout',
      'content: |',
      '  This is a test callout.',
      '```',
    ].join('\n');

    await textarea.fill(calloutMarkdown);

    // The callout should appear in the preview pane
    const preview = page.locator('text=Rendered Output').locator('..');
    await expect(preview.locator('[role="note"]')).toBeVisible({ timeout: 5000 });
    await expect(preview.locator('[role="note"]')).toContainText('Test Callout');
  });

  test('empty input renders without error', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('');

    // The app should not crash -- the placeholder text should appear
    await expect(
      page.locator('text=Type some markdown to see the preview...')
    ).toBeVisible({ timeout: 5000 });

    // No error indicators should be present in the toolbar
    const errorSpan = page.locator('text=/\\d+ error/');
    await expect(errorSpan).toHaveCount(0);
  });
});
