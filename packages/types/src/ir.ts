import type { BlockData } from './block-data.js';
import type { Diagnostic } from './diagnostic.js';

// ─── Source Position ─────────────────────────────────────────

export interface SourcePosition {
  start: { line: number; column: number; offset?: number };
  end: { line: number; column: number; offset?: number };
}

// ─── Block Types ─────────────────────────────────────────────

export type BlockType =
  // Standard Markdown blocks
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'code'
  | 'blockquote'
  | 'thematic-break'
  | 'image'
  | 'html'
  // Glyph UI component blocks
  | 'ui:graph'
  | 'ui:table'
  | 'ui:chart'
  | 'ui:relation'
  | 'ui:timeline'
  | 'ui:callout'
  | 'ui:tabs'
  | 'ui:steps'
  | 'ui:kpi'
  | 'ui:accordion'
  | 'ui:comparison'
  | 'ui:codediff'
  | 'ui:flowchart'
  | 'ui:filetree'
  // Extensible
  | `ui:${string}`;

// ─── Block ───────────────────────────────────────────────────

export interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
  position: SourcePosition;
  children?: Block[];
  diagnostics?: Diagnostic[];
  metadata?: Record<string, unknown>;
}

// ─── Reference ───────────────────────────────────────────────

export type ReferenceType =
  | 'navigates-to'
  | 'details'
  | 'depends-on'
  | 'data-source'
  | `custom:${string}`;

export interface Reference {
  id: string;
  type: ReferenceType;
  sourceBlockId: string;
  targetBlockId: string;
  sourceAnchor?: string;
  targetAnchor?: string;
  label?: string;
  bidirectional?: boolean;
  unresolved?: boolean;
}

// ─── Document Metadata ───────────────────────────────────────

export interface DocumentMetadata {
  title?: string;
  description?: string;
  authors?: string[];
  createdAt?: string;
  sourceFile?: string;
  tags?: string[];
}

// ─── Layout ──────────────────────────────────────────────────

export interface BlockLayoutOverride {
  gridColumn?: string;
  gridRow?: string;
  span?: number;
}

export interface LayoutHints {
  mode: 'document' | 'dashboard' | 'presentation';
  columns?: number;
  maxWidth?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
  blockLayout?: Record<string, BlockLayoutOverride>;
}

export type LayoutSemantic = 'top-down' | 'left-right' | 'bottom-up' | 'radial' | 'force';

// ─── Document Root ───────────────────────────────────────────

export interface GlyphIR {
  version: string;
  id: string;
  metadata: DocumentMetadata;
  blocks: Block[];
  references: Reference[];
  layout: LayoutHints;
}

// ─── Compilation Result ──────────────────────────────────────

export interface CompilationResult {
  ir: GlyphIR;
  diagnostics: Diagnostic[];
  hasErrors: boolean;
}
