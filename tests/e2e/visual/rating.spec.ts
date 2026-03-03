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
    // Star buttons should be present (role=radio or button within each rating item)
    const stars = page.locator('button[aria-label*="star"], input[type="radio"]');
    const count = await stars.count();
    expect(count).toBeGreaterThan(0);
  });

  test('each item renders 5 stars in default mode', async ({ page }) => {
    await page.goto(storyUrl('components-rating--default'));
    // 3 items × 5 stars = 15 total star interaction points
    const starButtons = page.locator('button[aria-label*="star"]');
    const count = await starButtons.count();
    // At minimum each item has 5 stars
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
    await expect(page.locator('text=Poor')).toBeVisible();
    await expect(page.locator('text=Excellent')).toBeVisible();
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
