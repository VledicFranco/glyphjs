import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Relation - Interaction Modes', () => {
  test('zoom controls are visible and functional', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));

    // Verify zoom controls are present
    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    const zoomOut = page.locator('button[aria-label="Zoom out"]');
    const resetZoom = page.locator('button[aria-label="Reset zoom"]');

    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
    await expect(resetZoom).toBeVisible();
  });

  test('zoom in button increases scale', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));

    // Get initial transform
    const root = page.locator('.glyph-relation-root').first();
    const initialTransform = await root.getAttribute('transform');

    // Click zoom in button
    await page.click('button[aria-label="Zoom in"]');

    // Wait for animation to complete
    await page.waitForTimeout(400);

    // Get new transform
    const newTransform = await root.getAttribute('transform');

    // Transform should have changed
    expect(newTransform).not.toBe(initialTransform);
    expect(newTransform).toContain('scale');
  });

  test('zoom out button decreases scale', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));

    // First zoom in so we have room to zoom out
    await page.click('button[aria-label="Zoom in"]');
    await page.waitForTimeout(400);

    const afterZoomInTransform = await page
      .locator('.glyph-relation-root')
      .first()
      .getAttribute('transform');

    // Now zoom out
    await page.click('button[aria-label="Zoom out"]');
    await page.waitForTimeout(400);

    const afterZoomOutTransform = await page
      .locator('.glyph-relation-root')
      .first()
      .getAttribute('transform');

    // Transform should have changed again
    expect(afterZoomOutTransform).not.toBe(afterZoomInTransform);
  });

  test('reset button restores original view', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));

    const root = page.locator('.glyph-relation-root').first();

    // Zoom in a few times
    await page.click('button[aria-label="Zoom in"]');
    await page.waitForTimeout(400);
    await page.click('button[aria-label="Zoom in"]');
    await page.waitForTimeout(400);

    const transformAfterZoom = await root.getAttribute('transform');
    expect(transformAfterZoom).toContain('scale');

    // Reset zoom
    await page.click('button[aria-label="Reset zoom"]');
    await page.waitForTimeout(400);

    const transformAfterReset = await root.getAttribute('transform');

    // Should be identity transform or null
    expect(
      transformAfterReset === null || transformAfterReset === 'translate(0,0) scale(1)',
    ).toBeTruthy();
  });

  test('modifier-key mode story has interaction overlay initially hidden', async ({ page }) => {
    await page.goto(storyUrl('components-relation--modifier-key-mode'));

    // Overlay should not be visible initially
    const overlay = page.locator('.glyph-interaction-overlay');
    await expect(overlay).toHaveCount(0);
  });

  test('click-to-activate mode story shows overlay when inactive', async ({ page }) => {
    await page.goto(storyUrl('components-relation--click-to-activate-mode'));

    // Overlay should be visible initially
    const overlay = page.locator('.glyph-interaction-overlay');
    await expect(overlay).toBeVisible();

    // Overlay should contain activation text
    await expect(overlay).toContainText('Click to interact');
  });

  test('click-to-activate mode activates on click', async ({ page }) => {
    await page.goto(storyUrl('components-relation--click-to-activate-mode'));

    // Click the overlay to activate
    const container = page.locator('.glyph-relation-container').first();
    await container.click();

    // Overlay should disappear
    const overlay = page.locator('.glyph-interaction-overlay');
    await expect(overlay).toHaveCount(0);
  });

  test('click-to-activate mode deactivates on Escape key', async ({ page }) => {
    await page.goto(storyUrl('components-relation--click-to-activate-mode'));

    // Activate first
    const container = page.locator('.glyph-relation-container').first();
    await container.click();

    // Verify overlay is gone
    let overlay = page.locator('.glyph-interaction-overlay');
    await expect(overlay).toHaveCount(0);

    // Press Escape
    await page.keyboard.press('Escape');

    // Overlay should reappear
    overlay = page.locator('.glyph-interaction-overlay');
    await expect(overlay).toBeVisible();
  });

  test('always mode story has no interaction restrictions', async ({ page }) => {
    await page.goto(storyUrl('components-relation--always-mode'));

    // Should have no overlay
    const overlay = page.locator('.glyph-interaction-overlay');
    await expect(overlay).toHaveCount(0);

    // Zoom buttons should still work
    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    await expect(zoomIn).toBeVisible();
  });

  test('pan interaction works via mouse drag', async ({ page }) => {
    await page.goto(storyUrl('components-relation--always-mode'));

    const svg = page.locator('svg[role="img"]').first();
    const root = page.locator('.glyph-relation-root').first();

    // Get SVG bounds
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not found');

    // Get initial transform
    const initialTransform = await root.getAttribute('transform');

    // Perform drag
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
    await page.mouse.up();

    // Wait a bit for transform to apply
    await page.waitForTimeout(100);

    // Get new transform
    const newTransform = await root.getAttribute('transform');

    // Transform should have changed
    expect(newTransform).not.toBe(initialTransform);
    expect(newTransform).toContain('translate');
  });
});
