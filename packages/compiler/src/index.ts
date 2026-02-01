// @glyphjs/compiler — barrel file

// ─── Main Compile Function ───────────────────────────────────
export { compile } from './compile.js';
export type { CompileOptions } from './compile.js';

// ─── Diagnostic Helpers ──────────────────────────────────────
export {
  createDiagnostic,
  createSchemaError,
  createUnknownComponentInfo,
  createYamlError,
} from './diagnostics.js';

// ─── Inline Conversion ──────────────────────────────────────
export { convertPhrasingContent } from './inline.js';

// ─── AST-to-IR Translation ──────────────────────────────────
export { translateNode } from './ast-to-ir.js';
export type { TranslationContext } from './ast-to-ir.js';
