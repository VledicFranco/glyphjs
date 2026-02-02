import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Graph', () => {
  test('renders an SVG with role="img" and descriptive aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-graph--dag-small'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('dag graph');
    expect(ariaLabel).toContain('3 nodes');
    expect(ariaLabel).toContain('2 edges');
  });

  test('renders node elements inside the SVG', async ({ page }) => {
    await page.goto(storyUrl('components-graph--dag-small'));
    // Each node is rendered as a group with class glyph-graph-node
    const nodes = page.locator('.glyph-graph-node');
    await expect(nodes).toHaveCount(3);
  });

  test('renders edge elements inside the SVG', async ({ page }) => {
    await page.goto(storyUrl('components-graph--dag-small'));
    const edges = page.locator('.glyph-graph-edge');
    await expect(edges).toHaveCount(2);
  });

  test('screen-reader fallback table is present', async ({ page }) => {
    await page.goto(storyUrl('components-graph--dag-small'));
    const srTable = page.locator('table[aria-label="Graph data"]');
    // The table exists in the DOM even though it is visually hidden
    await expect(srTable).toHaveCount(1);

    // Verify it contains node data
    await expect(srTable).toContainText('Start');
    await expect(srTable).toContainText('Process');
    await expect(srTable).toContainText('End');
  });

  test('medium DAG renders correct number of nodes and edges', async ({ page }) => {
    await page.goto(storyUrl('components-graph--dag-medium'));
    const nodes = page.locator('.glyph-graph-node');
    await expect(nodes).toHaveCount(6);

    const edges = page.locator('.glyph-graph-edge');
    await expect(edges).toHaveCount(6);
  });

  test('flowchart graph renders all expected elements', async ({ page }) => {
    await page.goto(storyUrl('components-graph--flowchart'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('5 nodes');
    expect(ariaLabel).toContain('5 edges');
  });

  test('graph container has correct class name', async ({ page }) => {
    await page.goto(storyUrl('components-graph--dag-small'));
    const container = page.locator('.glyph-graph-container');
    await expect(container).toBeVisible();
  });
});
