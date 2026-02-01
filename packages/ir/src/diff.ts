import type {
  Block,
  GlyphIR,
  GlyphPatch,
  GlyphPatchOperation,
  Reference,
} from '@glyphjs/types';

// ─── Deep Equality ───────────────────────────────────────────

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((val, idx) => deepEqual(val, b[idx]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEqual(objA[key], objB[key]));
  }

  return false;
}

// ─── Block Diffing Helpers ───────────────────────────────────

function blockContentEqual(a: Block, b: Block): boolean {
  return (
    a.type === b.type &&
    deepEqual(a.data, b.data) &&
    deepEqual(a.position, b.position) &&
    deepEqual(a.children, b.children) &&
    deepEqual(a.diagnostics, b.diagnostics) &&
    deepEqual(a.metadata, b.metadata)
  );
}

function referenceEqual(a: Reference, b: Reference): boolean {
  return deepEqual(a, b);
}

// ─── Helpers ─────────────────────────────────────────────────

function getBlockAt(blocks: Block[], index: number): Block | undefined {
  return blocks[index];
}

// ─── IR Diffing ──────────────────────────────────────────────

/**
 * Computes a patch that transforms `before` into `after`.
 *
 * Compares blocks (added, removed, updated, moved), references (added, removed),
 * metadata changes, and layout changes.
 *
 * Invariant: `applyPatch(before, diffIR(before, after))` deep-equals `after`.
 */
export function diffIR(before: GlyphIR, after: GlyphIR): GlyphPatch {
  const ops: GlyphPatchOperation[] = [];

  // ── Metadata diff ──────────────────────────────────────────
  // Full replacement: applyPatch replaces metadata entirely.
  if (!deepEqual(before.metadata, after.metadata)) {
    ops.push({
      op: 'updateMetadata',
      metadata: after.metadata,
    });
  }

  // ── Layout diff ────────────────────────────────────────────
  // Full replacement: applyPatch builds a new layout from the patch.
  if (!deepEqual(before.layout, after.layout)) {
    ops.push({
      op: 'updateLayout',
      layout: after.layout,
    });
  }

  // ── Block diff ─────────────────────────────────────────────
  const beforeBlockMap = new Map<string, Block>();
  for (const block of before.blocks) {
    beforeBlockMap.set(block.id, block);
  }

  const afterBlockMap = new Map<string, Block>();
  for (const block of after.blocks) {
    afterBlockMap.set(block.id, block);
  }

  // Removed blocks: in before but not in after
  for (const block of before.blocks) {
    if (!afterBlockMap.has(block.id)) {
      ops.push({ op: 'removeBlock', blockId: block.id });
    }
  }

  // Added and updated blocks (process in after-order for correct positioning)
  for (let i = 0; i < after.blocks.length; i++) {
    const afterBlock = getBlockAt(after.blocks, i);
    if (!afterBlock) continue;

    const beforeBlock = beforeBlockMap.get(afterBlock.id);
    const prevBlock = i > 0 ? getBlockAt(after.blocks, i - 1) : undefined;
    const afterBlockId = prevBlock?.id;

    if (!beforeBlock) {
      // Added block
      ops.push({
        op: 'addBlock',
        block: afterBlock,
        afterBlockId,
      });
    } else {
      // Existing block: check content changes
      if (!blockContentEqual(beforeBlock, afterBlock)) {
        // Build the partial update containing only changed fields
        const data: Partial<Block> = {};
        if (afterBlock.type !== beforeBlock.type) {
          data.type = afterBlock.type;
        }
        if (!deepEqual(afterBlock.data, beforeBlock.data)) {
          data.data = afterBlock.data;
        }
        if (!deepEqual(afterBlock.position, beforeBlock.position)) {
          data.position = afterBlock.position;
        }
        if (!deepEqual(afterBlock.children, beforeBlock.children)) {
          data.children = afterBlock.children;
        }
        if (!deepEqual(afterBlock.diagnostics, beforeBlock.diagnostics)) {
          data.diagnostics = afterBlock.diagnostics;
        }
        if (!deepEqual(afterBlock.metadata, beforeBlock.metadata)) {
          data.metadata = afterBlock.metadata;
        }
        ops.push({
          op: 'updateBlock',
          blockId: afterBlock.id,
          data,
        });
      }

      // Check if position in array changed (moved)
      const beforeIndex = before.blocks.findIndex(
        (b) => b.id === afterBlock.id,
      );
      const prevBeforeBlock =
        beforeIndex > 0
          ? getBlockAt(before.blocks, beforeIndex - 1)
          : undefined;
      const expectedAfterBlockId = prevBeforeBlock?.id;
      if (afterBlockId !== expectedAfterBlockId) {
        // Emit move when the predecessor in the after-array differs from
        // the predecessor in the before-array.
        ops.push({
          op: 'moveBlock',
          blockId: afterBlock.id,
          afterBlockId,
        });
      }
    }
  }

  // ── Reference diff ─────────────────────────────────────────
  const beforeRefMap = new Map<string, Reference>();
  for (const ref of before.references) {
    beforeRefMap.set(ref.id, ref);
  }

  const afterRefMap = new Map<string, Reference>();
  for (const ref of after.references) {
    afterRefMap.set(ref.id, ref);
  }

  // Removed references
  for (const ref of before.references) {
    if (!afterRefMap.has(ref.id)) {
      ops.push({ op: 'removeReference', referenceId: ref.id });
    }
  }

  // Added references (and implicitly updated — references are replaced entirely)
  for (const ref of after.references) {
    const beforeRef = beforeRefMap.get(ref.id);
    if (!beforeRef) {
      ops.push({ op: 'addReference', reference: ref });
    } else if (!referenceEqual(beforeRef, ref)) {
      // Replace: remove then add
      ops.push({ op: 'removeReference', referenceId: ref.id });
      ops.push({ op: 'addReference', reference: ref });
    }
  }

  return ops;
}
