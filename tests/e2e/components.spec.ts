import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

/**
 * Component preset E2E tests -- select each preset in the demo app
 * dropdown and verify the expected component renders.
 */

const DEMO_URL = '/';

/** Helper: select a preset from the dropdown and wait for render. */
async function selectPreset(page: Page, presetKey: string) {
  const select = page.locator('#preset-select');
  await select.selectOption(presetKey);
  // Wait for the debounced compilation to complete
  await page.waitForTimeout(800);
}

test.describe('Component Presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_URL);
    await expect(page.locator('text=Glyph JS Demo')).toBeVisible();
  });

  test('simple preset renders heading and list', async ({ page }) => {
    await selectPreset(page, 'simple');

    const preview = page.locator('text=Rendered Output').locator('..');
    await expect(preview.locator('h1')).toContainText('Hello Glyph');
    await expect(preview.locator('li').first()).toBeVisible();
  });

  test('callout preset renders callout notes', async ({ page }) => {
    await selectPreset(page, 'callout');

    const preview = page.locator('text=Rendered Output').locator('..');
    const callouts = preview.locator('[role="note"]');
    // The callout preset has 4 callouts (info, warning, error, tip)
    await expect(callouts).toHaveCount(4, { timeout: 5000 });
  });

  test('tabs preset renders tab component', async ({ page }) => {
    await selectPreset(page, 'tabs');

    const preview = page.locator('text=Rendered Output').locator('..');
    // Tabs should have tab buttons
    const tabButtons = preview.locator('[role="tab"]');
    await expect(tabButtons.first()).toBeVisible({ timeout: 5000 });
    await expect(tabButtons).toHaveCount(3);
  });

  test('steps preset renders steps component', async ({ page }) => {
    await selectPreset(page, 'steps');

    const preview = page.locator('text=Rendered Output').locator('..');
    // Steps should render the step titles
    await expect(preview.locator('text=Install Dependencies')).toBeVisible({ timeout: 5000 });
    await expect(preview.locator('text=Configure the Runtime')).toBeVisible();
    await expect(preview.locator('text=Render Documents')).toBeVisible();
  });

  test('table preset renders a data table', async ({ page }) => {
    await selectPreset(page, 'table');

    const preview = page.locator('text=Rendered Output').locator('..');
    // Look for the grid role or a table element
    const table = preview.locator('[role="grid"], table');
    await expect(table.first()).toBeVisible({ timeout: 5000 });

    // Verify column headers are present (use first thead row to avoid filter row)
    const headerRow = preview.locator('thead tr').first();
    await expect(headerRow.locator('th').filter({ hasText: 'Package' })).toBeVisible();
    await expect(headerRow.locator('th').filter({ hasText: 'Version' })).toBeVisible();
    await expect(headerRow.locator('th').filter({ hasText: 'Size' })).toBeVisible();
  });

  test('graph preset renders an SVG graph', async ({ page }) => {
    await selectPreset(page, 'graph');

    const preview = page.locator('text=Rendered Output').locator('..');
    const svg = preview.locator('svg');
    await expect(svg.first()).toBeVisible({ timeout: 5000 });

    // Verify graph nodes are rendered
    const nodes = preview.locator('.glyph-graph-node');
    await expect(nodes.first()).toBeVisible();
  });

  test('chart preset renders a chart', async ({ page }) => {
    await selectPreset(page, 'chart');

    const preview = page.locator('text=Rendered Output').locator('..');
    // Chart should render an SVG or canvas element
    const chartElement = preview.locator('svg, canvas');
    await expect(chartElement.first()).toBeVisible({ timeout: 5000 });
  });

  test('timeline preset renders timeline events', async ({ page }) => {
    await selectPreset(page, 'timeline');

    const preview = page.locator('text=Rendered Output').locator('..');
    // Verify timeline event content appears
    await expect(preview.locator('text=Project Kickoff')).toBeVisible({ timeout: 5000 });
    await expect(preview.locator('text=Parser & Compiler')).toBeVisible();
  });

  test('kitchenSink preset renders multiple component types', async ({ page }) => {
    await selectPreset(page, 'kitchenSink');

    const preview = page.locator('text=Rendered Output').locator('..');
    await expect(preview.locator('h1')).toContainText('Kitchen Sink', { timeout: 5000 });

    // Should contain a callout
    await expect(preview.locator('[role="note"]').first()).toBeVisible();
    // Should contain an SVG (graph or chart)
    await expect(preview.locator('svg').first()).toBeVisible();
    // Should contain a table
    const table = preview.locator('[role="grid"], table');
    await expect(table.first()).toBeVisible();
  });
});
