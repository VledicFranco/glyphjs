import type { Block, DocumentMetadata, LayoutHints, Reference } from './ir.js';

// ─── Patch Operations ─────────────────────────────────────────

export type GlyphPatchOperation =
  | { op: 'addBlock'; block: Block; afterBlockId?: string }
  | { op: 'removeBlock'; blockId: string }
  | { op: 'updateBlock'; blockId: string; data: Partial<Block> }
  | { op: 'moveBlock'; blockId: string; afterBlockId?: string }
  | { op: 'addReference'; reference: Reference }
  | { op: 'removeReference'; referenceId: string }
  | { op: 'updateMetadata'; metadata: Partial<DocumentMetadata> }
  | { op: 'updateLayout'; layout: Partial<LayoutHints> };

export type GlyphPatch = GlyphPatchOperation[];
