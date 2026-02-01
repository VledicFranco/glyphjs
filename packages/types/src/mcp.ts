import type { DocumentMetadata, GlyphIR, LayoutHints, ReferenceType } from './ir.js';
import type { GlyphPatch } from './patch.js';

// ─── MCP Session Types ────────────────────────────────────────

/**
 * Represents an active MCP editing session.
 *
 * An MCP session tracks an LLM's interaction with a single Glyph IR document.
 * Sessions persist across tool invocations and are committed back to Markdown
 * via the `glyph_commit` tool. Patches applied within a session are logged
 * for auditability and undo support.
 */
export interface MCPSession {
  /** Unique identifier for this editing session. */
  sessionId: string;

  /** The ID of the Glyph IR document being edited in this session. */
  documentId: string;

  /** ISO 8601 timestamp of when the session was created. */
  createdAt: string;

  /** ISO 8601 timestamp of the most recent modification in this session. */
  lastModified: string;
}

// ─── MCP Tool Input/Output Types ──────────────────────────────

/**
 * Input for the `glyph_create_document` tool.
 *
 * Creates a new Glyph IR document with optional metadata and layout hints.
 * If no metadata or layout is provided, sensible defaults are used
 * (empty metadata and `{ mode: 'document', spacing: 'normal' }` layout).
 */
export interface MCPCreateDocumentInput {
  /** Optional document metadata (title, description, authors, tags, etc.). */
  metadata?: Partial<DocumentMetadata>;

  /** Optional layout hints for the document (mode, columns, spacing, etc.). */
  layout?: Partial<LayoutHints>;
}

/**
 * Output from the `glyph_create_document` tool.
 *
 * Returns the newly created document's ID and the full initial IR.
 */
export interface MCPCreateDocumentOutput {
  /** The unique identifier assigned to the new document. */
  documentId: string;

  /** The full Glyph IR of the newly created document. */
  ir: GlyphIR;
}

/**
 * Input for the `glyph_add_block` tool.
 *
 * Adds a new block to an existing document. The block type can be any valid
 * {@link import('./ir.js').BlockType}, including standard Markdown types
 * (e.g., `'heading'`, `'paragraph'`) and UI component types (e.g., `'ui:graph'`).
 */
export interface MCPAddBlockInput {
  /** The ID of the document to add the block to. */
  documentId: string;

  /** The block type (e.g., `'heading'`, `'paragraph'`, `'ui:graph'`, `'ui:table'`). */
  type: string;

  /** The block's data payload, whose shape depends on the block type. */
  data: Record<string, unknown>;

  /**
   * Optional ID of an existing block after which to insert the new block.
   * If omitted, the block is appended at the end of the document.
   */
  afterBlockId?: string;
}

/**
 * Output from the `glyph_add_block` tool.
 *
 * Returns the generated block ID and the updated full IR.
 */
export interface MCPAddBlockOutput {
  /** The unique identifier assigned to the newly created block. */
  blockId: string;

  /** The full Glyph IR after the block has been added. */
  ir: GlyphIR;
}

/**
 * Input for the `glyph_update_block` tool.
 *
 * Updates an existing block's data payload with a partial merge.
 * Only the specified fields in `data` are updated; unspecified fields
 * retain their current values.
 */
export interface MCPUpdateBlockInput {
  /** The ID of the document containing the block. */
  documentId: string;

  /** The ID of the block to update. */
  blockId: string;

  /** Partial data to merge into the block's existing data payload. */
  data: Partial<Record<string, unknown>>;
}

/**
 * Output from the `glyph_update_block` tool.
 *
 * Returns the full IR after the block has been updated.
 */
export interface MCPUpdateBlockOutput {
  /** The full Glyph IR after the block has been updated. */
  ir: GlyphIR;
}

/**
 * Input for the `glyph_remove_block` tool.
 *
 * Removes a block from a document. Any references pointing to or from
 * the removed block are also cleaned up.
 */
export interface MCPRemoveBlockInput {
  /** The ID of the document containing the block. */
  documentId: string;

  /** The ID of the block to remove. */
  blockId: string;
}

/**
 * Output from the `glyph_remove_block` tool.
 *
 * Returns the full IR after the block has been removed.
 */
export interface MCPRemoveBlockOutput {
  /** The full Glyph IR after the block has been removed. */
  ir: GlyphIR;
}

/**
 * Input for the `glyph_add_node` tool.
 *
 * Adds a node to a graph or relation block (e.g., `ui:graph`, `ui:relation`).
 * The target block must be a graph-like component that supports a `nodes` array.
 */
export interface MCPAddNodeInput {
  /** The ID of the document containing the block. */
  documentId: string;

  /** The ID of the graph or relation block to add the node to. */
  blockId: string;

