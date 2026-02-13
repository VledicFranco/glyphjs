import type { Page } from 'playwright';
import type { Block, GlyphIR } from '@glyphjs/types';
import { renderBlockToHTML } from './ssr.js';
import { buildHtmlTemplate } from './html-template.js';
import { getClientBundle } from './client-bundle.js';
import type { ThemeName } from './ssr.js';

export interface ScreenshotOptions {
  /** Theme to render with. Defaults to 'light'. */
  theme?: ThemeName;
  /** Viewport width in pixels. Defaults to 1280. */
  width?: number;
  /** Device scale factor. Defaults to 2. */
  deviceScaleFactor?: number;
  /** Maximum time in ms to wait for rendering to settle. Defaults to 5000. */
  timeout?: number;
  /** Pre-resolved theme CSS variables. When provided, overrides the built-in theme lookup. */
  themeVars?: Record<string, string>;
}

/**
 * Capture a PNG screenshot of a single block.
 *
 * Multi-stage render completion detection:
 * 1. Set the page HTML via SSR + client hydration bundle
 * 2. Wait for network idle (fonts, images)
 * 3. Wait for the block element to appear in the DOM
 * 4. Wait for async components to finish rendering
 * 5. Stability pause for D3 transitions
 * 6. Capture a screenshot of the block element
 */
export async function captureBlockScreenshot(
  page: Page,
  block: Block,
  options: ScreenshotOptions = {},
): Promise<Buffer> {
  const {
    theme = 'light',
    width = 1280,
    deviceScaleFactor = 2,
    timeout = 5000,
    themeVars,
  } = options;

  // Set viewport
  await page.setViewportSize({ width, height: 800 });

  // CDPSession for device scale factor if needed (only for Chromium)
  if (deviceScaleFactor !== 1) {
    try {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 800,
        deviceScaleFactor,
        mobile: false,
      });
    } catch {
      // Non-Chromium browsers don't support CDP — fall back silently
    }
  }

  // Build a single-block IR for hydration
  const singleBlockIR: GlyphIR = {
    version: '1.0.0',
    id: 'cli-screenshot',
    metadata: {},
    blocks: [block],
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
  };

  // Stage 1: SSR the block and build the full HTML page with hydration bundle
  const bodyHtml = renderBlockToHTML(block, theme, themeVars);
  const clientBundle = getClientBundle();
  const fullHtml = buildHtmlTemplate({
    body: bodyHtml,
    theme,
    clientBundle,
    ir: singleBlockIR,
    themeVars,
  });

  // Stage 2: Load the HTML and wait for network idle
  await page.setContent(fullHtml, { waitUntil: 'networkidle', timeout });

  // Stage 3: Wait for the block element to appear
  const selector = `[data-glyph-block="${block.id}"]`;
  const element = await page.waitForSelector(selector, { timeout });

  if (!element) {
    throw new Error(`Block element not found: ${selector}`);
  }

  // Stage 4: Wait for async components to finish rendering.
  // Some components may error and never clear their loading state,
  // so we catch the timeout and proceed with what we have.
  await page
    .waitForFunction(
      () => document.querySelectorAll('[data-glyph-loading]').length === 0,
      undefined,
      { timeout: 10_000 },
    )
    .catch(() => {
      // Timed out — proceed with partial rendering
    });

  // Stage 5: Brief stability pause for D3 transitions / layout settling
  await page.waitForTimeout(300);

  // Stage 6: Capture the element screenshot
  const screenshot = await element.screenshot({ type: 'png' });

  return Buffer.from(screenshot);
}
