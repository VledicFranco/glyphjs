import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Block, GlyphIR } from '@glyphjs/types';

// ── Mocks ────────────────────────────────────────────────────

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

const mockPage = {};

vi.mock('../../rendering/browser.js', () => ({
  checkPlaywrightAvailable: vi.fn(() => Promise.resolve(true)),
  BrowserManager: {
    newPage: vi.fn(() => Promise.resolve(mockPage)),
    shutdown: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../../rendering/screenshot.js', () => ({
  captureBlockScreenshot: vi.fn(() => Promise.resolve(Buffer.from('fake-png'))),
}));

import { mkdir, writeFile } from 'node:fs/promises';
import { checkPlaywrightAvailable, BrowserManager } from '../../rendering/browser.js';
import { captureBlockScreenshot } from '../../rendering/screenshot.js';
import { renderAndRewriteBlocks } from '../render-blocks.js';

// ── Helpers ──────────────────────────────────────────────────

function createBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: 'block-1',
    type: 'ui:chart',
    data: { chartType: 'bar', series: [] },
    position: {
      start: { line: 3, column: 1 },
      end: { line: 7, column: 4 },
    },
    ...overrides,
  };
}

function createIR(blocks: Block[]): GlyphIR {
  return {
    version: '1.0.0',
    id: 'test-doc',
    metadata: {},
    blocks,
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
  };
}

const sampleMarkdown = [
  '# Title',
  '',
  '```ui:chart',
  'chartType: bar',
  'series: []',
  '```',
  '',
  'Some text after.',
].join('\n');

// ── Tests ────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('renderAndRewriteBlocks', () => {
  it('returns unchanged markdown when no ui: blocks exist', async () => {
    const plainBlock: Block = {
      id: 'p1',
      type: 'paragraph',
      data: {},
      position: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
    };
    const ir = createIR([plainBlock]);

    const result = await renderAndRewriteBlocks('# Hello', ir, '/tmp/img', './images');

    expect(result.markdown).toBe('# Hello');
    expect(result.imagePaths).toEqual([]);
    expect(BrowserManager.newPage).not.toHaveBeenCalled();
  });

  it('filters only ui: blocks', async () => {
    const blocks: Block[] = [
      {
        id: 'p1',
        type: 'paragraph',
        data: {},
        position: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
      },
      createBlock({ id: 'chart-1' }),
    ];
    const ir = createIR(blocks);

    await renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/img', './images');

    expect(captureBlockScreenshot).toHaveBeenCalledTimes(1);
    expect(captureBlockScreenshot).toHaveBeenCalledWith(
      mockPage,
      expect.objectContaining({ id: 'chart-1' }),
      expect.any(Object),
    );
  });

  it('creates images directory', async () => {
    const ir = createIR([createBlock()]);

    await renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/images', './images');

    expect(mkdir).toHaveBeenCalledWith('/tmp/images', { recursive: true });
  });

  it('calls captureBlockScreenshot for each ui: block', async () => {
    const blocks = [
      createBlock({
        id: 'b1',
        position: { start: { line: 3, column: 1 }, end: { line: 5, column: 4 } },
      }),
      createBlock({
        id: 'b2',
        type: 'ui:graph',
        position: { start: { line: 8, column: 1 }, end: { line: 10, column: 4 } },
      }),
    ];
    const ir = createIR(blocks);
    const md = '# Title\n\n```ui:chart\ndata\n```\n\nMiddle\n```ui:graph\ndata\n```\n';

    await renderAndRewriteBlocks(md, ir, '/tmp/img', './images');

    expect(captureBlockScreenshot).toHaveBeenCalledTimes(2);
  });

  it('writes PNGs to imagesDir with block.id as filename', async () => {
    const ir = createIR([createBlock({ id: 'my-chart' })]);

    await renderAndRewriteBlocks(sampleMarkdown, ir, '/out/images', './images');

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('my-chart.png'),
      Buffer.from('fake-png'),
    );
  });

  it('replaces a fenced code block with an image reference', async () => {
    const ir = createIR([createBlock({ id: 'chart-1' })]);

    const result = await renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/img', './images');

    expect(result.markdown).toContain('![chart-1](./images/chart-1.png)');
    expect(result.markdown).not.toContain('```ui:chart');
  });

  it('replaces multiple fenced code blocks correctly', async () => {
    const md = [
      '# Title',
      '',
      '```ui:chart',
      'data: a',
      '```',
      '',
      'Middle text',
      '',
      '```ui:graph',
      'data: b',
      '```',
      '',
      'End text',
    ].join('\n');

    const blocks = [
      createBlock({
        id: 'b1',
        type: 'ui:chart',
        position: { start: { line: 3, column: 1 }, end: { line: 5, column: 4 } },
      }),
      createBlock({
        id: 'b2',
        type: 'ui:graph',
        position: { start: { line: 9, column: 1 }, end: { line: 11, column: 4 } },
      }),
    ];
    const ir = createIR(blocks);

    const result = await renderAndRewriteBlocks(md, ir, '/tmp/img', './images');

    expect(result.markdown).toContain('![b1](./images/b1.png)');
    expect(result.markdown).toContain('![b2](./images/b2.png)');
    expect(result.markdown).toContain('Middle text');
    expect(result.markdown).toContain('End text');
  });

  it('preserves non-ui: content', async () => {
    const ir = createIR([createBlock()]);

    const result = await renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/img', './images');

    expect(result.markdown).toContain('# Title');
    expect(result.markdown).toContain('Some text after.');
  });

  it('uses imageRefPrefix in image references', async () => {
    const ir = createIR([createBlock({ id: 'c1' })]);

    const result = await renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/img', 'assets/img');

    expect(result.markdown).toContain('![c1](assets/img/c1.png)');
  });

  it('returns image paths', async () => {
    const ir = createIR([createBlock({ id: 'chart-1' })]);

    const result = await renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/images', './images');

    expect(result.imagePaths).toHaveLength(1);
    expect(result.imagePaths[0]).toContain('chart-1.png');
  });

  it('shuts down browser even on error', async () => {
    vi.mocked(captureBlockScreenshot).mockRejectedValueOnce(new Error('render error'));
    const ir = createIR([createBlock()]);

    await expect(
      renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/img', './images'),
    ).rejects.toThrow('render error');

    expect(BrowserManager.shutdown).toHaveBeenCalled();
  });

  it('throws when Playwright is unavailable', async () => {
    vi.mocked(checkPlaywrightAvailable).mockResolvedValueOnce(false);
    const ir = createIR([createBlock()]);

    await expect(
      renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/img', './images'),
    ).rejects.toThrow('Playwright is required');
  });

  it('passes theme and width options to captureBlockScreenshot', async () => {
    const ir = createIR([createBlock()]);

    await renderAndRewriteBlocks(sampleMarkdown, ir, '/tmp/img', './images', {
      theme: 'dark',
      width: 800,
    });

    expect(captureBlockScreenshot).toHaveBeenCalledWith(mockPage, expect.any(Object), {
      theme: 'dark',
      width: 800,
    });
  });
});
