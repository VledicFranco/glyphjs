/**
 * fast-check arbitraries for GlyphIR types.
 *
 * Each arbitrary produces structurally valid objects that conform
 * to the types defined in @glyphjs/types.
 */
import fc from 'fast-check';
import type {
  Block,
  BlockType,
  Reference,
  ReferenceType,
  SourcePosition,
  GlyphIR,
  DocumentMetadata,
  LayoutHints,
  BlockData,
} from '@glyphjs/types';

// ─── Helpers ──────────────────────────────────────────────────

/** Non-empty alphanumeric string (1-20 chars) using stringMatching (fc v4). */
const nonEmptyAlphaNum: fc.Arbitrary<string> = fc.stringMatching(
  /^[a-z0-9]{1,20}$/,
);

/** A hexadecimal string of fixed length, prefixed. */
function prefixedHex(prefix: string, hexLen: number): fc.Arbitrary<string> {
  // Build a regex like /^[0-9a-f]{12}$/
  const pattern = new RegExp(`^[0-9a-f]{${hexLen}}$`);
  return fc.stringMatching(pattern).map((hex) => `${prefix}${hex}`);
}

// ─── Source Position ──────────────────────────────────────────

export const arbSourcePosition: fc.Arbitrary<SourcePosition> = fc.record({
  start: fc.record({
    line: fc.integer({ min: 1, max: 5000 }),
    column: fc.integer({ min: 0, max: 500 }),
  }),
  end: fc.record({
    line: fc.integer({ min: 1, max: 5000 }),
    column: fc.integer({ min: 0, max: 500 }),
  }),
});

// ─── Block Types ──────────────────────────────────────────────

const standardBlockTypes: BlockType[] = [
  'heading',
  'paragraph',
  'list',
  'code',
  'blockquote',
  'thematic-break',
  'image',
  'html',
];

const uiBlockTypes: BlockType[] = [
  'ui:graph',
  'ui:table',
  'ui:chart',
  'ui:relation',
  'ui:timeline',
  'ui:callout',
  'ui:tabs',
  'ui:steps',
];

export const arbBlockType: fc.Arbitrary<BlockType> = fc.constantFrom(
  ...standardBlockTypes,
  ...uiBlockTypes,
);

// ─── Block Data ───────────────────────────────────────────────

/**
 * Generates a minimal valid BlockData as a plain record.
 * We use Record<string, unknown> (which is part of the BlockData union)
 * to keep arbitraries simple while still being structurally valid.
 */
export const arbBlockData: fc.Arbitrary<BlockData> = fc.oneof(
  // ParagraphData-like
  fc.record({
    children: fc.constant([{ type: 'text' as const, value: 'hello' }]),
  }),
  // CodeData-like
  fc.record({
    language: fc.constantFrom('ts', 'js', 'python', 'rust'),
    value: fc.string({ minLength: 0, maxLength: 100 }),
  }),
  // ThematicBreakData (empty)
  fc.constant({} as BlockData),
  // Generic record
  fc.dictionary(
    nonEmptyAlphaNum,
    fc.oneof(fc.string({ maxLength: 20 }), fc.integer(), fc.boolean()),
    { minKeys: 0, maxKeys: 4 },
  ),
);

// ─── Block ────────────────────────────────────────────────────

export const arbBlockId: fc.Arbitrary<string> = prefixedHex('b-', 12);

export const arbBlock: fc.Arbitrary<Block> = fc
  .record({
    id: arbBlockId,
    type: arbBlockType,
    data: arbBlockData,
    position: arbSourcePosition,
  })
  .map((b) => b as Block);

/**
 * Generate a list of blocks with unique IDs.
 * Uses a Set to filter duplicates from random generation.
 */
