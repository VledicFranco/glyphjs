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

    // Four stages in the sr-only list (scope to the region to exclude Storybook's own <li>s)
    const stages = region.locator('li');
    await expect(stages).toHaveCount(4);

    // Labels appear inside the SVG
    await expect(region.locator('text=Recommended').first()).toBeVisible();
    await expect(region.locator('text=Reviewed').first()).toBeVisible();
    await expect(region.locator('text=Accepted').first()).toBeVisible();
    await expect(region.locator('text=Executed').first()).toBeVisible();

    // Conversion rate between stages 1→2 is 74%
    await expect(region.locator('text=74%').first()).toBeVisible();
  });

  test('horizontal story renders in horizontal orientation', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--horizontal'));
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute('aria-label', 'Signup funnel');

    const stages = region.locator('li');
    await expect(stages).toHaveCount(4);
    await expect(region.locator('text=Visited').first()).toBeVisible();
  });

  test('with-descriptions story renders four stages', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--with-descriptions'));
    const region = page.locator('[role="region"]');
    const stages = region.locator('li');
    await expect(stages).toHaveCount(4);
    await expect(region.locator('text=Multi-step form completion')).toBeVisible();
  });

  test('no-conversion story hides conversion annotations', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--no-conversion'));
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();

    // No percentage texts should be present inside the component's SVG
    const texts = region.locator('svg text');
    const count = await texts.count();
    for (let i = 0; i < count; i++) {
      const content = await texts.nth(i).textContent();
      expect(content).not.toMatch(/%$/);
    }
  });

  test('deep-funnel story renders 8 stages', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--deep-funnel'));
    const region = page.locator('[role="region"]');
    const stages = region.locator('li');
    await expect(stages).toHaveCount(8);
    await expect(region.locator('text=Impressions').first()).toBeVisible();
    await expect(region.locator('text=Retained (30d)').first()).toBeVisible();
  });

  test('conversion annotations are hidden from assistive technology', async ({ page }) => {
    await page.goto(storyUrl('components-funnel--default'));
    // Playwright's locator filters out aria-hidden subtrees by default, and
    // the Funnel's <svg> itself carries aria-hidden="true", so we query the
    // DOM directly via evaluate() to count the conversion annotation <g>
    // elements nested inside.
    await expect(page.locator('[role="region"]')).toBeVisible();
    const hiddenGroups = await page.evaluate(() => {
      const region = document.querySelector('[role="region"]');
      return region ? region.querySelectorAll('g[aria-hidden="true"]').length : 0;
    });
    expect(hiddenGroups).toBeGreaterThanOrEqual(3); // 3 gaps between 4 stages
  });
});
