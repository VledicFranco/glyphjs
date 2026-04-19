import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Gauge', () => {
  test('default story renders a meter with zones and target', async ({ page }) => {
    await page.goto(storyUrl('components-gauge--default'));
    const meter = page.locator('[role="meter"]');
    await expect(meter).toBeVisible();
    await expect(meter).toHaveAttribute('aria-valuemin', '0');
    await expect(meter).toHaveAttribute('aria-valuemax', '100');
    await expect(meter).toHaveAttribute('aria-valuenow', '78');
    await expect(page.locator('text=Customer satisfaction')).toBeVisible();
    await expect(page.locator('[data-testid="gauge-target"]')).toBeVisible();
  });

  test('full dial story uses the full shape', async ({ page }) => {
    await page.goto(storyUrl('components-gauge--full-dial'));
    const meter = page.locator('[role="meter"]');
    await expect(meter).toBeVisible();
    await expect(meter).toHaveAttribute('aria-valuenow', '4200');
    await expect(page.locator('text=Engine RPM')).toBeVisible();
  });

  test('with target story highlights the target marker', async ({ page }) => {
    await page.goto(storyUrl('components-gauge--with-target'));
    await expect(page.locator('[data-testid="gauge-target"]')).toBeVisible();
    await expect(page.locator('text=Quarterly revenue')).toBeVisible();
  });

  test('no zones story renders the background track', async ({ page }) => {
    await page.goto(storyUrl('components-gauge--no-zones'));
    await expect(page.locator('[data-testid="gauge-track"]')).toBeVisible();
    await expect(page.locator('[data-testid="gauge-zone-0"]')).toHaveCount(0);
    await expect(page.locator('text=Disk usage')).toBeVisible();
  });

  test('critical zone story shows value landing in the negative zone', async ({ page }) => {
    await page.goto(storyUrl('components-gauge--critical-zone'));
    const meter = page.locator('[role="meter"]');
    await expect(meter).toHaveAttribute('aria-valuenow', '12');
    const valueText = await meter.getAttribute('aria-valuetext');
    expect(valueText).toContain('Critical');
  });

  test('confidence score story uses a 0-1 scale', async ({ page }) => {
    await page.goto(storyUrl('components-gauge--confidence-score'));
    const meter = page.locator('[role="meter"]');
    await expect(meter).toHaveAttribute('aria-valuemin', '0');
    await expect(meter).toHaveAttribute('aria-valuemax', '1');
    await expect(meter).toHaveAttribute('aria-valuenow', '0.82');
  });

  test('SVG is hidden from assistive technology', async ({ page }) => {
    await page.goto(storyUrl('components-gauge--default'));
    const svg = page.locator('[data-testid="gauge-svg"]');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
