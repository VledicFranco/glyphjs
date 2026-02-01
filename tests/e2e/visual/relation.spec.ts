import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Relation', () => {
  test('renders an SVG with role="img" and descriptive aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('Entity-relationship diagram');
    expect(ariaLabel).toContain('2 entities');
    expect(ariaLabel).toContain('1 relationship');
  });

  test('renders entity elements', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));
    const entities = page.locator('.glyph-relation-entity');
    await expect(entities).toHaveCount(2);
  });

  test('renders relationship edge elements', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));
    const edges = page.locator('.glyph-relation-edge');
    await expect(edges).toHaveCount(1);
  });

  test('screen-reader fallback table contains entity data', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));
    const srTable = page.locator('table[aria-label="Entity-relationship data"]');
    await expect(srTable).toHaveCount(1);

    // Verify entity labels are present
    await expect(srTable).toContainText('Users');
    await expect(srTable).toContainText('Orders');
  });

  test('complex ER diagram renders all entities and relationships', async ({ page }) => {
    await page.goto(storyUrl('components-relation--complex-er'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('4 entities');
    expect(ariaLabel).toContain('3 relationship');

    const entities = page.locator('.glyph-relation-entity');
    await expect(entities).toHaveCount(4);

    const edges = page.locator('.glyph-relation-edge');
    await expect(edges).toHaveCount(3);
  });

  test('relation container has correct class name', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));
    const container = page.locator('.glyph-relation-container');
    await expect(container).toBeVisible();
  });
});
