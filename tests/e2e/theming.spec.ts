import { test, expect } from '@playwright/test';

/**
 * Theming E2E tests -- verify that toggling the theme button
 * produces a visible change in the application appearance.
 */

test.describe('Theming', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Glyph JS Demo')).toBeVisible();
  });

  test('toggle theme button changes background color', async ({ page }) => {
    // The outermost app container is the first child div
    const appContainer = page.locator('body > div > div').first();

    // Capture the initial background color (light theme)
    const initialBg = await appContainer.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Click the theme toggle button
    const themeButton = page.locator('button', { hasText: /Theme/ });
    await themeButton.click();

    // Wait briefly for re-render
    await page.waitForTimeout(300);

    // Background color should have changed
    const updatedBg = await appContainer.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    expect(updatedBg).not.toBe(initialBg);
  });

  test('theme toggle button text switches between Light and Dark', async ({ page }) => {
    // Initially the button should say "Dark Theme" (we start in light mode)
    const themeButton = page.locator('button', { hasText: /Theme/ });
    await expect(themeButton).toContainText('Dark');

    // Click to toggle
    await themeButton.click();

    // Now it should say "Light Theme"
    await expect(themeButton).toContainText('Light');

    // Click again to toggle back
    await themeButton.click();

    // Should revert to "Dark Theme"
    await expect(themeButton).toContainText('Dark');
  });

  test('textarea background color changes with theme', async ({ page }) => {
    const textarea = page.locator('textarea');

    const lightBg = await textarea.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Toggle to dark theme
    const themeButton = page.locator('button', { hasText: /Theme/ });
    await themeButton.click();
    await page.waitForTimeout(300);

    const darkBg = await textarea.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    expect(darkBg).not.toBe(lightBg);
  });
});
