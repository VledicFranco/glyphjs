import { type Page, type Locator, expect } from '@playwright/test';

/** Build the URL for a component doc page. */
export function docsComponentUrl(name: string): string {
  return `/glyphjs/components/${name}/`;
}

/** Build the URL for an arbitrary docs page. */
export function docsUrl(path: string): string {
  return `/glyphjs/${path}/`;
}

/** Get all GlyphPreview container locators on the page. */
export function getPreviewContainers(page: Page): Locator {
  return page.locator('[data-glyph-preview]');
}

/**
 * Wait until every `[data-glyph-preview]` on the page has transitioned to
 * `data-glyph-status="ready"`.  Since previews use `client:only="react"`,
 * they may not be in the DOM immediately — we first wait for at least
 * `expectedCount` elements to appear, then verify each one is ready.
 */
export async function waitForAllPreviews(
  page: Page,
  expectedCount: number,
  timeout = 15_000,
): Promise<void> {
  const previews = getPreviewContainers(page);

  // Wait for the expected number of client:only previews to mount
  await expect(previews).toHaveCount(expectedCount, { timeout });

  for (let i = 0; i < expectedCount; i++) {
    await expect(previews.nth(i)).toHaveAttribute(
      'data-glyph-status',
      'ready',
      { timeout },
    );
  }
}

/**
 * Assert that a single preview container rendered successfully:
 * - status is "ready" (no compile error)
 * - bounding box exists with non-trivial dimensions
 */
export async function assertPreviewRendered(preview: Locator): Promise<void> {
  await expect(preview).toHaveAttribute('data-glyph-status', 'ready');

  const box = await preview.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThan(20);
  expect(box!.width).toBeGreaterThan(50);
}
