import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolve } from 'node:path';
import type { GlyphIR } from '@glyphjs/types';

// ── Mocks ────────────────────────────────────────────────────

vi.mock('../render-blocks.js', () => ({
  renderAndRewriteBlocks: vi.fn(() =>
    Promise.resolve({ markdown: '# rewritten', imagePaths: ['/out/images/b1.png'] }),
  ),
}));

import { renderAndRewriteBlocks } from '../render-blocks.js';
import { exportMarkdown } from '../markdown.js';

// ── Helpers ──────────────────────────────────────────────────

function createTestIR(): GlyphIR {
  return {
    version: '1.0.0',
    id: 'test-doc',
    metadata: {},
    blocks: [],
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
  };
}

// ── Tests ────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('exportMarkdown', () => {
  it('calls renderAndRewriteBlocks with resolved imagesDir', async () => {
    await exportMarkdown('# Hello', createTestIR(), '/output/dir');

    expect(renderAndRewriteBlocks).toHaveBeenCalledWith(
      '# Hello',
      expect.objectContaining({ id: 'test-doc' }),
      resolve('/output/dir', './images/'),
      './images',
      { theme: undefined, width: undefined },
    );
  });

  it('uses default ./images/ when imagesDir not specified', async () => {
    await exportMarkdown('# Hello', createTestIR(), '/output');

    const call = vi.mocked(renderAndRewriteBlocks).mock.calls[0]!;
    expect(call[2]).toBe(resolve('/output', './images/'));
    expect(call[3]).toBe('./images');
  });

  it('passes custom imagesDir through', async () => {
    await exportMarkdown('# Hello', createTestIR(), '/output', {
      imagesDir: 'assets/rendered/',
    });

    const call = vi.mocked(renderAndRewriteBlocks).mock.calls[0]!;
    expect(call[2]).toBe(resolve('/output', 'assets/rendered/'));
    expect(call[3]).toBe('assets/rendered');
  });

  it('passes theme and width options', async () => {
    await exportMarkdown('# Hello', createTestIR(), '/output', {
      theme: 'dark',
      width: 1024,
    });

    expect(renderAndRewriteBlocks).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(String),
      expect.any(String),
      { theme: 'dark', width: 1024 },
    );
  });

  it('returns the result from renderAndRewriteBlocks', async () => {
    const result = await exportMarkdown('# Hello', createTestIR(), '/output');

    expect(result.markdown).toBe('# rewritten');
    expect(result.imagePaths).toEqual(['/out/images/b1.png']);
  });

  it('strips trailing slash from imageRefPrefix', async () => {
    await exportMarkdown('# Hello', createTestIR(), '/output', {
      imagesDir: 'img/',
    });

    const call = vi.mocked(renderAndRewriteBlocks).mock.calls[0]!;
    expect(call[3]).toBe('img');
  });
});
