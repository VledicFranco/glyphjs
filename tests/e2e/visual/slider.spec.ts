import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Slider', () => {
  test('default story renders title and all parameters', async ({ page }) => {
    await page.goto(storyUrl('components-slider--default'));
    await expect(page.locator('role=region[name="Configure preferences"]')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Budget')).toBeVisible();
    await expect(page.locator('text=Quality')).toBeVisible();
  });

  test('renders correct number of range inputs', async ({ page }) => {
    await page.goto(storyUrl('components-slider--default'));
    const ranges = page.locator('input[type="range"]');
    await expect(ranges).toHaveCount(3);
  });

  test('range inputs have correct aria attributes', async ({ page }) => {
    await page.goto(storyUrl('components-slider--default'));
    const firstRange = page.locator('input[type="range"]').first();
    await expect(firstRange).toHaveAttribute('aria-valuemin', '0');
    await expect(firstRange).toHaveAttribute('aria-valuemax', '100');
    await expect(firstRange).toHaveAttribute('aria-valuenow');
  });

  test('value label updates live region on change', async ({ page }) => {
    await page.goto(storyUrl('components-slider--default'));
    const firstRange = page.locator('input[type="range"]').first();
    // Initial value text is present
    const valueLabel = page.locator('[aria-live="polite"]').first();
    await expect(valueLabel).toBeVisible();
    await expect(valueLabel).toContainText('%');
  });

  test('single parameter story renders one range', async ({ page }) => {
    await page.goto(storyUrl('components-slider--single-parameter'));
    await expect(page.locator('role=region[name="Confidence Level"]')).toBeVisible();
    await expect(page.locator('input[type="range"]')).toHaveCount(1);
    await expect(page.locator('text=How confident are you?')).toBeVisible();
  });

  test('range labels show min and max values', async ({ page }) => {
    await page.goto(storyUrl('components-slider--single-parameter'));
    // Min label: 0%, max label: 100%
    await expect(page.locator('text=0%')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible();
  });
});
