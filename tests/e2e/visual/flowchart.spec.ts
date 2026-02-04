import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Flowchart visual tests', () => {
  test('Default story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-flowchart--default&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('LeftRight story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-flowchart--left-right&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('DecisionHeavy story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-flowchart--decision-heavy&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('LinearProcess story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-flowchart--linear-process&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('ComplexBranching story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-flowchart--complex-branching&viewMode=story`,
    );
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
  });

  test('SVG has correct aria-label', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-flowchart--default&viewMode=story`);
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible({ timeout: 15000 });
    const label = await svg.getAttribute('aria-label');
    expect(label).toContain('flowchart');
    expect(label).toContain('nodes');
  });
});
