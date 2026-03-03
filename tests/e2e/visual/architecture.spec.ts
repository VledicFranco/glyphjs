import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Architecture', () => {
  test('simple flow renders SVG with node labels', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--simple-flow'));
    // Wait for async ELK layout; SVG is display:none until layout completes
    await expect(page.locator('svg[role="img"]')).toBeVisible();
    // Node labels are in the SR-only fallback table
    const srTable = page.locator('table[aria-label="Architecture data"]');
    await expect(srTable).toContainText('Web App');
    await expect(srTable).toContainText('API Server');
    await expect(srTable).toContainText('Database');
  });

  test('edge labels are rendered', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--simple-flow'));
    await expect(page.locator('svg[role="img"]')).toBeVisible();
    // Edge labels are SVG text nodes — check via textContent
    const svgText = await page.locator('svg[role="img"]').evaluate((el) => el.textContent ?? '');
    expect(svgText).toContain('REST');
    expect(svgText).toContain('queries');
  });

  test('cloud infra story renders title and nested zones', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--cloud-infra'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
    // Title lives in the SVG aria-label
    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('Production VPC');
    // Zone labels are SVG text nodes
    const svgText = await svg.evaluate((el) => el.textContent ?? '');
    expect(svgText).toContain('Public Subnet');
    expect(svgText).toContain('Private Subnet');
    expect(svgText).toContain('Data Subnet');
  });

  test('microservices story renders all service nodes', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--microservices'));
    await expect(page.locator('svg[role="img"]')).toBeVisible();
    const srTable = page.locator('table[aria-label="Architecture data"]');
    await expect(srTable).toContainText('API Gateway');
    await expect(srTable).toContainText('Auth Service');
    await expect(srTable).toContainText('PostgreSQL');
  });

  test('data pipeline story uses left-right layout', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--data-pipeline'));
    await expect(page.locator('svg[role="img"]')).toBeVisible();
    const srTable = page.locator('table[aria-label="Architecture data"]');
    await expect(srTable).toContainText('Ingest');
    await expect(srTable).toContainText('Transform');
    await expect(srTable).toContainText('Data Lake');
    await expect(srTable).toContainText('Query Engine');
  });

  test('modifier key mode story renders zoom controls', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--modifier-key-mode'));
    await expect(page.locator('svg[role="img"]')).toBeVisible();
    // Zoom controls should be present
    await expect(page.locator('button[aria-label*="oom"]').first()).toBeVisible();
  });

  test('compact story renders inside constrained container', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--compact'));
    await expect(page.locator('svg[role="img"]')).toBeVisible();
    const srTable = page.locator('table[aria-label="Architecture data"]');
    await expect(srTable).toContainText('Web App');
  });

  test('click to activate mode renders interactive overlay', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--click-to-activate-mode'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();
  });
});
