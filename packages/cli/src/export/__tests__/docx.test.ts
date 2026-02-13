import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GlyphIR } from '@glyphjs/types';

// ── Mocks ────────────────────────────────────────────────────

vi.mock('node:fs/promises', () => {
  const mod = {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(() => Promise.resolve(Buffer.from('DOCX-content'))),
    rm: vi.fn(),
  };
  return { ...mod, default: mod };
});

vi.mock('../pandoc.js', () => ({
  checkPandocAvailable: vi.fn(() => Promise.resolve('pandoc 3.1.9')),
  runPandoc: vi.fn(),
}));

vi.mock('../render-blocks.js', () => ({
  renderAndRewriteBlocks: vi.fn(() => Promise.resolve({ markdown: '# rewritten', imagePaths: [] })),
}));

import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { checkPandocAvailable, runPandoc } from '../pandoc.js';
import { renderAndRewriteBlocks } from '../render-blocks.js';
import { exportDocx } from '../docx.js';

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

describe('exportDocx', () => {
  it('throws when Pandoc is unavailable', async () => {
    vi.mocked(checkPandocAvailable).mockResolvedValueOnce(null);

    await expect(exportDocx('# Hello', createTestIR())).rejects.toThrow(
      'Pandoc is required for DOCX export',
    );
    expect(await checkPandocAvailable()).not.toBeNull(); // default mock still works
  });

  it('throws with install URL when Pandoc is missing', async () => {
    vi.mocked(checkPandocAvailable).mockResolvedValueOnce(null);

    await expect(exportDocx('# Hello', createTestIR())).rejects.toThrow(
      'https://pandoc.org/installing.html',
    );
  });

  it('creates a temp directory', async () => {
    await exportDocx('# Hello', createTestIR());

    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('glyphjs-docx-'), {
      recursive: true,
    });
  });

  it('calls renderAndRewriteBlocks with temp dir and "." prefix', async () => {
    await exportDocx('# Hello', createTestIR(), { theme: 'dark', width: 800 });

    expect(renderAndRewriteBlocks).toHaveBeenCalledWith(
      '# Hello',
      expect.objectContaining({ id: 'test-doc' }),
      expect.stringContaining('glyphjs-docx-'),
      '.',
      { theme: 'dark', width: 800 },
    );
  });

  it('writes processed markdown to document.md in temp dir', async () => {
    await exportDocx('# Hello', createTestIR());

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('document.md'),
      '# rewritten',
      'utf-8',
    );
  });

  it('calls runPandoc with correct arguments', async () => {
    await exportDocx('# Hello', createTestIR());

    expect(runPandoc).toHaveBeenCalledWith(
      'document.md',
      'output.docx',
      expect.stringContaining('glyphjs-docx-'),
    );
  });

  it('reads and returns the DOCX file as a Buffer', async () => {
    const result = await exportDocx('# Hello', createTestIR());

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('DOCX-content');
    expect(readFile).toHaveBeenCalledWith(expect.stringContaining('output.docx'));
  });

  it('cleans up temp dir on success', async () => {
    await exportDocx('# Hello', createTestIR());

    expect(rm).toHaveBeenCalledWith(expect.stringContaining('glyphjs-docx-'), {
      recursive: true,
      force: true,
    });
  });

  it('cleans up temp dir on error', async () => {
    vi.mocked(runPandoc).mockRejectedValueOnce(new Error('pandoc crashed'));

    await expect(exportDocx('# Hello', createTestIR())).rejects.toThrow('pandoc crashed');

    expect(rm).toHaveBeenCalledWith(expect.stringContaining('glyphjs-docx-'), {
      recursive: true,
      force: true,
    });
  });

  it('passes theme and width through to renderAndRewriteBlocks', async () => {
    await exportDocx('# Hello', createTestIR(), { theme: 'light', width: 1024 });

    expect(renderAndRewriteBlocks).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(String),
      '.',
      { theme: 'light', width: 1024 },
    );
  });
});
