import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CompilationResult, Diagnostic } from '@glyphjs/types';

// ── Mocks ────────────────────────────────────────────────────

vi.mock('node:fs/promises', () => {
  const mod = { readFile: vi.fn() };
  return { ...mod, default: mod };
});

vi.mock('@glyphjs/compiler', () => ({
  compile: vi.fn(),
}));

import { readFile } from 'node:fs/promises';
import { compile } from '@glyphjs/compiler';
import { lintCommand } from '../lint.js';

// ── Helpers ──────────────────────────────────────────────────

function diag(overrides: Partial<Diagnostic> = {}): Diagnostic {
  return {
    severity: 'error',
    code: 'TEST_ERR',
    message: 'Test error',
    source: 'compiler',
    ...overrides,
  };
}

function result(
  diagnostics: Diagnostic[] = [],
  overrides: Partial<CompilationResult> = {},
): CompilationResult {
  return {
    ir: {
      version: '1.0.0',
      id: 'x',
      metadata: {},
      blocks: [],
      references: [],
      layout: { mode: 'document', spacing: 'normal' },
    },
    diagnostics,
    hasErrors: diagnostics.some((d) => d.severity === 'error'),
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

function allStderr(): string {
  return stderrSpy.mock.calls.map((c) => c[0]).join('');
}

function allStdout(): string {
  return stdoutSpy.mock.calls.map((c) => c[0]).join('');
}

// ── Text format ───────────────────────────────────────────────

describe('lintCommand — text format (default)', () => {
  it('prints nothing and exits 0 when there are no diagnostics', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(result());

    await lintCommand('doc.md', {});

    expect(stderrSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it('prints each diagnostic to stderr', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([diag({ severity: 'error', code: 'YAML_PARSE_ERROR', message: 'bad yaml' })]),
    );

    await lintCommand('doc.md', {});

    expect(allStderr()).toContain('YAML_PARSE_ERROR');
    expect(allStderr()).toContain('bad yaml');
  });

  it('prints a summary line after the diagnostics', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([
        diag({ severity: 'error' }),
        diag({ severity: 'warning', code: 'W1', message: 'warn' }),
      ]),
    );

    await lintCommand('doc.md', {});

    expect(allStderr()).toContain('Found 1 error, 1 warning.');
  });

  it('summary uses plural correctly', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([
        diag({ severity: 'error' }),
        diag({ severity: 'error', code: 'E2', message: 'e2' }),
        diag({ severity: 'warning', code: 'W1', message: 'w1' }),
        diag({ severity: 'warning', code: 'W2', message: 'w2' }),
      ]),
    );

    await lintCommand('doc.md', {});

    expect(allStderr()).toContain('Found 2 errors, 2 warnings.');
  });

  it('includes the file path in diagnostic output', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([
        diag({
          severity: 'error',
          position: { start: { line: 5, column: 1 }, end: { line: 5, column: 10 } },
        }),
      ]),
    );

    await lintCommand('doc.md', {});

    expect(allStderr()).toContain('doc.md');
  });

  it('sets exitCode=1 when there are errors', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(result([diag({ severity: 'error' })]));

    await lintCommand('doc.md', {});

    expect(process.exitCode).toBe(1);
  });

  it('does not set exitCode=1 for warnings by default', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([diag({ severity: 'warning', code: 'W1', message: 'w' })]),
    );

    await lintCommand('doc.md', {});

    expect(process.exitCode).toBeUndefined();
  });

  it('does not set exitCode=1 for info diagnostics', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([diag({ severity: 'info', code: 'I1', message: 'info' })]),
    );

    await lintCommand('doc.md', {});

    expect(process.exitCode).toBeUndefined();
  });

  it('sets exitCode=2 and prints error when file cannot be read', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT: no such file'));

    await lintCommand('missing.md', {});

    expect(process.exitCode).toBe(2);
    expect(allStderr()).toContain('Could not read input');
    expect(allStderr()).toContain('ENOENT');
  });
});

// ── Strict mode ───────────────────────────────────────────────

