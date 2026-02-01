// ─── Block Data Types ─────────────────────────────────────────
export type {
  InlineNode,
  HeadingData,
  ParagraphData,
  ListData,
  ListItemData,
  CodeData,
  BlockquoteData,
  ImageData,
  ThematicBreakData,
  HtmlData,
  BlockData,
} from './block-data.js';

// ─── IR Types ─────────────────────────────────────────────────
export type {
  SourcePosition,
  BlockType,
  Block,
  ReferenceType,
  Reference,
  DocumentMetadata,
  BlockLayoutOverride,
  LayoutHints,
  LayoutSemantic,
  GlyphIR,
  CompilationResult,
} from './ir.js';

// ─── AST Types ────────────────────────────────────────────────
export type {
  RawRef,
  GlyphUIBlock,
  GlyphRoot,
  MdastContentNode,
} from './ast.js';

// ─── Patch Types ──────────────────────────────────────────────
export type { GlyphPatchOperation, GlyphPatch } from './patch.js';

// ─── Migration Types ──────────────────────────────────────────
export type { IRMigration } from './migration.js';

// ─── Diagnostic Types ─────────────────────────────────────────
export type { DiagnosticSource, Diagnostic } from './diagnostic.js';

// ─── Plugin Types ─────────────────────────────────────────────
export type {
  GlyphComponentDefinition,
  GlyphComponentProps,
  ComponentType,
} from './plugin.js';

// ─── Runtime Types ────────────────────────────────────────────
export type {
  GlyphTheme,
  GlyphThemeContext,
  BlockProps,
  GlyphRuntimeConfig,
  GlyphRuntime,
} from './runtime.js';

// ─── Graph Shared Types ──────────────────────────────────────
export type { GraphNode, GraphEdge } from './graph.js';
