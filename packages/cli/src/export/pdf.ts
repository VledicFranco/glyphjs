import type { GlyphIR } from '@glyphjs/types';
import { checkPlaywrightAvailable, BrowserManager } from '../rendering/browser.js';
import { renderDocumentToHTML } from '../rendering/ssr.js';
import { buildHtmlTemplate } from '../rendering/html-template.js';
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
  } = options;

  const available = await checkPlaywrightAvailable();
  if (!available) {
    throw new Error(
      'Playwright is required for PDF export but is not installed.\n' +
        'Install it with: npx playwright install chromium',
    );
  }

  const pageTitle = title ?? (ir.metadata?.title as string | undefined) ?? 'GlyphJS Export';

  const body = renderDocumentToHTML(ir, theme);
  const html = buildHtmlTemplate({ body, theme, title: pageTitle });

  const parsedMargin = parseMargin(margin);

  try {
    const page = await BrowserManager.newPage();
    await page.setViewportSize({ width, height: 1024 });
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Wait for React-rendered content if the document has blocks
    if (ir.blocks.length > 0) {
      await page.waitForSelector('[data-glyph-block]');
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