  /** The node definition to add to the block's node list. */
  node: {
    /** Unique identifier for the node within the block. */
    id: string;
    /** Display label for the node. */
    label: string;
    /** Optional semantic type (e.g., `'service'`, `'database'`, `'entity'`). */
    type?: string;
    /** Optional grouping/clustering key for layout. */
    group?: string;
  };
}

/**
 * Output from the `glyph_add_node` tool.
 *
 * Returns the full IR after the node has been added to the block.
 */
export interface MCPAddNodeOutput {
  /** The full Glyph IR after the node has been added. */
  ir: GlyphIR;
}

/**
 * Input for the `glyph_add_edge` tool.
 *
 * Adds an edge between two nodes in a graph or relation block.
 * Both the source and target nodes must already exist in the block.
 */
export interface MCPAddEdgeInput {
  /** The ID of the document containing the block. */
  documentId: string;

  /** The ID of the graph or relation block to add the edge to. */
  blockId: string;

  /** The edge definition connecting two nodes in the block. */
  edge: {
    /** The ID of the source node. */
    from: string;
    /** The ID of the target node. */
    to: string;
    /** Optional display label for the edge. */
    label?: string;
    /** Optional semantic type (e.g., `'depends-on'`, `'has-many'`). */
    type?: string;
  };
}

/**
 * Output from the `glyph_add_edge` tool.
 *
 * Returns the full IR after the edge has been added to the block.
 */
export interface MCPAddEdgeOutput {
  /** The full Glyph IR after the edge has been added. */
  ir: GlyphIR;
}

/**
 * Input for the `glyph_link_entities` tool.
 *
 * Creates a cross-block {@link import('./ir.js').Reference} between two blocks,
 * enabling relational navigation in the rendered document.
 */
export interface MCPLinkEntitiesInput {
  /** The ID of the document containing both blocks. */
  documentId: string;

  /** The ID of the source block for the reference. */
  sourceBlockId: string;

  /** The ID of the target block for the reference. */
  targetBlockId: string;

  /**
   * Optional reference type. Defaults to `'navigates-to'` if omitted.
   * @see {@link ReferenceType}
   */
  type?: string;

  /** Optional human-readable label describing the relationship. */
  label?: string;

  /** Whether the reference is bidirectional. Defaults to `false`. */
  bidirectional?: boolean;
}

/**
 * Output from the `glyph_link_entities` tool.
 *
 * Returns the generated reference ID and the updated full IR.
 */
export interface MCPLinkEntitiesOutput {
  /** The unique identifier assigned to the newly created reference. */
  referenceId: string;

  /** The full Glyph IR after the reference has been created. */
  ir: GlyphIR;
}

/**
 * Input for the `glyph_patch` tool.
 *
 * Applies a {@link GlyphPatch} (a sequence of block-level operations) to
 * an existing document. This is the most flexible mutation tool, supporting
 * all patch operations defined in the Glyph patch format (add, remove,
 * update, move blocks; add/remove references; update metadata/layout).
 */
export interface MCPPatchInput {
  /** The ID of the document to apply the patch to. */
  documentId: string;

  /** The patch to apply, consisting of one or more ordered operations. */
  patch: GlyphPatch;
}

/**
 * Output from the `glyph_patch` tool.
 *
 * Returns the full IR after the patch has been applied.
 */
export interface MCPPatchOutput {
  /** The full Glyph IR after the patch has been applied. */
  ir: GlyphIR;
}

/**
 * Input for the `glyph_commit` tool.
 *
 * Serializes the current IR state of a document back into canonical
 * Markdown source. This is the final step in an MCP editing session,
 * producing a Markdown file that can be committed to version control.
 */
export interface MCPCommitInput {
  /** The ID of the document to serialize back to Markdown. */
  documentId: string;
}

/**
 * Output from the `glyph_commit` tool.
 *
 * Returns the canonical Markdown representation of the document's current IR.
 */
export interface MCPCommitOutput {
  /** The serialized Markdown string representing the document. */
  markdown: string;
}

// ─── MCP Tool Registry Type ──────────────────────────────────

/**
 * Defines the shape of an MCP tool registration entry.
 *
 * Each MCP tool exposes a `name`, human-readable `description`,
 * and typed `input`/`output` contracts. This type is used to build
 * a type-safe registry of all available Glyph MCP tools.
 *
 * @typeParam TInput - The tool's input type (e.g., {@link MCPAddBlockInput}).
 * @typeParam TOutput - The tool's output type (e.g., {@link MCPAddBlockOutput}).
 */
export interface MCPToolDefinition<TInput, TOutput> {
  /** The tool name as exposed via MCP (e.g., `'glyph_create_document'`). */
  name: string;

  /** Human-readable description of what the tool does. */
  description: string;

  /** The typed input contract for this tool. */
  input: TInput;

  /** The typed output contract for this tool. */
  output: TOutput;
}
