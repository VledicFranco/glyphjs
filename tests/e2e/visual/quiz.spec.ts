import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Quiz component', () => {
  test('renders in storybook', async ({ page }) => {
    await page.goto(storyUrl('components-quiz--default'));
    const component = page.locator('[role="region"]');
    await expect(component).toBeVisible();
  });

  test('default story renders all question types', async ({ page }) => {
    await page.goto(storyUrl('components-quiz--default'));
    const groups = page.locator('[role="group"]');
    await expect(groups).toHaveCount(3);
  });

  test('single question story renders one question', async ({ page }) => {
    await page.goto(storyUrl('components-quiz--single-question'));
    const groups = page.locator('[role="group"]');
    await expect(groups).toHaveCount(1);
  });

  test('true-false story renders radio buttons', async ({ page }) => {
    await page.goto(storyUrl('components-quiz--true-false'));
    await expect(page.locator('[role="region"]')).toBeVisible();
    const radios = page.locator('input[type="radio"]');
    await expect(radios.first()).toBeVisible();
    const count = await radios.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('multi-select story renders checkboxes', async ({ page }) => {
    await page.goto(storyUrl('components-quiz--multi-select'));
    await expect(page.locator('[role="region"]')).toBeVisible();
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
    const count = await checkboxes.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('submitting an answer shows feedback', async ({ page }) => {
    await page.goto(storyUrl('components-quiz--single-question'));
    const firstRadio = page.locator('input[type="radio"]').first();
    await firstRadio.click();
    await page.locator('button', { hasText: 'Submit' }).click();
    const feedback = page.locator('[aria-live="polite"]').first();
    await expect(feedback).toBeVisible();
  });

  test('region has correct aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-quiz--default'));
    const region = page.locator('[role="region"]');
    await expect(region).toHaveAttribute('aria-label', 'JavaScript Fundamentals');
  });
});
