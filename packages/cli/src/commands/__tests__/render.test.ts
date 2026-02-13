import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CompilationResult, Block, GlyphIR } from '@glyphjs/types';

// ── Mocks ────────────────────────────────────────────────────

vi.mock('node:fs/promises', () => {
  const mod = {
    readFile: vi.fn(),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  };
  return { ...mod, default: mod };
});

vi.mock('@glyphjs/compiler', () => ({
  compile: vi.fn(),
}));

vi.mock('../../rendering/browser.js', () => ({
  checkPlaywrightAvailable: vi.fn(),
  BrowserManager: {
    newPage: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../rendering/screenshot.js', () => ({
  captureBlockScreenshot: vi.fn(),
}));

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { compile } from '@glyphjs/compiler';
import { checkPlaywrightAvailable, BrowserManager } from '../../rendering/browser.js';
import { captureBlockScreenshot } from '../../rendering/screenshot.js';
import { renderCommand } from '../render.js';

// ── Helpers ──────────────────────────────────────────────────

function createBlock(id: string, type = 'ui:callout'): Block {
  return {
    id,
    type: type as Block['type'],
    data: { type: 'info', content: 'Hello' },
    position: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
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

function createResult(blocks: Block[], hasErrors = false): CompilationResult {
  return {
    ir: createIR(blocks),
    diagnostics: [],
    hasErrors,
  };
}

const mockPage = { close: vi.fn() };
const pngData = Buffer.from('PNG-DATA');

// ── Setup / Teardown ─────────────────────────────────────────

let stderrSpy: ReturnType<typeof vi.spyOn>;
let savedExitCode: number | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  savedExitCode = process.exitCode;
  process.exitCode = undefined;

  // Default: Playwright is available
  vi.mocked(checkPlaywrightAvailable).mockResolvedValue(true);
  vi.mocked(BrowserManager.newPage).mockResolvedValue(mockPage as never);
  vi.mocked(captureBlockScreenshot).mockResolvedValue(pngData);
});

afterEach(() => {
  stderrSpy.mockRestore();
  process.exitCode = savedExitCode;
});

// ── Tests ────────────────────────────────────────────────────

describe('renderCommand', () => {
  it('exits with code 2 when Playwright is not available', async () => {
    vi.mocked(checkPlaywrightAvailable).mockResolvedValue(false);

    await renderCommand('input.md', {});

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Playwright is not installed');
  });

  it('exits with code 2 when input file cannot be read', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    await renderCommand('missing.md', {});

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Could not read input');
  });

  it('exits with code 1 when compilation has errors', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult([], true));

    await renderCommand('input.md', {});

    expect(process.exitCode).toBe(1);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Compilation failed');
  });

  it('renders all ui: blocks and writes PNGs', async () => {
    const blocks = [
      createBlock('callout-1'),
      createBlock('callout-2'),
      { ...createBlock('para-1'), type: 'paragraph' as const, id: 'para-1' },
    ];
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult(blocks));

    await renderCommand('input.md', { outputDir: '/tmp/out' });

    // Only ui: blocks rendered (2 out of 3)
    expect(captureBlockScreenshot).toHaveBeenCalledTimes(2);
    expect(writeFile).toHaveBeenCalledTimes(2);
    expect(process.exitCode).toBeUndefined();
  });

  it('filters by --block-id', async () => {
    const blocks = [createBlock('callout-1'), createBlock('callout-2')];
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult(blocks));

    await renderCommand('input.md', { blockId: 'callout-2', outputDir: '/tmp/out' });

    expect(captureBlockScreenshot).toHaveBeenCalledTimes(1);
    expect(captureBlockScreenshot).toHaveBeenCalledWith(mockPage, blocks[1], expect.anything());
  });

  it('exits with code 1 when --block-id is not found', async () => {
    const blocks = [createBlock('callout-1')];
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult(blocks));

    await renderCommand('input.md', { blockId: 'nonexistent' });

    expect(process.exitCode).toBe(1);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('not found');
  });

  it('warns when no ui: blocks are found', async () => {
    const blocks = [{ ...createBlock('para-1'), type: 'paragraph' as const, id: 'para-1' }];
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult(blocks));

    await renderCommand('input.md', {});

    expect(process.exitCode).toBe(0);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('No ui: blocks found');
  });

  it('continues on individual block render failure', async () => {
    const blocks = [createBlock('callout-1'), createBlock('callout-2')];
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult(blocks));
    vi.mocked(captureBlockScreenshot)
      .mockRejectedValueOnce(new Error('Render failed'))
      .mockResolvedValueOnce(pngData);

    await renderCommand('input.md', { outputDir: '/tmp/out' });

    // Both blocks attempted
    expect(captureBlockScreenshot).toHaveBeenCalledTimes(2);
    // Only the successful one wrote to disk
    expect(writeFile).toHaveBeenCalledTimes(1);
    // Exit code 1 because one block failed
    expect(process.exitCode).toBe(1);
  });

  it('passes theme and width options through to screenshot', async () => {
    const blocks = [createBlock('callout-1')];
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult(blocks));

    await renderCommand('input.md', {
      theme: 'dark',
      width: 800,
      deviceScaleFactor: 3,
      outputDir: '/tmp/out',
    });

    expect(captureBlockScreenshot).toHaveBeenCalledWith(mockPage, blocks[0], {
      theme: 'dark',
      width: 800,
      deviceScaleFactor: 3,
    });
  });

  it('always shuts down the browser', async () => {
    const blocks = [createBlock('callout-1')];
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult(blocks));
    vi.mocked(captureBlockScreenshot).mockRejectedValue(new Error('boom'));

    await renderCommand('input.md', { outputDir: '/tmp/out' });

    expect(BrowserManager.shutdown).toHaveBeenCalledTimes(1);
  });

  it('creates output directories recursively', async () => {
    const blocks = [createBlock('callout-1')];
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult(blocks));

    await renderCommand('input.md', { outputDir: '/deep/nested/dir' });

    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });
});
