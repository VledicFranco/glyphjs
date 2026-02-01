import type { GlyphIR } from './ir.js';

// ─── IR Version Migration ─────────────────────────────────────

export interface IRMigration {
  from: string;
  to: string;
  migrate: (ir: GlyphIR) => GlyphIR;
}
