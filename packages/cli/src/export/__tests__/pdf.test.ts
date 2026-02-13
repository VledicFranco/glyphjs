import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GlyphIR } from '@glyphjs/types';

// ── Mocks ────────────────────────────────────────────────────

vi.mock('../../rendering/ssr.js', () => ({
  renderDocumentToHTML: vi.fn(() => '<div data-glyph-block="b1">rendered</div>'),
}));

vi.mock('../../rendering/html-template.js', () => ({
  buildHtmlTemplate: vi.fn(() => '<!DOCTYPE html><html><body>full page</body></html>'),
}));

vi.mock('../../rendering/client-bundle.js', () => ({
  getClientBundle: vi.fn(() => '/* hydrate bundle */'),
}));

const mockPage = {
  setViewportSize: vi.fn(),
  setContent: vi.fn(),
  waitForSelector: vi.fn(),
  waitForFunction: vi.fn().mockResolvedValue(undefined),
  waitForTimeout: vi.fn(),
  pdf: vi.fn(() => Buffer.from('%PDF-mock')),
};

vi.mock('../../rendering/browser.js', () => ({
  checkPlaywrightAvailable: vi.fn(() => Promise.resolve(true)),
  BrowserManager: {
    newPage: vi.fn(() => Promise.resolve(mockPage)),
    shutdown: vi.fn(() => Promise.resolve()),
  },
}));

import { renderDocumentToHTML } from '../../rendering/ssr.js';
import { buildHtmlTemplate } from '../../rendering/html-template.js';
import { getClientBundle } from '../../rendering/client-bundle.js';
import { checkPlaywrightAvailable, BrowserManager } from '../../rendering/browser.js';
import { exportPDF } from '../pdf.js';

// ── Helpers ──────────────────────────────────────────────────

function createTestIR(overrides: Partial<GlyphIR> = {}): GlyphIR {
  return {
    version: '1.0.0',
    id: 'test-doc',
    metadata: {},
    blocks: [{ id: 'b1', type: 'callout', data: { style: 'info', body: 'hi' } }],
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('exportPDF', () => {
  it('calls renderDocumentToHTML with the correct theme', async () => {
    await exportPDF(createTestIR(), { theme: 'dark' });

    expect(renderDocumentToHTML).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-doc' }),
      'dark',
      undefined,
    );
  });

  it('builds an HTML template with clientBundle and ir', async () => {
    const ir = createTestIR();
    await exportPDF(ir, { theme: 'dark', title: 'My PDF' });

    expect(getClientBundle).toHaveBeenCalled();
    expect(buildHtmlTemplate).toHaveBeenCalledWith({
      body: '<div data-glyph-block="b1">rendered</div>',
      theme: 'dark',
      title: 'My PDF',
      clientBundle: '/* hydrate bundle */',
      ir,
      themeVars: undefined,
    });
  });

  it('uses IR metadata title as fallback', async () => {
    const ir = createTestIR({ metadata: { title: 'From Metadata' } });
    await exportPDF(ir);

    expect(buildHtmlTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'From Metadata' }),
    );
  });

  it('uses default title when none provided', async () => {
    await exportPDF(createTestIR());

    expect(buildHtmlTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'GlyphJS Export' }),
    );
  });

  it('sets viewport width', async () => {
    await exportPDF(createTestIR(), { width: 1024 });

    expect(mockPage.setViewportSize).toHaveBeenCalledWith({
      width: 1024,
      height: 1024,
    });
  });

  it('defaults viewport width to 800', async () => {
    await exportPDF(createTestIR());

    expect(mockPage.setViewportSize).toHaveBeenCalledWith({
      width: 800,
      height: 1024,
    });
  });

  it('sets content with waitUntil networkidle', async () => {
    await exportPDF(createTestIR());

    expect(mockPage.setContent).toHaveBeenCalledWith(
      '<!DOCTYPE html><html><body>full page</body></html>',
      { waitUntil: 'networkidle' },
    );
  });

  it('waits for [data-glyph-block] selector when blocks exist', async () => {
    await exportPDF(createTestIR());

    expect(mockPage.waitForSelector).toHaveBeenCalledWith('[data-glyph-block]');
  });

  it('waits for async components to finish loading', async () => {
    await exportPDF(createTestIR());

    expect(mockPage.waitForFunction).toHaveBeenCalledWith(expect.any(Function), undefined, {
      timeout: 10_000,
    });
  });

  it('adds a stability pause after async wait', async () => {
    await exportPDF(createTestIR());

    expect(mockPage.waitForTimeout).toHaveBeenCalledWith(300);
  });

  it('skips all waiting when there are no blocks', async () => {
    await exportPDF(createTestIR({ blocks: [] }));

    expect(mockPage.waitForSelector).not.toHaveBeenCalled();
    expect(mockPage.waitForFunction).not.toHaveBeenCalled();
    expect(mockPage.waitForTimeout).not.toHaveBeenCalled();
  });

  it('calls page.pdf with correct options', async () => {
    await exportPDF(createTestIR(), {
      pageSize: 'A4',
      margin: '0.5in 1in',
      landscape: true,
    });

    expect(mockPage.pdf).toHaveBeenCalledWith({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '1in', bottom: '0.5in', left: '1in' },
      landscape: true,
    });
  });

  it('uses default page size and margin', async () => {
    await exportPDF(createTestIR());

    expect(mockPage.pdf).toHaveBeenCalledWith({
      format: 'Letter',
      printBackground: true,
      margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      landscape: false,
    });
  });

  it('returns a Buffer', async () => {
    const result = await exportPDF(createTestIR());

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('%PDF-mock');
  });

  it('throws when Playwright is not available', async () => {
    vi.mocked(checkPlaywrightAvailable).mockResolvedValueOnce(false);

    await expect(exportPDF(createTestIR())).rejects.toThrow(
      'Playwright is required for PDF export',
    );
  });

  it('always shuts down the browser, even on error', async () => {
    mockPage.setContent.mockRejectedValueOnce(new Error('page error'));

    await expect(exportPDF(createTestIR())).rejects.toThrow('page error');
    expect(BrowserManager.shutdown).toHaveBeenCalled();
  });
});
