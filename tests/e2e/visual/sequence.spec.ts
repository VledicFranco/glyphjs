import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Sequence visual tests', () => {
  test('Default story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-sequence--default&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('TwoActors story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sequence--two-actors&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('SelfMessage story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sequence--self-message&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('ManyMessages story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sequence--many-messages&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('MixedTypes story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sequence--mixed-types&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });
});
