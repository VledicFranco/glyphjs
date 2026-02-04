import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('MindMap visual tests', () => {
  test('Default story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-mindmap--default&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('TreeLayout story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-mindmap--tree-layout&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('DeepNesting story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-mindmap--deep-nesting&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('SingleBranch story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-mindmap--single-branch&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('ManyChildren story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-mindmap--many-children&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });
});
