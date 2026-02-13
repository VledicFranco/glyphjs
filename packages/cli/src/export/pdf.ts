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
    width = 800,
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
  const html = buildHtmlTemplate({ body, theme, title: pageTitle, clientBundle, ir, themeVars });

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
