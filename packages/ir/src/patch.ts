import type {
  Block,
  GlyphIR,
  GlyphPatch,
  GlyphPatchOperation,
  LayoutHints,
} from '@glyphjs/types';

// ─── Deep Clone ──────────────────────────────────────────────

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ─── Single Operation Application ────────────────────────────

function applyOperation(ir: GlyphIR, op: GlyphPatchOperation): GlyphIR {
  switch (op.op) {
    case 'addBlock': {
      const blocks = [...ir.blocks];
      if (op.afterBlockId) {
        const idx = blocks.findIndex((b) => b.id === op.afterBlockId);
        if (idx !== -1) {
          blocks.splice(idx + 1, 0, deepClone(op.block));
        } else {
          // afterBlockId not found — append at end
          blocks.push(deepClone(op.block));
        }
      } else {
        // No afterBlockId — insert at beginning
        blocks.unshift(deepClone(op.block));
      }
      return { ...ir, blocks };
    }

    case 'removeBlock': {
      const blocks = ir.blocks.filter((b) => b.id !== op.blockId);
      return { ...ir, blocks };
    }

    case 'updateBlock': {
      const blocks = ir.blocks.map((b) => {
        if (b.id !== op.blockId) return b;
        const updated: Block = { ...b };
        if (op.data.type !== undefined) updated.type = op.data.type;
        if (op.data.data !== undefined) updated.data = deepClone(op.data.data);
        if (op.data.position !== undefined)
          updated.position = deepClone(op.data.position);
        if (op.data.children !== undefined)
          updated.children = deepClone(op.data.children);
        if (op.data.diagnostics !== undefined)
          updated.diagnostics = deepClone(op.data.diagnostics);
        if (op.data.metadata !== undefined)
          updated.metadata = deepClone(op.data.metadata);
        return updated;
      });
      return { ...ir, blocks };
    }

    case 'moveBlock': {
      const blockToMove = ir.blocks.find((b) => b.id === op.blockId);
      if (!blockToMove) return ir;
      // Remove the block from its current position
      const blocks = ir.blocks.filter((b) => b.id !== op.blockId);
      // Insert at new position
      if (op.afterBlockId) {
        const idx = blocks.findIndex((b) => b.id === op.afterBlockId);
        if (idx !== -1) {
          blocks.splice(idx + 1, 0, blockToMove);
        } else {
          blocks.push(blockToMove);
        }
      } else {
        // No afterBlockId — move to beginning
        blocks.unshift(blockToMove);
      }
      return { ...ir, blocks };
    }

    case 'addReference': {
      return {
        ...ir,
        references: [...ir.references, deepClone(op.reference)],
      };
    }

    case 'removeReference': {
      return {
        ...ir,
        references: ir.references.filter((r) => r.id !== op.referenceId),
      };
    }

    case 'updateMetadata': {
      // Full replacement: all DocumentMetadata fields are optional,
      // so Partial<DocumentMetadata> is structurally identical.
      return { ...ir, metadata: deepClone(op.metadata) };
    }

    case 'updateLayout': {
      // Full replacement using the provided layout. Falls back to the
      // current mode if not provided (mode is required on LayoutHints).
      const newLayout: LayoutHints = {
        mode: ir.layout.mode,
        ...deepClone(op.layout),
      };
      return { ...ir, layout: newLayout };
    }
  }
}

// ─── Patch Application ───────────────────────────────────────

/**
 * Applies a patch to an IR document, returning a new IR (immutable).
 *
 * Invariant: `applyPatch(ir, [])` returns `ir` unchanged (identity).
 */
export function applyPatch(ir: GlyphIR, patch: GlyphPatch): GlyphIR {
  if (patch.length === 0) return ir;

  let result = deepClone(ir);
  for (const op of patch) {
    result = applyOperation(result, op);
  }
  return result;
}

// ─── Patch Composition ───────────────────────────────────────

/**
 * Composes two patches into a single patch.
 *
 * Simplistic but correct: concatenates the operations of `a` followed by `b`.
 *
 * Invariant: `composePatch` is associative —
 * `compose(compose(a, b), c)` equals `compose(a, compose(b, c))`.
 */
export function composePatch(a: GlyphPatch, b: GlyphPatch): GlyphPatch {
  return [...a, ...b];
}
