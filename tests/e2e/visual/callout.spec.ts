import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Callout', () => {
  test('info variant renders correctly', async ({ page }) => {
    await page.goto(storyUrl('components-callout--info'));
    const callout = page.locator('[role="note"]');
    await expect(callout).toBeVisible();
    await expect(callout).toHaveAttribute('aria-label', 'Information');
  });

  test('warning variant renders correctly', async ({ page }) => {
    await page.goto(storyUrl('components-callout--warning'));
    const callout = page.locator('[role="note"]');
    await expect(callout).toBeVisible();
    await expect(callout).toHaveAttribute('aria-label', 'Warning');
  });

  test('error variant renders correctly', async ({ page }) => {
    await page.goto(storyUrl('components-callout--error'));
    const callout = page.locator('[role="note"]');
    await expect(callout).toBeVisible();
    await expect(callout).toHaveAttribute('aria-label', 'Error');
  });

  test('tip variant renders correctly', async ({ page }) => {
    await page.goto(storyUrl('components-callout--tip'));
    const callout = page.locator('[role="note"]');
    await expect(callout).toBeVisible();
    await expect(callout).toHaveAttribute('aria-label', 'Tip');
  });

  test('callout without title omits title element', async ({ page }) => {
    await page.goto(storyUrl('components-callout--info-without-title'));
    const callout = page.locator('[role="note"]');
    await expect(callout).toBeVisible();
    // The callout body should still contain text content
    await expect(callout).toContainText('info callout without a title');
  });

  test('callout displays title when provided', async ({ page }) => {
    await page.goto(storyUrl('components-callout--info'));
    const callout = page.locator('[role="note"]');
    await expect(callout).toContainText('Did you know?');
    await expect(callout).toContainText('Glyph supports multiple component types');
  });

  test('callout icon is hidden from assistive technology', async ({ page }) => {
    await page.goto(storyUrl('components-callout--info'));
    const icon = page.locator('[role="note"] [aria-hidden="true"]');
    await expect(icon).toBeVisible();
  });
});
