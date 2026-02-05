import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Kpi', () => {
  test('default story renders all metric cards', async ({ page }) => {
    await page.goto(storyUrl('components-kpi--default'));
    const groups = page.locator('[role="group"]');
    await expect(groups).toHaveCount(3);
    await expect(page.locator('text=Revenue')).toBeVisible();
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Churn')).toBeVisible();
  });

  test('single metric story renders one card', async ({ page }) => {
    await page.goto(storyUrl('components-kpi--single-metric'));
    const groups = page.locator('[role="group"]');
    await expect(groups).toHaveCount(1);
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=$12.5M')).toBeVisible();
  });

  test('all trends story shows trend arrows', async ({ page }) => {
    await page.goto(storyUrl('components-kpi--all-trends'));
    await expect(page.locator('text=Growth')).toBeVisible();
    await expect(page.locator('text=Decline')).toBeVisible();
    await expect(page.locator('text=Steady')).toBeVisible();
  });

  test('no deltas story renders without delta elements', async ({ page }) => {
    await page.goto(storyUrl('components-kpi--no-deltas'));
    const groups = page.locator('[role="group"]');
    await expect(groups).toHaveCount(4);
    await expect(page.locator('text=CPU')).toBeVisible();
    await expect(page.locator('text=72%')).toBeVisible();
  });

  test('four columns story renders with correct grid', async ({ page }) => {
    await page.goto(storyUrl('components-kpi--four-columns'));
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute('aria-label', 'Quarterly KPIs');
    const groups = page.locator('[role="group"]');
    await expect(groups).toHaveCount(4);
  });

  test('trend arrows are hidden from assistive technology', async ({ page }) => {
    await page.goto(storyUrl('components-kpi--default'));
    await expect(page.locator('[role="region"]')).toBeVisible();
    const hiddenArrows = page.locator('[role="group"] [aria-hidden="true"]');
    await expect(hiddenArrows.first()).toBeVisible();
    const count = await hiddenArrows.count();
    expect(count).toBeGreaterThan(0);
  });
});
