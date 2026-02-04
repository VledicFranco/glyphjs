import { test, expect } from '@playwright/test';

test.describe('Infographic docs page', () => {
  test('loads infographic documentation', async ({ page }) => {
    await page.goto('/glyphjs/components/infographic/');
    await expect(page.locator('h1')).toContainText('Infographic');
  });
});
