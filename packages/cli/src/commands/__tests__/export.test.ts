import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CompilationResult, Diagnostic, GlyphIR } from '@glyphjs/types';

// ── Mocks ────────────────────────────────────────────────────

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('@glyphjs/compiler', () => ({
  compile: vi.fn(),
}));

vi.mock('../../export/html.js', () => ({
  exportHTML: vi.fn(() => '<!DOCTYPE html><html><body>exported</body></html>'),
}));

vi.mock('../../export/pdf.js', () => ({
  exportPDF: vi.fn(() => Promise.resolve(Buffer.from('%PDF-mock-content'))),
}));

vi.mock('../../export/markdown.js', () => ({
  exportMarkdown: vi.fn(() =>
    Promise.resolve({ markdown: '# rewritten md', imagePaths: ['/out/images/b1.png'] }),
  ),
}));

vi.mock('../../export/docx.js', () => ({
  exportDocx: vi.fn(() => Promise.resolve(Buffer.from('DOCX-mock-content'))),
}));

import { readFile, writeFile } from 'node:fs/promises';
import { compile } from '@glyphjs/compiler';
import { exportHTML } from '../../export/html.js';
import { exportPDF } from '../../export/pdf.js';
import { exportMarkdown } from '../../export/markdown.js';
import { exportDocx } from '../../export/docx.js';
import { exportCommand } from '../export.js';

// ── Helpers ──────────────────────────────────────────────────

function createTestIR(overrides: Partial<GlyphIR> = {}): GlyphIR {
  return {
    version: '1.0.0',
    id: 'test-doc',
    metadata: {},
    blocks: [],
    references: [],
    layout: { mode: 'document', spacing: 'normal' },
    ...overrides,
  };
}

function createTestDiagnostic(overrides: Partial<Diagnostic> = {}): Diagnostic {
  return {
    severity: 'error',
    code: 'TEST_ERR',
    message: 'Test error',
    source: 'compiler',
    ...overrides,
  };
}

function createResult(overrides: Partial<CompilationResult> = {}): CompilationResult {
  return {
    ir: createTestIR(),
    diagnostics: [],
    hasErrors: false,
    ...overrides,
  };
}

// ── Setup / Teardown ─────────────────────────────────────────

let stdoutSpy: ReturnType<typeof vi.spyOn>;
let stderrSpy: ReturnType<typeof vi.spyOn>;
let savedExitCode: number | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  savedExitCode = process.exitCode;
  process.exitCode = undefined;
});

afterEach(() => {
  stdoutSpy.mockRestore();
  stderrSpy.mockRestore();
  process.exitCode = savedExitCode;
});

// ── Tests ────────────────────────────────────────────────────

