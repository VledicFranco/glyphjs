import type { Block, GlyphIR, Diagnostic, Reference, SourcePosition } from '@glyphjs/types';

const DEFAULT_POSITION: SourcePosition = {
  start: { line: 1, column: 1 },
  end: { line: 1, column: 1 },
};

export function createTestBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-block-001',
    type: 'paragraph',
    data: { children: [{ type: 'text', value: 'Test paragraph' }] },
    position: DEFAULT_POSITION,
    ...overrides,
  };
}

export function createTestIR(overrides?: Partial<GlyphIR>): GlyphIR {
  return {
    version: '1',
    id: 'test-doc-001',
    metadata: { title: 'Test Document' },
    blocks: [],
    references: [],
    layout: { mode: 'document' },
    ...overrides,
  };
}

export function createTestDiagnostic(overrides?: Partial<Diagnostic>): Diagnostic {
  return {
    source: 'compiler',
    severity: 'error',
    code: 'TEST_ERROR',
    message: 'Test diagnostic',
    position: DEFAULT_POSITION,
    ...overrides,
  };
}

export function createTestReference(overrides?: Partial<Reference>): Reference {
  return {
    id: 'test-ref-001',
    sourceBlockId: 'block-001',
    targetBlockId: 'block-002',
    type: 'navigates-to',
    ...overrides,
  };
}
