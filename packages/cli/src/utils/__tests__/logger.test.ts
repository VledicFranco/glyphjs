import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Diagnostic } from '@glyphjs/types';
import { formatDiagnostic, formatSummary, logDiagnostics } from '../logger.js';

// ── Helpers ──────────────────────────────────────────────────

function createDiag(overrides: Partial<Diagnostic> = {}): Diagnostic {
  return {
    severity: 'error',
    code: 'TEST_CODE',
    message: 'Something went wrong',
    source: 'compiler',
    ...overrides,
  };
}

// ── formatDiagnostic ─────────────────────────────────────────

describe('formatDiagnostic', () => {
  it('formats an error without position or filePath', () => {
    const diag = createDiag();
    expect(formatDiagnostic(diag)).toBe('error [TEST_CODE] — Something went wrong');
  });

  it('formats a warning', () => {
    const diag = createDiag({ severity: 'warning', code: 'W001', message: 'Careful' });
    expect(formatDiagnostic(diag)).toBe('warn  [W001] — Careful');
  });

  it('formats an info diagnostic', () => {
    const diag = createDiag({ severity: 'info', code: 'I001', message: 'FYI' });
    expect(formatDiagnostic(diag)).toBe('info  [I001] — FYI');
  });

  it('includes filePath when no position is present', () => {
    const diag = createDiag();
    expect(formatDiagnostic(diag, 'input.md')).toBe(
      'error [TEST_CODE] input.md — Something went wrong',
    );
  });

  it('includes filePath and position', () => {
    const diag = createDiag({
      position: { start: { line: 10, column: 5 }, end: { line: 10, column: 20 } },
    });
    expect(formatDiagnostic(diag, 'doc.md')).toBe(
      'error [TEST_CODE] doc.md:10:5 — Something went wrong',
    );
  });

  it('falls back to diag.source when filePath is absent but position exists', () => {
    const diag = createDiag({
      source: 'parser',
      position: { start: { line: 3, column: 1 }, end: { line: 3, column: 10 } },
    });
    expect(formatDiagnostic(diag)).toBe('error [TEST_CODE] parser:3:1 — Something went wrong');
  });

  it('omits code bracket when code is empty', () => {
    const diag = createDiag({ code: '' });
    expect(formatDiagnostic(diag)).toBe('error — Something went wrong');
  });
});

// ── formatSummary ────────────────────────────────────────────

describe('formatSummary', () => {
  it('returns success message when no diagnostics', () => {
    expect(formatSummary([])).toBe('Compiled successfully.');
  });

  it('singular error', () => {
    expect(formatSummary([createDiag()])).toBe('Compiled with 1 error.');
  });

  it('plural errors', () => {
    expect(formatSummary([createDiag(), createDiag()])).toBe('Compiled with 2 errors.');
  });

  it('singular warning', () => {
    const warn = createDiag({ severity: 'warning' });
    expect(formatSummary([warn])).toBe('Compiled with 1 warning.');
  });

  it('plural warnings', () => {
    const warn = createDiag({ severity: 'warning' });
    expect(formatSummary([warn, warn, warn])).toBe('Compiled with 3 warnings.');
  });

  it('errors and warnings combined', () => {
    const err = createDiag();
    const warn = createDiag({ severity: 'warning' });
    expect(formatSummary([err, warn, warn])).toBe('Compiled with 1 error and 2 warnings.');
  });

  it('ignores info-level diagnostics in the summary', () => {
    const info = createDiag({ severity: 'info' });
    expect(formatSummary([info])).toBe('Compiled successfully.');
  });
});

// ── logDiagnostics ───────────────────────────────────────────

describe('logDiagnostics', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it('writes nothing when diagnostics array is empty', () => {
    logDiagnostics([]);
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('writes each diagnostic and a summary to stderr', () => {
    const err = createDiag({ code: 'E001', message: 'bad' });
    const warn = createDiag({ severity: 'warning', code: 'W001', message: 'meh' });
    logDiagnostics([err, warn], 'test.md');

    expect(stderrSpy).toHaveBeenCalledTimes(3); // 2 diagnostics + 1 summary
    expect(stderrSpy).toHaveBeenNthCalledWith(1, 'error [E001] test.md — bad\n');
    expect(stderrSpy).toHaveBeenNthCalledWith(2, 'warn  [W001] test.md — meh\n');
    expect(stderrSpy).toHaveBeenNthCalledWith(3, 'Compiled with 1 error and 1 warning.\n');
  });
});
