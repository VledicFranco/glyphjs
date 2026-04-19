import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Funnel', () => {
  test('default vertical story renders with all stages and conversion annotations', async ({
    page,
  }) => {
    await page.goto(storyUrl('components-funnel--default'));

    // Region with aria-label derived from the title
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute('aria-label', 'Action acceptance (last 30 days)');

    // Four stages
    const stages = page.locator('li');
    await expect(stages).toHaveCount(4);

    // Labels appear inside the SVG
    await expect(page.locator('text=Recommended').first()).toBeVisible();
    await expect(page.locator('text=Reviewed').first()).toBeVisible();
    await expect(page.locator('text=Accepted').first()).toBeVisible();
    await expect(page.locator('text=Executed').first()).toBeVisible();

    // Conversion rate between stages 1→2 is 74%
    await expect(page.locator('text=74%').first()).toBeVisible();
  });

  test('horizontal story renders in horizontal orientation', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--horizontal'));
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute('aria-label', 'Signup funnel');

    const stages = page.locator('li');
    await expect(stages).toHaveCount(4);
    await expect(page.locator('text=Visited').first()).toBeVisible();
  });

  test('with-descriptions story renders four stages', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--with-descriptions'));
    const stages = page.locator('li');
    await expect(stages).toHaveCount(4);
    await expect(page.locator('text=Multi-step form completion')).toBeVisible();
  });

  test('no-conversion story hides conversion annotations', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--no-conversion'));
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();

    // No percentage texts should be present inside the SVG
    const texts = page.locator('text');
    const count = await texts.count();
    for (let i = 0; i < count; i++) {
      const content = await texts.nth(i).textContent();
      expect(content).not.toMatch(/%$/);
    }
  });

  test('deep-funnel story renders 8 stages', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--deep-funnel'));
    const stages = page.locator('li');
    await expect(stages).toHaveCount(8);
    await expect(page.locator('text=Impressions').first()).toBeVisible();
    await expect(page.locator('text=Retained (30d)').first()).toBeVisible();
  });

  test('conversion annotations are hidden from assistive technology', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--default'));
    // Annotation <g> elements have aria-hidden="true"
    const hiddenGroups = page.locator('g[aria-hidden="true"]');
    const count = await hiddenGroups.count();
    expect(count).toBeGreaterThanOrEqual(3); // 3 gaps between 4 stages
  });
});
