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

import { readFile, writeFile } from 'node:fs/promises';
import { compile } from '@glyphjs/compiler';
import { compileCommand } from '../compile.js';

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

describe('compileCommand', () => {
  it('reads a file and writes JSON to stdout', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await compileCommand('input.md', {});

    expect(readFile).toHaveBeenCalledWith(expect.stringContaining('input.md'), 'utf-8');
    expect(compile).toHaveBeenCalledWith('# Hello', {
      filePath: expect.stringContaining('input.md'),
    });
    expect(stdoutSpy).toHaveBeenCalledTimes(1);

    const output = stdoutSpy.mock.calls[0]![0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.version).toBe('1.0.0');
    expect(process.exitCode).toBeUndefined();
  });

  it('writes JSON to a file when --output is specified', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockResolvedValue();

    await compileCommand('input.md', { output: 'out.json' });

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('out.json'),
      expect.any(String),
      'utf-8',
    );
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('outputs compact JSON when --compact is specified', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await compileCommand('input.md', { compact: true });

    const output = stdoutSpy.mock.calls[0]![0] as string;
    // Compact JSON has no newlines within the JSON (only the trailing newline)
    expect(output.trim()).not.toContain('\n');
  });

  it('outputs pretty-printed JSON by default', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());

    await compileCommand('input.md', {});

    const output = stdoutSpy.mock.calls[0]![0] as string;
    // Pretty JSON has indentation
    expect(output).toContain('  ');
  });

  it('logs diagnostics to stderr when --verbose is specified', async () => {
    const diag = createTestDiagnostic({ severity: 'warning', code: 'W001', message: 'Watch out' });
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult({ diagnostics: [diag] }));

    await compileCommand('input.md', { verbose: true });

    expect(stderrSpy).toHaveBeenCalled();
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('W001');
    expect(allStderr).toContain('Watch out');
  });

  it('does not log diagnostics when --verbose is not specified', async () => {
    const diag = createTestDiagnostic();
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult({ diagnostics: [diag] }));

    await compileCommand('input.md', {});

    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('sets exitCode=1 when compilation has errors', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult({ hasErrors: true }));

    await compileCommand('input.md', {});

    expect(process.exitCode).toBe(1);
  });

  it('sets exitCode=2 when reading input fails', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    await compileCommand('missing.md', {});

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Could not read input');
    expect(allStderr).toContain('ENOENT');
  });

  it('sets exitCode=2 when writing output fails', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(createResult());
    vi.mocked(writeFile).mockRejectedValue(new Error('EACCES'));

    await compileCommand('input.md', { output: '/no/access.json' });

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Could not write output');
    expect(allStderr).toContain('EACCES');
  });

  it('reads from stdin when input is "-"', async () => {
    // We need to mock process.stdin as an async iterable
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

    await compileCommand('-', {});

    expect(compile).toHaveBeenCalledWith('# From stdin', { filePath: undefined });
    expect(stdoutSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
  });
});
