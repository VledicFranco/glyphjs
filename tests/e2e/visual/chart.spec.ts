import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Chart', () => {
  test('line chart renders an SVG with role="img"', async ({ page }) => {
    await page.goto(storyUrl('components-chart--line-chart'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('line chart');
    expect(ariaLabel).toContain('Revenue');
  });

  test('bar chart renders an SVG with accessible label', async ({ page }) => {
    await page.goto(storyUrl('components-chart--bar-chart'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('bar chart');
    expect(ariaLabel).toContain('2 series');
  });

  test('area chart renders correctly', async ({ page }) => {
    await page.goto(storyUrl('components-chart--area-chart'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('area chart');
    expect(ariaLabel).toContain('Traffic');
  });

  test('OHLC chart renders correctly', async ({ page }) => {
    await page.goto(storyUrl('components-chart--ohlc-chart'));
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toContain('ohlc chart');
    expect(ariaLabel).toContain('AAPL');
  });

  test('chart contains accessible hidden data table', async ({ page }) => {
    await page.goto(storyUrl('components-chart--line-chart'));
    // The hidden table exists for screen readers
    const caption = page.locator('table caption');
    await expect(caption).toHaveCount(1);
    await expect(caption).toContainText('line chart data');
  });

  test('chart SVG has a viewBox attribute', async ({ page }) => {
    await page.goto(storyUrl('components-chart--line-chart'));
    const svg = page.locator('svg[role="img"]');
    const viewBox = await svg.getAttribute('viewBox');
    expect(viewBox).toBeTruthy();
    // viewBox should contain four numeric values
    expect(viewBox).toMatch(/^\d+\s+\d+\s+\d+\s+\d+$/);
  });

  test('bar chart renders axis labels', async ({ page }) => {
    await page.goto(storyUrl('components-chart--bar-chart'));
    // The x-axis label should be present as an SVG text element
    const xLabel = page.locator('svg text.x-label');
    await expect(xLabel).toContainText('Quarter');

    const yLabel = page.locator('svg text.y-label');
    await expect(yLabel).toContainText('Units');
  });
});