describe('lintCommand — --strict', () => {
  it('sets exitCode=1 for warnings in strict mode', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([diag({ severity: 'warning', code: 'W1', message: 'w' })]),
    );

    await lintCommand('doc.md', { strict: true });

    expect(process.exitCode).toBe(1);
  });

  it('does not set exitCode=1 for info in strict mode', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([diag({ severity: 'info', code: 'I1', message: 'info' })]),
    );

    await lintCommand('doc.md', { strict: true });

    expect(process.exitCode).toBeUndefined();
  });

  it('still exits 0 with no diagnostics in strict mode', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(result());

    await lintCommand('doc.md', { strict: true });

    expect(process.exitCode).toBeUndefined();
  });
});

// ── Quiet mode ────────────────────────────────────────────────

describe('lintCommand — --quiet', () => {
  it('suppresses all stderr output', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(result([diag({ severity: 'error' })]));

    await lintCommand('doc.md', { quiet: true });

    expect(stderrSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1); // exit code still set
  });

  it('suppresses read-error message in quiet mode', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    await lintCommand('missing.md', { quiet: true });

    expect(stderrSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(2);
  });
});

// ── JSON format ───────────────────────────────────────────────

describe('lintCommand — --format json', () => {
  it('writes valid JSON to stdout', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(result());

    await lintCommand('doc.md', { format: 'json' });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(allStdout());
    expect(parsed).toMatchObject({ valid: true, errorCount: 0, warningCount: 0, diagnostics: [] });
  });

  it('reports valid:false and includes diagnostics when errors exist', async () => {
    const errDiag = diag({ severity: 'error', code: 'YAML_PARSE_ERROR', message: 'bad yaml' });
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(result([errDiag]));

    await lintCommand('doc.md', { format: 'json' });

    const parsed = JSON.parse(allStdout());
    expect(parsed.valid).toBe(false);
    expect(parsed.errorCount).toBe(1);
    expect(parsed.warningCount).toBe(0);
    expect(parsed.diagnostics).toHaveLength(1);
    expect(parsed.diagnostics[0].code).toBe('YAML_PARSE_ERROR');
  });

  it('reports valid:true when there are only warnings (non-strict)', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([diag({ severity: 'warning', code: 'W1', message: 'w' })]),
    );

    await lintCommand('doc.md', { format: 'json' });

    const parsed = JSON.parse(allStdout());
    expect(parsed.valid).toBe(true);
    expect(parsed.warningCount).toBe(1);
  });

  it('reports valid:false for warnings in strict mode', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(
      result([diag({ severity: 'warning', code: 'W1', message: 'w' })]),
    );

    await lintCommand('doc.md', { format: 'json', strict: true });

    const parsed = JSON.parse(allStdout());
    expect(parsed.valid).toBe(false);
  });

  it('includes the file path in JSON output', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(result());

    await lintCommand('doc.md', { format: 'json' });

    const parsed = JSON.parse(allStdout());
    expect(parsed.file).toContain('doc.md');
  });

  it('writes error JSON to stdout on read failure', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    await lintCommand('missing.md', { format: 'json' });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(allStdout());
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toContain('Could not read input');
    expect(stderrSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(2);
  });

  it('writes nothing to stderr in json format (clean for piping)', async () => {
    vi.mocked(readFile).mockResolvedValue('# Hello');
    vi.mocked(compile).mockReturnValue(result([diag({ severity: 'error' })]));

    await lintCommand('doc.md', { format: 'json' });

    expect(stderrSpy).not.toHaveBeenCalled();
  });
});

// ── Stdin ─────────────────────────────────────────────────────

describe('lintCommand — stdin', () => {
  it('reads from stdin when input is "-"', async () => {
    const markdown = '# From stdin';
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', {
      value: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from(markdown);
        },
      },
      writable: true,
    });

    vi.mocked(compile).mockReturnValue(result());

    await lintCommand('-', {});

    expect(compile).toHaveBeenCalledWith('# From stdin', { filePath: undefined });
    expect(process.exitCode).toBeUndefined();

    Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
  });

  it('uses "<stdin>" as the file label in JSON output', async () => {
    const originalStdin = process.stdin;
    Object.defineProperty(process, 'stdin', {
      value: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('# Hello');
        },
      },
      writable: true,
    });

    vi.mocked(compile).mockReturnValue(result());

    await lintCommand('-', { format: 'json' });

    const parsed = JSON.parse(allStdout());
    expect(parsed.file).toBe('<stdin>');

    Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true });
  });
});
