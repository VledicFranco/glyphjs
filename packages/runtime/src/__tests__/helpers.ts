import type { Block, GlyphIR, LayoutHints, SourcePosition } from '@glyphjs/types';

/**
 * Default source position for test blocks.
 */
const defaultPosition: SourcePosition = {
  start: { line: 1, column: 1, offset: 0 },
  end: { line: 1, column: 1, offset: 0 },
};

/**
 * Creates a minimal GlyphIR document for testing.
 */
export function createTestIR(
  blocks: Block[],
  layout: LayoutHints = { mode: 'document' },
): GlyphIR {
  return {
    version: '1',
    id: 'test-doc',
    metadata: {},
    blocks,
    references: [],
    layout,
  };
}

/**
 * Creates a heading block.
 */
export function headingBlock(
  text: string,
  depth: 1 | 2 | 3 | 4 | 5 | 6 = 1,
  id = `heading-${depth}`,
): Block {
  return {
    id,
    type: 'heading',
    data: {
      depth,
      children: [{ type: 'text', value: text }],
    },
    position: defaultPosition,
  };
}

/**
 * Creates a paragraph block.
 */
export function paragraphBlock(text: string, id = 'para-1'): Block {
  return {
    id,
    type: 'paragraph',
    data: {
      children: [{ type: 'text', value: text }],
    },
    position: defaultPosition,
  };
}

/**
 * Creates a block with an arbitrary type (for fallback testing).
 */
export function unknownBlock(
  type: string,
  data: Record<string, unknown> = {},
  id = 'unknown-1',
): Block {
  return {
    id,
    type: type as Block['type'],
    data,
    position: defaultPosition,
  };
}