export function arbUniqueBlocks(
  min = 0,
  max = 6,
): fc.Arbitrary<Block[]> {
  return fc
    .array(arbBlock, { minLength: min, maxLength: max + 4 })
    .map((blocks) => {
      const seen = new Set<string>();
      const unique: Block[] = [];
      for (const block of blocks) {
        if (!seen.has(block.id)) {
          seen.add(block.id);
          unique.push(block);
        }
      }
      return unique.slice(0, max);
    })
    .filter((blocks) => blocks.length >= min);
}

// ─── Reference Types ──────────────────────────────────────────

const referenceTypes: ReferenceType[] = [
  'navigates-to',
  'details',
  'depends-on',
  'data-source',
];

export const arbReferenceType: fc.Arbitrary<ReferenceType> =
  fc.constantFrom(...referenceTypes);

// ─── Reference ────────────────────────────────────────────────

/**
 * Generates a Reference whose source and target block IDs are
 * drawn from the given set of block IDs to ensure validity.
 */
export function arbReference(blockIds: string[]): fc.Arbitrary<Reference> {
  if (blockIds.length < 2) {
    // Need at least 2 distinct blocks for a meaningful reference
    return fc.constant({
      id: 'ref-placeholder',
      type: 'navigates-to' as ReferenceType,
      sourceBlockId: blockIds[0] ?? 'b-000000000000',
      targetBlockId: blockIds[1] ?? blockIds[0] ?? 'b-000000000001',
    });
  }

  const arbBlockIdFromList = fc.constantFrom(...blockIds);

  return fc.record({
    id: prefixedHex('ref-', 8),
    type: arbReferenceType,
    sourceBlockId: arbBlockIdFromList,
    targetBlockId: arbBlockIdFromList,
  });
}

/**
 * Generates references valid for the given list of block IDs.
 */
export function arbReferences(
  blockIds: string[],
  max = 4,
): fc.Arbitrary<Reference[]> {
  if (blockIds.length < 2) return fc.constant([]);

  return fc.array(arbReference(blockIds), {
    minLength: 0,
    maxLength: max,
  });
}

// ─── Document Metadata ────────────────────────────────────────

export const arbDocumentMetadata: fc.Arbitrary<DocumentMetadata> = fc.record(
  {
    title: fc.string({ minLength: 0, maxLength: 50 }),
    tags: fc.array(nonEmptyAlphaNum, { minLength: 0, maxLength: 3 }),
  },
  { requiredKeys: [] },
);

// ─── Layout Hints ─────────────────────────────────────────────

export const arbLayoutHints: fc.Arbitrary<LayoutHints> = fc.record({
  mode: fc.constantFrom(
    'document' as const,
    'dashboard' as const,
    'presentation' as const,
  ),
  spacing: fc.constantFrom(
    'compact' as const,
    'normal' as const,
    'relaxed' as const,
  ),
});

// ─── GlyphIR ─────────────────────────────────────────────────

/**
 * Generates a structurally valid GlyphIR document.
 *
 * - Blocks have unique IDs
 * - References point to existing block IDs
 * - Version is a valid semver-like string
 * - Layout mode is one of the valid values
 */
export const arbGlyphIR: fc.Arbitrary<GlyphIR> = arbUniqueBlocks(0, 6)
  .chain((blocks) => {
    const blockIds = blocks.map((b) => b.id);
    return fc.tuple(
      fc.constant(blocks),
      arbReferences(blockIds, 4),
      arbDocumentMetadata,
      arbLayoutHints,
      prefixedHex('doc-', 16),
    );
  })
  .map(([blocks, references, metadata, layout, id]) => ({
    version: '1.0.0',
    id,
    metadata,
    blocks,
    references,
    layout,
  }));

/**
 * Generates a pair of valid GlyphIR documents that share the same
 * id and version (simulating two snapshots of the same document).
 */
export const arbGlyphIRPair: fc.Arbitrary<[GlyphIR, GlyphIR]> = fc
  .tuple(arbGlyphIR, arbGlyphIR)
  .map(([a, b]) => [a, { ...b, id: a.id, version: a.version }]);
