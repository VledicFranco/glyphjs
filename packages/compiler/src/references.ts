import type {
  Block,
  Diagnostic,
  InlineNode,
  Reference,
} from '@glyphjs/types';
import { generateBlockId } from '@glyphjs/ir';
import { createDiagnostic } from './diagnostics.js';

// ─── Glyph Link Pattern ─────────────────────────────────────

/**
 * Matches inline links of the form `[text](#glyph:block-id)`.
 * The captured group is the block ID after the `#glyph:` prefix.
 */
const GLYPH_LINK_PREFIX = '#glyph:';

// ─── Inline Reference Scanning ──────────────────────────────

/**
 * Scan a block's inline content for `[text](#glyph:block-id)` links
 * and create Reference objects for each match.
 *
 * Returns the newly created references.
 */
export function extractInlineReferences(
  block: Block,
  documentId: string,
): Reference[] {
  const references: Reference[] = [];
  const inlineNodes = extractInlineNodes(block);

  for (const node of inlineNodes) {
    if (node.type === 'link' && node.url.startsWith(GLYPH_LINK_PREFIX)) {
      const targetBlockId = node.url.slice(GLYPH_LINK_PREFIX.length);
      if (!targetBlockId) continue;

      const label = inlineNodesToPlainText(node.children);

      const reference: Reference = {
        id: generateBlockId(documentId, 'ref', `${block.id}->${targetBlockId}`),
        type: 'navigates-to',
        sourceBlockId: block.id,
        targetBlockId,
        unresolved: true,
      };

      if (label) {
        reference.label = label;
      }

      references.push(reference);
    }
  }

  return references;
}

/**
 * Scan all blocks for inline `#glyph:` link references and collect them.
 */
export function extractAllInlineReferences(
  blocks: Block[],
  documentId: string,
): Reference[] {
  const references: Reference[] = [];

  for (const block of blocks) {
    const blockRefs = extractInlineReferences(block, documentId);
    references.push(...blockRefs);

    // Also scan children (e.g. container blocks)
    if (block.children) {
      const childRefs = extractAllInlineReferences(block.children, documentId);
      references.push(...childRefs);
    }
  }

  return references;
}

// ─── Reference Resolution ────────────────────────────────────

/**
 * Resolve references by checking if target block IDs exist in the document.
 * Marks unresolved references and adds warning diagnostics.
 *
 * Collects all block IDs including children (for container blocks).
 */
export function resolveReferences(
  references: Reference[],
  blocks: Block[],
  diagnostics: Diagnostic[],
): void {
  const blockIdSet = collectAllBlockIds(blocks);

  for (const ref of references) {
    if (blockIdSet.has(ref.targetBlockId)) {
      ref.unresolved = false;
    } else {
      ref.unresolved = true;
      diagnostics.push(
        createDiagnostic(
          'compiler',
          'warning',
          'UNRESOLVED_REFERENCE',
          `Reference target "${ref.targetBlockId}" was not found in the document.`,
        ),
      );
    }
  }
}

/**
 * Collect all block IDs from blocks and their children recursively.
 */
function collectAllBlockIds(blocks: Block[]): Set<string> {
  const ids = new Set<string>();
  for (const block of blocks) {
    ids.add(block.id);
    if (block.children) {
      for (const id of collectAllBlockIds(block.children)) {
        ids.add(id);
      }
    }
  }
  return ids;
}

// ─── Glyph-ID Uniqueness Validation ─────────────────────────

/**
 * Validate that all user-assigned glyph-ids are unique within the document.
 * Emits error diagnostics for duplicates.
 */
export function validateGlyphIdUniqueness(
  blockIdMap: Map<string, string>,
  blocks: Block[],
  diagnostics: Diagnostic[],
): void {
  // blockIdMap tracks glyphId -> blockId, but we need to detect duplicates
  // by scanning blocks for those whose id matches a glyph-id key
  const glyphIdOccurrences = new Map<string, number>();

  for (const glyphId of blockIdMap.keys()) {
    const count = countBlocksWithGlyphId(blocks, glyphId);
    glyphIdOccurrences.set(glyphId, count);
  }

  for (const [glyphId, count] of glyphIdOccurrences) {
    if (count > 1) {
      diagnostics.push(
        createDiagnostic(
          'compiler',
          'error',
          'DUPLICATE_GLYPH_ID',
          `Duplicate glyph-id "${glyphId}" found on ${String(count)} blocks. Block IDs must be unique within a document.`,
        ),
      );
    }
  }
}

/**
 * Count how many blocks in the array have a given ID (which came from a glyph-id).
 */
function countBlocksWithGlyphId(blocks: Block[], glyphId: string): number {
  let count = 0;
  for (const block of blocks) {
    if (block.id === glyphId) {
      count++;
    }
  }
  return count;
}

// ─── Inline Node Extraction Helpers ──────────────────────────

/**
 * Extract all InlineNode arrays from a block's data field.
 * Handles heading, paragraph, blockquote, and list blocks.
 */
function extractInlineNodes(block: Block): InlineNode[] {
  const data = block.data as Record<string, unknown>;
  const nodes: InlineNode[] = [];

  // Blocks with a direct `children` inline array
  if (Array.isArray(data['children'])) {
    nodes.push(...(data['children'] as InlineNode[]));
  }

  // List blocks: extract inline nodes from items
  if (Array.isArray(data['items'])) {
    for (const item of data['items'] as { children?: InlineNode[]; subList?: { items?: unknown[] } }[]) {
      if (Array.isArray(item.children)) {
        nodes.push(...item.children);
      }
    }
  }

  return nodes;
}

/**
 * Extract plain text from InlineNode[] for label purposes.
 */
function inlineNodesToPlainText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value;
        case 'inlineCode':
          return node.value;
        case 'strong':
        case 'emphasis':
        case 'delete':
          return inlineNodesToPlainText(node.children);
        case 'link':
          return inlineNodesToPlainText(node.children);
        case 'image':
          return node.alt ?? '';
        case 'break':
          return '\n';
        default:
          return '';
      }
    })
    .join('');
}
