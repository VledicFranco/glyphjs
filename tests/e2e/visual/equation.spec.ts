import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Equation visual tests', () => {
  test('Default story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-equation--default&viewMode=story`);
    const math = page.locator('[role="math"]');
    await expect(math).toBeVisible({ timeout: 15000 });
  });

  test('Derivation story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-equation--derivation&viewMode=story`,
    );
    const math = page.locator('[role="math"]');
    await expect(math).toBeVisible({ timeout: 15000 });
  });

  test('ComplexFormula story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-equation--complex-formula&viewMode=story`,
    );
    const math = page.locator('[role="math"]');
    await expect(math).toBeVisible({ timeout: 15000 });
  });

  test('NoLabel story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-equation--no-label&viewMode=story`);
    const math = page.locator('[role="math"]');
    await expect(math).toBeVisible({ timeout: 15000 });
  });

  test('SingleStep story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-equation--single-step&viewMode=story`,
    );
    const math = page.locator('[role="math"]');
    await expect(math).toBeVisible({ timeout: 15000 });
  });
});
