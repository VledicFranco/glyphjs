/**
 * Unit tests for validateIR.
 */
import { describe, it, expect } from 'vitest';
import { validateIR, createEmptyIR } from '../index.js';
import type { GlyphIR, Block, Reference } from '@glyphjs/types';

// ─── Helpers ──────────────────────────────────────────────────

function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: 'b-000000000001',
    type: 'paragraph',
    data: { children: [{ type: 'text', value: 'hello' }] },
    position: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
    ...overrides,
  };
}

function makeReference(overrides: Partial<Reference> = {}): Reference {
  return {
    id: 'ref-00000001',
    type: 'navigates-to',
    sourceBlockId: 'b-000000000001',
    targetBlockId: 'b-000000000002',
    ...overrides,
  };
}

function makeIR(overrides: Partial<GlyphIR> = {}): GlyphIR {
  return {
    ...createEmptyIR('test-doc'),
    ...overrides,
  };
}

// ─── Valid IR ─────────────────────────────────────────────────

describe('validateIR', () => {
  it('returns no diagnostics for a valid empty IR', () => {
    const ir = createEmptyIR('my-doc');
    const diagnostics = validateIR(ir);
    expect(diagnostics).toEqual([]);
  });

  it('returns no diagnostics for a valid IR with blocks and references', () => {
    const blockA = makeBlock({ id: 'b-aaa000000001' });
    const blockB = makeBlock({ id: 'b-bbb000000002', type: 'heading' });
    const ref = makeReference({
      sourceBlockId: blockA.id,
      targetBlockId: blockB.id,
    });
    const ir = makeIR({
      blocks: [blockA, blockB],
      references: [ref],
    });

    const diagnostics = validateIR(ir);
    expect(diagnostics).toEqual([]);
  });

  // ─── Missing version ───────────────────────────────────────

  it('reports diagnostic for missing version', () => {
    const ir = makeIR({ version: '' });
    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'IR_MISSING_VERSION',
      }),
    );
  });

  it('reports diagnostic when version is not a string', () => {
    const ir = makeIR({ version: undefined as unknown as string });
    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'IR_MISSING_VERSION',
      }),
    );
  });

  // ─── Missing id ────────────────────────────────────────────

  it('reports diagnostic for missing document id', () => {
    const ir = makeIR({ id: '' });
    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'IR_MISSING_ID',
      }),
    );
  });

  // ─── Duplicate block IDs ───────────────────────────────────

  it('reports diagnostic for duplicate block IDs', () => {
    const blockA = makeBlock({ id: 'b-duplicate0001' });
    const blockB = makeBlock({ id: 'b-duplicate0001' });
    const ir = makeIR({ blocks: [blockA, blockB] });

    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'BLOCK_DUPLICATE_ID',
      }),
    );
  });

  it('reports one diagnostic per duplicate (not per pair)', () => {
    const blocks = [
      makeBlock({ id: 'b-dup000000001' }),
      makeBlock({ id: 'b-dup000000001' }),
      makeBlock({ id: 'b-dup000000001' }),
    ];
    const ir = makeIR({ blocks });

    const diagnostics = validateIR(ir);
    const dupDiags = diagnostics.filter(
      (d) => d.code === 'BLOCK_DUPLICATE_ID',
    );
    // Two duplicates: second and third occurrence
    expect(dupDiags).toHaveLength(2);
  });

  // ─── Invalid reference targets ─────────────────────────────

  it('reports diagnostic for reference with missing source block', () => {
    const block = makeBlock({ id: 'b-exists000001' });
    const ref = makeReference({
      sourceBlockId: 'b-nonexistent01',
      targetBlockId: block.id,
    });
    const ir = makeIR({ blocks: [block], references: [ref] });

    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'REF_MISSING_SOURCE',
      }),
    );
  });

  it('reports diagnostic for reference with missing target block', () => {
    const block = makeBlock({ id: 'b-exists000001' });
    const ref = makeReference({
      sourceBlockId: block.id,
      targetBlockId: 'b-nonexistent01',
    });
    const ir = makeIR({ blocks: [block], references: [ref] });

    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'REF_MISSING_TARGET',
      }),
    );
  });

  it('reports diagnostics for both missing source and target', () => {
    const ref = makeReference({
      sourceBlockId: 'b-ghost0000001',
      targetBlockId: 'b-ghost0000002',
    });
    const ir = makeIR({ references: [ref] });

    const diagnostics = validateIR(ir);
    const refDiags = diagnostics.filter(
      (d) => d.code === 'REF_MISSING_SOURCE' || d.code === 'REF_MISSING_TARGET',
    );
    expect(refDiags).toHaveLength(2);
  });

  // ─── Block missing required fields ─────────────────────────

  it('reports diagnostic for block missing id', () => {
    const block = makeBlock({ id: '' });
    const ir = makeIR({ blocks: [block] });
    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'BLOCK_MISSING_ID',
      }),
    );
  });

  it('reports diagnostic for block missing type', () => {
    const block = makeBlock({ type: '' as Block['type'] });
    const ir = makeIR({ blocks: [block] });
    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'BLOCK_MISSING_TYPE',
      }),
    );
  });

  it('reports diagnostic for block missing data', () => {
    const block = makeBlock({ data: null as unknown as Block['data'] });
    const ir = makeIR({ blocks: [block] });
    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'BLOCK_MISSING_DATA',
      }),
    );
  });

  it('reports diagnostic for block missing position', () => {
    const block = makeBlock({
      position: undefined as unknown as Block['position'],
    });
    const ir = makeIR({ blocks: [block] });
    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'BLOCK_MISSING_POSITION',
      }),
    );
  });

  // ─── Invalid layout mode ───────────────────────────────────

  it('reports diagnostic for invalid layout mode', () => {
    const ir = makeIR({
      layout: { mode: 'invalid-mode' as LayoutHints['mode'] },
    });
    const diagnostics = validateIR(ir);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'LAYOUT_INVALID_MODE',
      }),
    );
  });

  it('accepts all valid layout modes', () => {
    for (const mode of ['document', 'dashboard', 'presentation'] as const) {
      const ir = makeIR({ layout: { mode } });
      const diagnostics = validateIR(ir);
      const layoutDiags = diagnostics.filter(
        (d) => d.code === 'LAYOUT_INVALID_MODE',
      );
      expect(layoutDiags).toEqual([]);
    }
  });
});
