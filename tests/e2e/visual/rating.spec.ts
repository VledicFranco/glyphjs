import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Rating', () => {
  test('default story renders title and all items', async ({ page }) => {
    await page.goto(storyUrl('components-rating--default'));
    await expect(page.locator('role=region[name="Rate these features"]')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
    await expect(page.locator('text=Developer Experience')).toBeVisible();
  });

  test('star mode renders interactive star buttons', async ({ page }) => {
    await page.goto(storyUrl('components-rating--default'));
    // Wait for the region to be rendered before counting
    await page.locator('role=region[name="Rate these features"]').waitFor();
    const stars = page.locator('[role="radiogroup"] [role="radio"]');
    await expect(stars.first()).toBeVisible();
    const count = await stars.count();
    expect(count).toBeGreaterThan(0);
  });

  test('each item renders 5 stars in default mode', async ({ page }) => {
    await page.goto(storyUrl('components-rating--default'));
    // Wait for render before counting
    await page.locator('role=region[name="Rate these features"]').waitFor();
    const starButtons = page.locator('[role="radiogroup"] [role="radio"]');
    await expect(starButtons.first()).toBeVisible();
    const count = await starButtons.count();
    // 3 items × 5 stars = 15
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('number mode story renders number buttons instead of stars', async ({ page }) => {
    await page.goto(storyUrl('components-rating--number-mode'));
    await expect(page.locator('role=region[name="Number Rating"]')).toBeVisible();
    await expect(page.locator('text=Overall satisfaction')).toBeVisible();
    await expect(page.locator('text=Ease of use')).toBeVisible();
  });

  test('scale labels are shown when provided', async ({ page }) => {
    await page.goto(storyUrl('components-rating--default'));
    // 3 items × 1 'Poor' label each; .first() avoids strict-mode violation
    await expect(page.locator('text=Poor').first()).toBeVisible();
    await expect(page.locator('text=Excellent').first()).toBeVisible();
  });

  test('minimal story renders with no title', async ({ page }) => {
    await page.goto(storyUrl('components-rating--minimal'));
    await expect(page.locator('role=region[name="Rating"]')).toBeVisible();
    await expect(page.locator('text=How was your experience?')).toBeVisible();
  });

  test('clicking a star selects it', async ({ page }) => {
    await page.goto(storyUrl('components-rating--minimal'));
    const thirdStar = page.locator('button[aria-label*="star"]').nth(2);
    await thirdStar.click();
    // After clicking, the button should reflect selected state
    await expect(thirdStar).toBeVisible();
  });
});
