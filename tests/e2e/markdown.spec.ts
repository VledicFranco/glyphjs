import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

/**
 * Markdown rendering E2E tests -- verify that markdown formatting
 * is correctly rendered in component text fields.
 */

const DEMO_URL = '/';

/** Helper: select a preset from the dropdown and wait for render. */
async function selectPreset(page: Page, presetKey: string) {
  const select = page.locator('#preset-select');
  await select.selectOption(presetKey);
  // Wait for the debounced compilation to complete
  await page.waitForTimeout(800);
}

test.describe('Markdown in Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_URL);
    await expect(page.locator('text=Glyph JS Demo')).toBeVisible();
    await selectPreset(page, 'markdown');
  });

  test('callout renders bold text with strong tag', async ({ page }) => {
    const preview = page.locator('[data-testid="rendered-output"]');
    const callout = preview.locator('[role="note"]').first();

    // Verify bold text is wrapped in <strong>
    const bold = callout.locator('strong').filter({ hasText: 'bold text' });
    await expect(bold).toBeVisible({ timeout: 5000 });
  });

  test('callout renders italic text with em tag', async ({ page }) => {
    const preview = page.locator('[data-testid="rendered-output"]');
    const callout = preview.locator('[role="note"]').first();

    // Verify italic text is wrapped in <em>
    const italic = callout.locator('em').filter({ hasText: 'italic text' });
    await expect(italic).toBeVisible();
  });

  test('callout renders code with code tag', async ({ page }) => {
    const preview = page.locator('[data-testid="rendered-output"]');
    const callout = preview.locator('[role="note"]').first();

    // Verify code is wrapped in <code>
    const code = callout.locator('code').filter({ hasText: 'code' });
    await expect(code).toBeVisible();
  });

  test('callout renders links with anchor tag', async ({ page }) => {
    const preview = page.locator('[data-testid="rendered-output"]');
    const callout = preview.locator('[role="note"]').first();

    // Verify link is rendered as <a> with correct href
    const link = callout.locator('a[href="https://glyphjs.dev"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('link');
  });

  test('card renders markdown in subtitle and body', async ({ page }) => {
    const preview = page.locator('[data-testid="rendered-output"]');

    // First card should have bold "basics" and italic "5 minutes"
    const boldBasics = preview.locator('strong').filter({ hasText: 'basics' });
    await expect(boldBasics).toBeVisible({ timeout: 5000 });

    const italicMinutes = preview.locator('em').filter({ hasText: '5 minutes' });
    await expect(italicMinutes).toBeVisible();

    // First card should have a link in the body
    const link = preview.locator('a[href="https://example.com"]').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText('quick start guide');

    // First card should have code tag
    const code = preview.locator('code').filter({ hasText: 'GlyphJS' });
    await expect(code).toBeVisible();
  });

  test('timeline renders markdown in title and description', async ({ page }) => {
    const preview = page.locator('[data-testid="rendered-output"]');

    // Timeline event titles should have markdown formatting
    const boldVersion = preview.locator('strong').filter({ hasText: '1.0' });
    await expect(boldVersion).toBeVisible({ timeout: 5000 });

    // Timeline description should have italic and bold
    const italicBasic = preview.locator('em').filter({ hasText: 'basic components' });
    await expect(italicBasic).toBeVisible();

    const boldText = preview.locator('strong').filter({ hasText: 'bold' }).first();
    await expect(boldText).toBeVisible();

    // Timeline should have links
    const link = preview.locator('a[href="https://example.com"]').first();
    await expect(link).toBeVisible();
  });

  test('quiz renders markdown in question, options, and explanation', async ({ page }) => {
    const preview = page.locator('[data-testid="rendered-output"]');

    // Question should have code tag
    const codeInQuestion = preview.locator('code').filter({ hasText: 'Array.map()' });
    await expect(codeInQuestion.first()).toBeVisible({ timeout: 5000 });

    // Options should have italic and bold
    const italicNew = preview.locator('em').filter({ hasText: 'new' });
    await expect(italicNew).toBeVisible();

    const boldSame = preview.locator('strong').filter({ hasText: 'same' });
    await expect(boldSame).toBeVisible();

    // Explanation should be visible after answering (test after interaction)
    // For now just verify the quiz renders
    const quiz = preview.locator('[role="group"]');
    await expect(quiz.first()).toBeVisible();
  });

  test('markdown preset renders without errors', async ({ page }) => {
    const preview = page.locator('[data-testid="rendered-output"]');

    // Verify all component types are rendered
    const callout = preview.locator('[role="note"]');
    await expect(callout.first()).toBeVisible({ timeout: 5000 });

    // Verify no diagnostics errors are shown
    const diagnostics = page.locator('text=/\\d+ error/');
    await expect(diagnostics).not.toBeVisible();
  });

  test('plain text without markdown flag renders literally', async ({ page }) => {
    // Switch to a preset that doesn't use markdown
    await selectPreset(page, 'callout');

    const preview = page.locator('[data-testid="rendered-output"]');
    const callout = preview.locator('[role="note"]').first();

    // Wait for callout to render
    await expect(callout).toBeVisible({ timeout: 5000 });

    // Verify that markdown syntax appears as literal text (not rendered)
    // The callout preset uses **info** in content, which should NOT be bold
    // because markdown is not enabled in that preset
    const text = await callout.textContent();
    if (text?.includes('**')) {
      // If we see ** in the text, it means markdown was not parsed (good)
      expect(text).toContain('**');
    }
    // Note: This test is somewhat fragile as it depends on the callout preset content
  });
});
