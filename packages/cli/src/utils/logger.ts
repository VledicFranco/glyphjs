import type { Diagnostic } from '@glyphjs/types';

const SEVERITY_LABELS: Record<Diagnostic['severity'], string> = {
  error: 'error',
  warning: 'warn ',
  info: 'info ',
};

export function formatDiagnostic(diag: Diagnostic, filePath?: string): string {
  const label = SEVERITY_LABELS[diag.severity];
  const code = diag.code ? ` [${diag.code}]` : '';
  const loc = formatLocation(diag, filePath);
  return `${label}${code}${loc} — ${diag.message}`;
}

function formatLocation(diag: Diagnostic, filePath?: string): string {
  if (!diag.position) {
    return filePath ? ` ${filePath}` : '';
  }
  const file = filePath ?? diag.source;
  const { line, column } = diag.position.start;
  return ` ${file}:${line}:${column}`;
}

export function formatSummary(diagnostics: Diagnostic[]): string {
  const errors = diagnostics.filter((d) => d.severity === 'error').length;
  const warnings = diagnostics.filter((d) => d.severity === 'warning').length;

  const parts: string[] = [];
  if (errors > 0) parts.push(`${errors} error${errors === 1 ? '' : 's'}`);
  if (warnings > 0) parts.push(`${warnings} warning${warnings === 1 ? '' : 's'}`);

  if (parts.length === 0) return 'Compiled successfully.';
  return `Compiled with ${parts.join(' and ')}.`;
}

export function logDiagnostics(diagnostics: Diagnostic[], filePath?: string): void {
  for (const diag of diagnostics) {
    process.stderr.write(formatDiagnostic(diag, filePath) + '\n');
  }
  if (diagnostics.length > 0) {
    process.stderr.write(formatSummary(diagnostics) + '\n');
  }
}
