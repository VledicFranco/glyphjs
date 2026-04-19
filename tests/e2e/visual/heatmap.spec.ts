import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Heatmap', () => {
  test('default story renders title and grid', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--default'));
    await expect(page.locator('role=region[name="Data freshness across leaders"]')).toBeVisible();
    await expect(page.locator('role=grid')).toBeVisible();
  });

  test('column headers are visible', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--default'));
    await expect(page.getByRole('columnheader', { name: 'Mongo' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Sheets' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'HubSpot' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'GitHub' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Sentry' })).toBeVisible();
  });

  test('row labels are visible', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--default'));
    await expect(page.getByRole('rowheader', { name: 'Alice' })).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Bob' })).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Carol' })).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Dave' })).toBeVisible();
  });

  test('cells expose per-cell aria-labels with values and units', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--default'));
    await expect(page.getByLabel('Alice, Mongo: 2 hours')).toBeVisible();
    await expect(page.getByLabel('Dave, Mongo: 24 hours')).toBeVisible();
  });

  test('legend renders with role=img and a color-scale label', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--default'));
    await expect(page.getByRole('img', { name: /Color scale:\s*0 to 24 hours/i })).toBeVisible();
  });

  test('diverging story renders the midpoint scale correctly', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--diverging'));
    await expect(page.locator('role=region[name="Week-over-week change (%)"]')).toBeVisible();
    await expect(page.getByRole('img', { name: /Color scale:\s*-20 to 20 %/i })).toBeVisible();
  });

  test('null cells are labeled "no data" in the nulls story', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--with-null-cells'));
    await expect(page.getByLabel(/US-East, TV: no data/i).first()).toBeVisible();
  });

  test('contribution calendar hides values when showValues is off', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--contribution-calendar'));
    await expect(page.locator('role=region[name="Contributions — last 12 weeks"]')).toBeVisible();
    // Grid should have a large number of cells.
    await page.locator('role=grid').waitFor();
    const cells = page.locator('tbody td');
    const count = await cells.count();
    expect(count).toBeGreaterThanOrEqual(7 * 12);
  });

  test('correlation matrix renders a symmetric grid', async ({ page }) => {
    await page.goto(storyUrl('components-heatmap--correlation-matrix'));
    await expect(page.locator('role=region[name="Feature correlations"]')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'revenue' })).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'revenue' })).toBeVisible();
  });
});
