import { test, expect } from '@playwright/test';

/**
 * Determinism E2E tests -- verify that the same markdown input
 * produces identical DOM output on repeated compilations.
 */

test.describe('Determinism', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Glyph JS Demo')).toBeVisible();
  });

  /** Extract the innerHTML of the preview pane for comparison. */
  async function getPreviewHTML(page: import('@playwright/test').Page): Promise<string> {
    // Wait for debounce + render to settle
    await page.waitForTimeout(800);

    // The preview pane is the second major column in the split layout.
    // It follows the "Rendered Output" label.
    const previewPane = page.locator('text=Rendered Output').locator('..');
    return previewPane.innerHTML();
  }

  test('same markdown produces identical DOM structure', async ({ page }) => {
    const textarea = page.locator('textarea');

    const markdown = [
      '# Determinism Test',
      '',
      'A paragraph with **bold** and *italic*.',
      '',
      '- item one',
      '- item two',
      '',
      '> A blockquote.',
    ].join('\n');

    // First render
    await textarea.fill(markdown);
    const html1 = await getPreviewHTML(page);

    // Clear and re-enter the same markdown
    await textarea.fill('');
    await page.waitForTimeout(500);
    await textarea.fill(markdown);
    const html2 = await getPreviewHTML(page);

    expect(html1).toBe(html2);
  });

  test('same ui:callout markdown produces identical output', async ({ page }) => {
    const textarea = page.locator('textarea');

    const calloutMarkdown = [
      '```ui:callout',
      'type: info',
      'title: Determinism',
      'content: |',
      '  This should render identically every time.',
      '```',
    ].join('\n');

    // First render
    await textarea.fill(calloutMarkdown);
    const html1 = await getPreviewHTML(page);

    // Clear and re-enter
    await textarea.fill('');
    await page.waitForTimeout(500);
    await textarea.fill(calloutMarkdown);
    const html2 = await getPreviewHTML(page);

    expect(html1).toBe(html2);
  });

  test('switching preset away and back yields same output', async ({ page }) => {
    const select = page.locator('#preset-select');

    // Capture the initial render (simple preset)
    const html1 = await getPreviewHTML(page);

    // Switch to another preset and back
    await select.selectOption('callout');
    await page.waitForTimeout(500);
    await select.selectOption('simple');
    const html2 = await getPreviewHTML(page);

    expect(html1).toBe(html2);
  });
});
