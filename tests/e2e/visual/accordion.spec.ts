import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Accordion', () => {
  test('default story renders all sections', async ({ page }) => {
    await page.goto(storyUrl('components-accordion--default'));
    const details = page.locator('details');
    await expect(details).toHaveCount(3);
    await expect(page.locator('text=What is GlyphJS?')).toBeVisible();
    await expect(page.locator('text=How does theming work?')).toBeVisible();
    await expect(page.locator('text=Can I create custom components?')).toBeVisible();
  });

  test('default story has first section open', async ({ page }) => {
    await page.goto(storyUrl('components-accordion--default'));
    const firstDetails = page.locator('details').nth(0);
    await expect(firstDetails).toHaveAttribute('open', '');
  });

  test('single section story renders one section', async ({ page }) => {
    await page.goto(storyUrl('components-accordion--single-section'));
    const details = page.locator('details');
    await expect(details).toHaveCount(1);
    await expect(page.locator('text=Click to expand')).toBeVisible();
  });

  test('exclusive mode only allows one open section', async ({ page }) => {
    await page.goto(storyUrl('components-accordion--exclusive-mode'));
    const details = page.locator('details');
    await expect(details).toHaveCount(3);

    // First section should be open by default
    await expect(details.nth(0)).toHaveAttribute('open', '');

    // Click the second section
    await page.locator('summary', { hasText: 'Panel Two' }).click();
    await expect(details.nth(1)).toHaveAttribute('open', '');
    // First should close
    await expect(details.nth(0)).not.toHaveAttribute('open', '');
  });

  test('all open story has every section expanded', async ({ page }) => {
    await page.goto(storyUrl('components-accordion--all-open'));
    const details = page.locator('details');
    const count = await details.count();
    expect(count).toBe(3);
    for (let i = 0; i < count; i++) {
      await expect(details.nth(i)).toHaveAttribute('open', '');
    }
  });

  test('clicking a summary toggles the section', async ({ page }) => {
    await page.goto(storyUrl('components-accordion--default'));
    const secondDetails = page.locator('details').nth(1);
    await expect(secondDetails).not.toHaveAttribute('open', '');
    await page.locator('summary', { hasText: 'How does theming work?' }).click();
    await expect(secondDetails).toHaveAttribute('open', '');
  });

  test('region has correct aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-accordion--default'));
    const region = page.locator('[role="region"]');
    await expect(region).toHaveAttribute('aria-label', 'Frequently Asked Questions');
  });
});
