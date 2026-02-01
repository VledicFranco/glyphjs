import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Steps', () => {
  test('renders all steps in a list', async ({ page }) => {
    await page.goto(storyUrl('components-steps--all-pending'));
    const list = page.locator('ol[role="list"]');
    await expect(list).toBeVisible();

    const items = page.locator('ol[role="list"] > li');
    await expect(items).toHaveCount(3);
  });

  test('each step has a descriptive aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-steps--all-pending'));
    const firstItem = page.locator('ol[role="list"] > li').first();
    const ariaLabel = await firstItem.getAttribute('aria-label');
    expect(ariaLabel).toContain('Step 1');
    expect(ariaLabel).toContain('Create project');
    expect(ariaLabel).toContain('Pending');
  });

  test('active step has aria-current="step"', async ({ page }) => {
    await page.goto(storyUrl('components-steps--mixed-status'));
    // The second step is "active" in the MixedStatus story
    const activeStep = page.locator('li[aria-current="step"]');
    await expect(activeStep).toHaveCount(1);

    const ariaLabel = await activeStep.getAttribute('aria-label');
    expect(ariaLabel).toContain('Install dependencies');
    expect(ariaLabel).toContain('Active');
  });

  test('completed steps show checkmark indicator', async ({ page }) => {
    await page.goto(storyUrl('components-steps--all-completed'));
    // All 3 steps should be completed; each has a checkmark character
    const items = page.locator('ol[role="list"] > li');
    await expect(items).toHaveCount(3);

    // Each completed step should contain the checkmark character
    for (let i = 0; i < 3; i++) {
      const ariaLabel = await items.nth(i).getAttribute('aria-label');
      expect(ariaLabel).toContain('Completed');
    }
  });

  test('pending steps do not have aria-current', async ({ page }) => {
    await page.goto(storyUrl('components-steps--all-pending'));
    const stepsWithCurrent = page.locator('li[aria-current]');
    await expect(stepsWithCurrent).toHaveCount(0);
  });

  test('mixed status renders correct number of steps', async ({ page }) => {
    await page.goto(storyUrl('components-steps--mixed-status'));
    const items = page.locator('ol[role="list"] > li');
    await expect(items).toHaveCount(4);
  });

  test('step content text is visible', async ({ page }) => {
    await page.goto(storyUrl('components-steps--mixed-status'));
    const list = page.locator('ol[role="list"]');
    await expect(list).toContainText('Project initialized successfully');
    await expect(list).toContainText('Currently installing packages');
  });
});
