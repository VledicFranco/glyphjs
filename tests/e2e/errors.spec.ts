import { test, expect } from '@playwright/test';

/**
 * Error-handling E2E tests -- verify that the diagnostics panel
 * surfaces errors for invalid YAML and unknown component types.
 */

test.describe('Error Diagnostics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Glyph JS Demo')).toBeVisible();
  });

  test('invalid YAML in a ui: block shows diagnostics', async ({ page }) => {
    const textarea = page.locator('textarea');

    // Provide a ui: block with broken YAML (unclosed bracket at top level)
    const invalidYaml = [
      '# Test',
      '',
      '```ui:callout',
      'type: [broken',
      'title: Bad YAML',
      '```',
    ].join('\n');

    await textarea.fill(invalidYaml);

    // Wait for debounce + compilation
    await page.waitForTimeout(1000);

    // The diagnostics panel should appear with at least one error or warning
    const diagnosticsPanel = page.locator('text=Diagnostics');
    await expect(diagnosticsPanel).toBeVisible({ timeout: 5000 });
  });

  test('unknown component type shows diagnostics', async ({ page }) => {
    const textarea = page.locator('textarea');

    const unknownComponent = ['# Test', '', '```ui:nonexistent', 'foo: bar', '```'].join('\n');

    await textarea.fill(unknownComponent);

    // Wait for debounce + compilation
    await page.waitForTimeout(1000);

    // The diagnostics panel should appear
    const diagnosticsPanel = page.locator('text=Diagnostics');
    await expect(diagnosticsPanel).toBeVisible({ timeout: 5000 });

    // Should contain a diagnostic about the unknown component
    const diagItems = page.locator('[style*="color"]').filter({ hasText: /ERROR|WARNING|INFO/ });
    await expect(diagItems.first()).toBeVisible();
  });

  test('fixing errors clears the diagnostics panel', async ({ page }) => {
    const textarea = page.locator('textarea');

    // First produce an error with an unknown component
    const badMarkdown = ['```ui:nonexistent', 'foo: bar', '```'].join('\n');

    await textarea.fill(badMarkdown);
    await page.waitForTimeout(1000);

    // Diagnostics should be visible
    const diagnosticsPanel = page.locator('text=Diagnostics');
    await expect(diagnosticsPanel).toBeVisible({ timeout: 5000 });

    // Now replace with valid markdown
    await textarea.fill('# Hello\n\nSimple paragraph.');
    await page.waitForTimeout(1000);

    // Diagnostics panel should disappear
    await expect(diagnosticsPanel).not.toBeVisible({ timeout: 5000 });
  });
});
