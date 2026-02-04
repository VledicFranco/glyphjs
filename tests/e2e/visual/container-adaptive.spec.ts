import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Container-adaptive layout — compact tier', () => {
  // ─── Card ─────────────────────────────────────────────────

  test('Card compact story renders single-column grid', async ({ page }) => {
    await page.goto(storyUrl('components-card--compact'));
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();

    const grid = page.locator('[role="list"]');
    const gridCols = await grid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
    // Single column means the computed value is a single length (no spaces)
    expect(gridCols.trim().split(/\s+/).length).toBe(1);
  });

  // ─── KPI ──────────────────────────────────────────────────

  test('KPI compact story renders max 2 columns', async ({ page }) => {
    await page.goto(storyUrl('components-kpi--compact'));
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();

    // There are 3 metrics; at compact tier the grid should clamp to 2 cols
    const groups = page.locator('[role="group"]');
    await expect(groups).toHaveCount(3);

    // Verify the grid wrapper uses at most 2 columns
    const grid = region.locator('div[style]').first();
    const gridCols = await grid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
    const colCount = gridCols.trim().split(/\s+/).length;
    expect(colCount).toBeLessThanOrEqual(2);
  });

  // ─── Infographic ──────────────────────────────────────────

  test('Infographic compact story renders single-column stack', async ({ page }) => {
    await page.goto(storyUrl('components-infographic--compact'));
    const region = page.locator('[role="region"]');
    await expect(region).toBeVisible();

    // In compact mode, the sections wrapper should use stack layout (no CSS grid)
    const sectionsContainer = region.locator('[data-layout]');
    await expect(sectionsContainer).toHaveAttribute('data-layout', 'stack');
  });

  // ─── Table ────────────────────────────────────────────────

  test('Table compact story wraps in overflow container with smaller font', async ({ page }) => {
    await page.goto(storyUrl('components-table--compact'));

    // The table should be wrapped in a div with overflow-x: auto
    const overflowWrapper = page.locator('div[style*="overflow"]');
    await expect(overflowWrapper).toBeVisible();
    const overflowVal = await overflowWrapper.evaluate(
      (el) => window.getComputedStyle(el).overflowX,
    );
    expect(overflowVal).toBe('auto');

    // Verify the table uses a smaller font size
    const table = page.locator('[role="grid"]');
    const fontSize = await table.evaluate((el) => window.getComputedStyle(el).fontSize);
    const fontSizePx = parseFloat(fontSize);
    expect(fontSizePx).toBeLessThanOrEqual(14);
  });

  // ─── Comparison ───────────────────────────────────────────

  test('Comparison compact story uses reduced font size', async ({ page }) => {
    await page.goto(storyUrl('components-comparison--compact'));
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();

    const fontSize = await grid.evaluate((el) => window.getComputedStyle(el).fontSize);
    const fontSizePx = parseFloat(fontSize);
    expect(fontSizePx).toBeLessThanOrEqual(14);
  });

  // ─── Sequence ─────────────────────────────────────────────

  test('Sequence compact story renders SVG', async ({ page }) => {
    await page.goto(storyUrl('components-sequence--compact'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });

    // Verify the SVG has a viewBox (it rendered properly)
    const viewBox = await svg.getAttribute('viewBox');
    expect(viewBox).toBeTruthy();
  });

  // ─── Chart ────────────────────────────────────────────────

  test('Chart compact story renders SVG', async ({ page }) => {
    await page.goto(storyUrl('components-chart--compact'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });

    const viewBox = await svg.getAttribute('viewBox');
    expect(viewBox).toBeTruthy();
  });

  // ─── Graph ────────────────────────────────────────────────

  test('Graph compact story renders SVG with role="img"', async ({ page }) => {
    await page.goto(storyUrl('components-graph--compact'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });

    // Verify height constraint is applied (max 500px at compact)
    const maxHeight = await svg.evaluate(
      (el) => el.style.maxHeight || window.getComputedStyle(el).maxHeight,
    );
    const maxHeightPx = parseFloat(maxHeight);
    expect(maxHeightPx).toBeLessThanOrEqual(500);
  });

  // ─── Flowchart ────────────────────────────────────────────

  test('Flowchart compact story renders SVG with role="img"', async ({ page }) => {
    await page.goto(storyUrl('components-flowchart--compact'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });

    const maxHeight = await svg.evaluate(
      (el) => el.style.maxHeight || window.getComputedStyle(el).maxHeight,
    );
    const maxHeightPx = parseFloat(maxHeight);
    expect(maxHeightPx).toBeLessThanOrEqual(500);
  });

  // ─── Architecture ─────────────────────────────────────────

  test('Architecture compact story renders SVG with role="img"', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--compact'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });

    const maxHeight = await svg.evaluate(
      (el) => el.style.maxHeight || window.getComputedStyle(el).maxHeight,
    );
    const maxHeightPx = parseFloat(maxHeight);
    expect(maxHeightPx).toBeLessThanOrEqual(500);
  });

  // ─── MindMap ──────────────────────────────────────────────

  test('MindMap compact story renders SVG with role="img"', async ({ page }) => {
    await page.goto(storyUrl('components-mindmap--compact'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });

    const maxHeight = await svg.evaluate(
      (el) => el.style.maxHeight || window.getComputedStyle(el).maxHeight,
    );
    const maxHeightPx = parseFloat(maxHeight);
    expect(maxHeightPx).toBeLessThanOrEqual(500);
  });
});
