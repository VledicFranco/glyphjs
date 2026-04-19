import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Sankey visual tests', () => {
  test('Default story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-sankey--default&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('BudgetAllocation story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sankey--budget-allocation&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('TopDown story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-sankey--top-down&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('MinimalTwoNode story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-sankey--minimal-two-node&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('ManyFlows story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-sankey--many-flows&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('SVG has correct aria-label', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-sankey--default&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
    const label = await svg.getAttribute('aria-label');
    expect(label).toContain('Sankey');
    expect(label).toContain('nodes');
    expect(label).toContain('flows');
  });

  test('ribbons render as SVG paths', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-sankey--default&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
    const ribbons = page.locator('svg g.glyph-sankey-ribbons path');
    const count = await ribbons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('node rectangles render', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-sankey--default&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
    const nodes = page.locator('svg g.glyph-sankey-nodes rect');
    const count = await nodes.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
