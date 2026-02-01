// @glyphjs/ir — barrel file

// ─── Block ID and Document ID Generation ─────────────────────
export {
  generateBlockId,
  generateDocumentId,
  resolveBlockIdCollisions,
} from './ids.js';

// ─── IR Validation ───────────────────────────────────────────
export { validateIR } from './validate.js';

// ─── IR Diffing ──────────────────────────────────────────────
export { diffIR } from './diff.js';

// ─── Patch Application and Composition ───────────────────────
export { applyPatch, composePatch } from './patch.js';

// ─── Version Migration ───────────────────────────────────────
export {
  registerMigration,
  migrateIR,
  clearMigrations,
} from './migrate.js';

// ─── IR Factory Helpers ──────────────────────────────────────
export { createEmptyIR } from './factory.js';
