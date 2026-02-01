import type { SourcePosition } from './ir.js';

// ─── Diagnostics ──────────────────────────────────────────────

export type DiagnosticSource = 'parser' | 'compiler' | 'schema' | 'runtime' | 'plugin';

export interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  position?: SourcePosition;
  source: DiagnosticSource;
  details?: unknown;
}
