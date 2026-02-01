/**
 * Property-based tests for IR diff/patch operations.
 *
 * These tests verify the core algebraic properties of the patch system:
 * - Roundtrip: applyPatch(a, diffIR(a, b)) deep-equals b
 * - Identity: applyPatch(ir, []) returns ir unchanged
 * - Associativity: composePatch(composePatch(a, b), c) === composePatch(a, composePatch(b, c))
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { diffIR, applyPatch, composePatch, createEmptyIR } from '../index.js';
import { arbGlyphIR, arbGlyphIRPair } from './arbitraries.js';
import type { GlyphIR, GlyphPatch } from '@glyphjs/types';

// ─── Deep-equality helper that ignores key ordering ──────────

function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = normalize(obj[key]);
    }
    return sorted;
  }
  return value;
}

function deepEqualNormalized(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

// ─── Roundtrip Property ──────────────────────────────────────

describe('diffIR / applyPatch roundtrip', () => {
  it('applyPatch(a, diffIR(a, b)) deep-equals b', () => {
    fc.assert(
      fc.property(arbGlyphIRPair, ([a, b]) => {
        const patch = diffIR(a, b);
        const result = applyPatch(a, patch);

        // The result should have the same blocks, references, metadata, layout
        expect(result.version).toBe(b.version);
        expect(result.id).toBe(b.id);
        expect(deepEqualNormalized(result.metadata, b.metadata)).toBe(true);
        expect(deepEqualNormalized(result.layout, b.layout)).toBe(true);

        // Blocks: same IDs in same order, same content
        expect(result.blocks.map((bl) => bl.id)).toEqual(
          b.blocks.map((bl) => bl.id),
        );
        for (let i = 0; i < b.blocks.length; i++) {
          expect(deepEqualNormalized(result.blocks[i], b.blocks[i])).toBe(
            true,
          );
        }

        // References: same set (order may vary from add operations)
        const resultRefIds = result.references
          .map((r) => r.id)
          .sort();
        const bRefIds = b.references.map((r) => r.id).sort();
        expect(resultRefIds).toEqual(bRefIds);
      }),
      { numRuns: 200, seed: 42 },
    );
  });
});

// ─── Identity Property ───────────────────────────────────────

describe('applyPatch identity', () => {
  it('applyPatch(ir, []) returns ir unchanged', () => {
    fc.assert(
      fc.property(arbGlyphIR, (ir) => {
        const emptyPatch: GlyphPatch = [];
        const result = applyPatch(ir, emptyPatch);

        // Identity: result is referentially the same object
        expect(result).toBe(ir);
      }),
      { numRuns: 200, seed: 42 },
    );
  });

  it('diffIR(ir, ir) produces an empty patch', () => {
    fc.assert(
      fc.property(arbGlyphIR, (ir) => {
        const patch = diffIR(ir, ir);
        expect(patch).toEqual([]);
      }),
      { numRuns: 200, seed: 42 },
    );
  });
});

// ─── Associativity Property ──────────────────────────────────

describe('composePatch associativity', () => {
  it(
    'composePatch(composePatch(a, b), c) equals composePatch(a, composePatch(b, c))',
    () => {
      // We generate three IR documents and derive patches between them,
      // then verify that composition is associative.
      fc.assert(
        fc.property(
          arbGlyphIR,
          arbGlyphIR,
          arbGlyphIR,
          (irA, irB, irC) => {
            // Normalize ids/versions so diffs are meaningful
            const b = { ...irB, id: irA.id, version: irA.version };
            const c = { ...irC, id: irA.id, version: irA.version };

            const patchAB = diffIR(irA, b);
            const patchBC = diffIR(b, c);

            // Also create a third patch from a fresh pair
            const patchAC = diffIR(irA, c);

            // Associativity of compose: (a . b) . c === a . (b . c)
            const leftAssoc = composePatch(
              composePatch(patchAB, patchBC),
              patchAC,
            );
            const rightAssoc = composePatch(
              patchAB,
              composePatch(patchBC, patchAC),
            );

            // Since composePatch is concatenation, these should be identical
            expect(leftAssoc).toEqual(rightAssoc);
          },
        ),
        { numRuns: 200, seed: 42 },
      );
    },
    30_000,
  );

  it(
    'composePatch of two patches applied is same as sequential application',
    () => {
      fc.assert(
        fc.property(arbGlyphIR, arbGlyphIR, arbGlyphIR, (irA, irB, irC) => {
          const b = { ...irB, id: irA.id, version: irA.version };
          const c = { ...irC, id: irA.id, version: irA.version };

          const patchAB = diffIR(irA, b);
          const patchBC = diffIR(b, c);

          const composed = composePatch(patchAB, patchBC);

          // Apply composed patch in one go
          const resultComposed = applyPatch(irA, composed);

          // Apply sequentially
          const intermediate = applyPatch(irA, patchAB);
          const resultSequential = applyPatch(intermediate, patchBC);

          // Both should produce same blocks
          expect(resultComposed.blocks.map((bl) => bl.id)).toEqual(
            resultSequential.blocks.map((bl) => bl.id),
          );
        }),
        { numRuns: 200, seed: 42 },
      );
    },
    30_000,
  );
});

// ─── Edge Cases ──────────────────────────────────────────────

describe('edge cases', () => {
  it('diffIR on empty documents produces empty patch', () => {
    const a = createEmptyIR('test-doc');
    const b = createEmptyIR('test-doc');
    const patch = diffIR(a, b);
    expect(patch).toEqual([]);
  });

  it('roundtrip works for empty → non-empty document', () => {
    fc.assert(
      fc.property(arbGlyphIR, (ir) => {
        const empty: GlyphIR = {
          ...createEmptyIR(ir.id),
          version: ir.version,
        };
        const patch = diffIR(empty, ir);
        const result = applyPatch(empty, patch);

        expect(result.blocks.map((bl) => bl.id)).toEqual(
          ir.blocks.map((bl) => bl.id),
        );
        expect(deepEqualNormalized(result.metadata, ir.metadata)).toBe(true);
        expect(deepEqualNormalized(result.layout, ir.layout)).toBe(true);
      }),
      { numRuns: 50, seed: 42 },
    );
  });
});
