import { test, expect } from '@playwright/test';

test.describe('Infographic component', () => {
  test('renders in storybook', async ({ page }) => {
    await page.goto('/iframe.html?id=components-infographic--default&viewMode=story');
    const component = page.locator('[role="region"]');
    await expect(component).toBeVisible();
  });
});