describe('exportCommand', () => {
  it('reads a file, compiles, and writes HTML to stdout', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'html' });

    expect(readFile).toHaveBeenCalledWith(expect.stringContaining('input.md'), 'utf-8');
    expect(compile).toHaveBeenCalledWith('# Hello', {
      filePath: expect.stringContaining('input.md'),
    });
    expect(exportHTML).toHaveBeenCalledWith(expect.objectContaining({ version: '1.0.0' }), {
      theme: undefined,
      title: undefined,
    });
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy.mock.calls[0]![0]).toContain('<!DOCTYPE html>');
    expect(process.exitCode).toBeUndefined();
  });

  it('writes HTML to a file when --output is specified', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockResolvedValue();

    await exportCommand('input.md', { format: 'html', output: 'out.html' });

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('out.html'),
      expect.stringContaining('<!DOCTYPE html>'),
      'utf-8',
    );
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('logs diagnostics when --verbose is specified', async () => {
    const diag = createTestDiagnostic({
      severity: 'warning',
      code: 'W001',
      message: 'Watch out',
    });
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult({ diagnostics: [diag] }));

    await exportCommand('input.md', { format: 'html', verbose: true });

    expect(stderrSpy).toHaveBeenCalled();
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('W001');
    expect(allStderr).toContain('Watch out');
  });

  it('logs export path when --verbose and --output are specified', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockResolvedValue();

    await exportCommand('input.md', {
      format: 'html',
      output: 'out.html',
      verbose: true,
    });

    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Exported to');
  });

  it('sets exitCode=1 when compilation has errors', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult({ hasErrors: true }));

    await exportCommand('input.md', { format: 'html' });

    expect(process.exitCode).toBe(1);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Compilation failed');
  });

  it('sets exitCode=2 when reading input fails', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    await exportCommand('missing.md', { format: 'html' });

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Could not read input');
    expect(allStderr).toContain('ENOENT');
  });

  it('sets exitCode=2 when writing output fails', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockRejectedValue(new Error('EACCES'));

    await exportCommand('input.md', { format: 'html', output: '/no/access.html' });

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Could not write output');
    expect(allStderr).toContain('EACCES');
  });

  it('sets exitCode=2 for unknown export format', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'rtf' });

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Unknown export format "rtf"');
    expect(allStderr).toContain('Supported formats: html, pdf, md, docx');
  });

  it('passes --title through to the HTML exporter', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'html', title: 'Custom Title' });

    expect(exportHTML).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ title: 'Custom Title' }),
    );
  });

  it('passes --theme through to the HTML exporter', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'html', theme: 'dark' });

    expect(exportHTML).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ theme: 'dark' }),
    );
  });

  it('reads from stdin when input is "-"', async () => {
    const markdown = '# From stdin';
    const chunks = [Buffer.from(markdown)];

    const originalStdin = process.stdin;
    const mockStdin = {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    };
    Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true });

    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('-', { format: 'html' });

    expect(compile).toHaveBeenCalledWith('# From stdin', { filePath: undefined });
    expect(stdoutSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
  });

  it('dispatches to exportPDF for format "pdf" and writes Buffer to file', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockResolvedValue();

    await exportCommand('input.md', { format: 'pdf', output: 'out.pdf' });

    expect(exportPDF).toHaveBeenCalledWith(
      expect.objectContaining({ version: '1.0.0' }),
      expect.objectContaining({ theme: undefined }),
    );
    // Buffer output should NOT use utf-8 encoding
    expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('out.pdf'), expect.any(Buffer));
    expect(process.exitCode).toBeUndefined();
  });

  it('passes PDF options (pageSize, margin, landscape) through to exportPDF', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockResolvedValue();

    await exportCommand('input.md', {
      format: 'pdf',
      output: 'out.pdf',
      pageSize: 'A4',
      margin: '0.5in 1in',
      landscape: true,
    });

    expect(exportPDF).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        pageSize: 'A4',
        margin: '0.5in 1in',
        landscape: true,
      }),
    );
  });

  it('sets exitCode=2 when PDF export throws', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(exportPDF).mockRejectedValueOnce(new Error('Playwright is required'));

    await exportCommand('input.md', { format: 'pdf', output: 'out.pdf' });

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('PDF export failed');
    expect(allStderr).toContain('Playwright is required');
  });

  it('writes PDF Buffer to stdout when no --output is specified', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'pdf' });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(Buffer.isBuffer(stdoutSpy.mock.calls[0]![0])).toBe(true);
  });

  // ── Markdown format ─────────────────────────────────────────

  it('dispatches to exportMarkdown for format "md"', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'md' });

    expect(exportMarkdown).toHaveBeenCalledWith(
      '# Hello',
      expect.objectContaining({ version: '1.0.0' }),
      expect.any(String),
      expect.objectContaining({ theme: undefined }),
    );
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy.mock.calls[0]![0]).toContain('# rewritten md');
  });

  it('writes markdown to a file when --output is specified', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockResolvedValue();

    await exportCommand('input.md', { format: 'md', output: 'out.md' });

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('out.md'),
      expect.stringContaining('# rewritten md'),
      'utf-8',
    );
  });

  it('passes --images-dir through to exportMarkdown', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'md', imagesDir: 'assets/' });

    expect(exportMarkdown).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(String),
      expect.objectContaining({ imagesDir: 'assets/' }),
    );
  });

  it('sets exitCode=2 when markdown export throws', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(exportMarkdown).mockRejectedValueOnce(new Error('Playwright is required'));

    await exportCommand('input.md', { format: 'md' });

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Markdown export failed');
    expect(allStderr).toContain('Playwright is required');
  });

  // ── DOCX format ─────────────────────────────────────────────

  it('dispatches to exportDocx for format "docx" and writes Buffer to file', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockResolvedValue();

    await exportCommand('input.md', { format: 'docx', output: 'out.docx' });

    expect(exportDocx).toHaveBeenCalledWith(
      '# Hello',
      expect.objectContaining({ version: '1.0.0' }),
      expect.objectContaining({ theme: undefined }),
    );
    expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('out.docx'), expect.any(Buffer));
  });

  it('writes DOCX Buffer to stdout when no --output is specified', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'docx' });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(Buffer.isBuffer(stdoutSpy.mock.calls[0]![0])).toBe(true);
  });

  it('sets exitCode=2 when DOCX export throws', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(exportDocx).mockRejectedValueOnce(new Error('Pandoc is required'));

    await exportCommand('input.md', { format: 'docx' });

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('DOCX export failed');
    expect(allStderr).toContain('Pandoc is required');
  });

  it('passes theme and width to exportDocx', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await exportCommand('input.md', { format: 'docx', theme: 'dark', width: 1024 });

    expect(exportDocx).toHaveBeenCalledWith(
      '# Hello',
      expect.any(Object),
      expect.objectContaining({ theme: 'dark', width: 1024 }),
    );
  });
});
