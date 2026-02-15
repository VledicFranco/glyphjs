import type { GlyphIR } from '@glyphjs/types';
import { checkPlaywrightAvailable, BrowserManager } from '../rendering/browser.js';
import { renderDocumentToHTML } from '../rendering/ssr.js';
import { buildHtmlTemplate } from '../rendering/html-template.js';
import { getClientBundle } from '../rendering/client-bundle.js';
import { parseMargin, type PdfExportOptions } from './pdf-options.js';

/**
 * Export a compiled IR document to a PDF buffer via Playwright.
 */
export async function exportPDF(ir: GlyphIR, options: PdfExportOptions = {}): Promise<Buffer> {
  const {
    theme = 'light',
    title,
    width = 1024,
    pageSize = 'Letter',
    margin,
    landscape = false,
    themeVars,
  } = options;

  const available = await checkPlaywrightAvailable();
  if (!available) {
    throw new Error(
      'Playwright is required for PDF export but is not installed.\n' +
        'Install it with: npx playwright install chromium',
    );
  }

  const pageTitle = title ?? (ir.metadata?.title as string | undefined) ?? 'GlyphJS Export';

  const body = renderDocumentToHTML(ir, theme, themeVars);
  const clientBundle = getClientBundle();
  const html = buildHtmlTemplate({
    body,
    theme,
    title: pageTitle,
    clientBundle,
    ir,
    themeVars,
    maxWidth: '64rem',
  });

  const parsedMargin = parseMargin(margin);

  try {
    const page = await BrowserManager.newPage();
    await page.setViewportSize({ width, height: 1024 });
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Wait for React-rendered content if the document has blocks
    if (ir.blocks.length > 0) {
      await page.waitForSelector('[data-glyph-block]');

      // Wait for async components (D3 charts, ELK architecture) to finish.
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

      // Brief stability pause for D3 transitions / layout settling
      await page.waitForTimeout(300);
    }

    // Freeze grid layouts and disconnect React before PDF capture.
    //
    // Two problems to solve:
    // 1. CSS `auto-fill` grid formulas re-evaluate at the narrower print
    //    paper width, producing fewer columns than the screen layout.
    // 2. ResizeObserver fires during print layout, causing React to
    //    re-render container-adaptive components with fewer columns.
    //
    // Solution: resolve auto-fill grids to explicit track counts (from the
    // current screen-width layout), then snapshot the DOM as static HTML
    // to disconnect React.
    await page.evaluate(() => {
      const root = document.getElementById('glyph-root');
      if (!root) return;

      // Replace auto-fill grid formulas with explicit repeat(N, 1fr)
      root.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
        if (!el.style.gridTemplateColumns) return;
        const computed = getComputedStyle(el).gridTemplateColumns;
        const tracks = computed.split(/\s+/).filter(Boolean).length;
        if (tracks > 0) {
          el.style.gridTemplateColumns = `repeat(${tracks}, 1fr)`;
        }
      });

      // Snapshot DOM to disconnect React and prevent re-renders.
      // Serializing and re-assigning innerHTML replaces React-managed
      // elements with inert clones, so ResizeObserver callbacks become
      // no-ops and no further state updates occur.
      const frozen = root.innerHTML;
      root.innerHTML = frozen;
    });

    const pdfBuffer = await page.pdf({
      format: pageSize,
      printBackground: true,
      margin: parsedMargin,
      landscape,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await BrowserManager.shutdown();
  }
}
