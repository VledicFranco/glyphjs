import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Block } from '@glyphjs/types';
import { captureBlockScreenshot } from '../screenshot.js';

// ── Mock the SSR + template + client-bundle modules ─────────

vi.mock('../ssr.js', () => ({
  renderBlockToHTML: vi.fn().mockReturnValue('<div data-glyph-block="b1">Callout</div>'),
}));

vi.mock('../html-template.js', () => ({
  buildHtmlTemplate: vi.fn().mockReturnValue('<!DOCTYPE html><html><body>mock</body></html>'),
}));

vi.mock('../client-bundle.js', () => ({
  getClientBundle: vi.fn().mockReturnValue('/* hydrate */'),
}));

import { renderBlockToHTML } from '../ssr.js';
import { buildHtmlTemplate } from '../html-template.js';
import { getClientBundle } from '../client-bundle.js';

// ── Mock page object ─────────────────────────────────────────

const pngBuffer = Buffer.from('fake-png-data');

function createMockElement() {
  return {
    screenshot: vi.fn().mockResolvedValue(pngBuffer),
  };
}

function createMockPage() {
  const mockElement = createMockElement();
  const mockCdp = {
    send: vi.fn().mockResolvedValue(undefined),
  };
  return {
    page: {
      setViewportSize: vi.fn().mockResolvedValue(undefined),
      setContent: vi.fn().mockResolvedValue(undefined),
      waitForSelector: vi.fn().mockResolvedValue(mockElement),
      waitForFunction: vi.fn().mockResolvedValue(undefined),
      waitForTimeout: vi.fn().mockResolvedValue(undefined),
      context: vi.fn().mockReturnValue({
        newCDPSession: vi.fn().mockResolvedValue(mockCdp),
      }),
    },
    mockElement,
    mockCdp,
  };
}

function createBlock(id = 'b1'): Block {
  return {
    id,
    type: 'ui:callout',
    data: { type: 'info', content: 'Hello' },
    position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
  };
}

// ── Tests ────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('captureBlockScreenshot', () => {
  it('calls renderBlockToHTML and buildHtmlTemplate with clientBundle and ir', async () => {
    const { page } = createMockPage();
    const block = createBlock();

    await captureBlockScreenshot(page as never, block);

    expect(renderBlockToHTML).toHaveBeenCalledWith(block, 'light', undefined);
    expect(getClientBundle).toHaveBeenCalled();
    expect(buildHtmlTemplate).toHaveBeenCalledWith({
      body: '<div data-glyph-block="b1">Callout</div>',
      theme: 'light',
      clientBundle: '/* hydrate */',
      ir: expect.objectContaining({
        id: 'cli-screenshot',
        blocks: [block],
      }),
      themeVars: undefined,
    });
  });

  it('sets viewport size', async () => {
    const { page } = createMockPage();

    await captureBlockScreenshot(page as never, createBlock(), { width: 800 });

    expect(page.setViewportSize).toHaveBeenCalledWith({ width: 800, height: 800 });
  });

  it('loads content with waitUntil networkidle', async () => {
    const { page } = createMockPage();

    await captureBlockScreenshot(page as never, createBlock());

    expect(page.setContent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ waitUntil: 'networkidle' }),
    );
  });

  it('waits for the block element selector', async () => {
    const { page } = createMockPage();
    const block = createBlock('my-block');

    await captureBlockScreenshot(page as never, block);

    expect(page.waitForSelector).toHaveBeenCalledWith(
      '[data-glyph-block="my-block"]',
      expect.objectContaining({ timeout: 5000 }),
    );
  });

  it('waits for async components to finish loading', async () => {
    const { page } = createMockPage();

    await captureBlockScreenshot(page as never, createBlock());

    expect(page.waitForFunction).toHaveBeenCalledWith(expect.any(Function), undefined, {
      timeout: 10_000,
    });
  });

  it('adds a stability pause after async wait', async () => {
    const { page } = createMockPage();

    await captureBlockScreenshot(page as never, createBlock());

    expect(page.waitForTimeout).toHaveBeenCalledWith(300);
  });

  it('returns a Buffer with the screenshot data', async () => {
    const { page } = createMockPage();

    const result = await captureBlockScreenshot(page as never, createBlock());

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('fake-png-data');
  });

  it('takes an element screenshot as PNG', async () => {
    const { page, mockElement } = createMockPage();

    await captureBlockScreenshot(page as never, createBlock());

    expect(mockElement.screenshot).toHaveBeenCalledWith({ type: 'png' });
  });

  it('throws when element is not found', async () => {
    const { page } = createMockPage();
    page.waitForSelector.mockResolvedValue(null);

    await expect(captureBlockScreenshot(page as never, createBlock())).rejects.toThrow(
      'Block element not found',
    );
  });

  it('respects custom theme option', async () => {
    const { page } = createMockPage();

    await captureBlockScreenshot(page as never, createBlock(), { theme: 'dark' });

    expect(renderBlockToHTML).toHaveBeenCalledWith(expect.anything(), 'dark', undefined);
    expect(buildHtmlTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark', themeVars: undefined }),
    );
  });

  it('sets CDP device scale factor', async () => {
    const { page, mockCdp } = createMockPage();

    await captureBlockScreenshot(page as never, createBlock(), {
      deviceScaleFactor: 3,
    });

    expect(mockCdp.send).toHaveBeenCalledWith(
      'Emulation.setDeviceMetricsOverride',
      expect.objectContaining({ deviceScaleFactor: 3 }),
    );
  });

  it('passes custom themeVars to renderBlockToHTML and buildHtmlTemplate', async () => {
    const { page } = createMockPage();
    const customVars = { '--glyph-bg': '#fff', '--glyph-accent': '#F56400' };

    await captureBlockScreenshot(page as never, createBlock(), { themeVars: customVars });

    expect(renderBlockToHTML).toHaveBeenCalledWith(expect.anything(), 'light', customVars);
    expect(buildHtmlTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ themeVars: customVars }),
    );
  });

  it('skips CDP call when deviceScaleFactor is 1', async () => {
    const { page, mockCdp } = createMockPage();

    await captureBlockScreenshot(page as never, createBlock(), {
      deviceScaleFactor: 1,
    });

    expect(mockCdp.send).not.toHaveBeenCalled();
  });
});
