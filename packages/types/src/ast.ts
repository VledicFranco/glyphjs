import type { SourcePosition } from './ir.js';

// ─── Raw Reference (from Markdown YAML) ──────────────────────

export interface RawRef {
  target: string;
  type?: string;
  label?: string;
  sourceAnchor?: string;
  targetAnchor?: string;
  bidirectional?: boolean;
}

// ─── Glyph UI Block AST Node ─────────────────────────────────

export interface GlyphUIBlock {
  type: 'glyphUIBlock';
  componentType: string;
  rawYaml: string;
  parsedData: Record<string, unknown> | null;
  yamlError?: string;
  glyphId?: string;
  refs?: RawRef[];
  position: SourcePosition;
}

// ─── Glyph Root (Extended MDAST) ─────────────────────────────

/**
 * The Glyph AST root node. Extends the standard MDAST Root
 * with GlyphUIBlock nodes mixed into the children array.
 *
 * We use a structural type rather than extending MdastRoot directly
 * to avoid a hard dependency on @types/mdast in this package.
 */
export interface GlyphRoot {
  type: 'root';
  children: (GlyphUIBlock | MdastContentNode)[];
}

/**
 * Represents any standard MDAST content node.
 * This is a loose type — the actual MDAST types are richer,
 * but we only need this for the union in GlyphRoot.
 */
export interface MdastContentNode {
  type: string;
  children?: unknown[];
  value?: string;
  position?: SourcePosition;
  [key: string]: unknown;
}
