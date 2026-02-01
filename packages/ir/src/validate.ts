import type { Diagnostic, GlyphIR } from '@glyphjs/types';

// ─── Valid Layout Modes ──────────────────────────────────────

const VALID_LAYOUT_MODES = new Set(['document', 'dashboard', 'presentation']);

// ─── IR Validation ───────────────────────────────────────────

/**
 * Validates a GlyphIR document for structural integrity.
 *
 * Checks:
 * - `version` is a non-empty string
 * - `id` is a non-empty string
 * - all block IDs are unique
 * - all reference `sourceBlockId` / `targetBlockId` exist in blocks
 * - blocks have required fields (`id`, `type`, `data`, `position`)
 * - layout mode is valid
 *
 * Returns an array of `Diagnostic` objects describing any issues found.
 */
export function validateIR(ir: GlyphIR): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // ── version ────────────────────────────────────────────────
  if (!ir.version || typeof ir.version !== 'string') {
    diagnostics.push({
      severity: 'error',
      code: 'IR_MISSING_VERSION',
      message: 'IR document must have a non-empty "version" string.',
      source: 'compiler',
    });
  }

  // ── id ─────────────────────────────────────────────────────
  if (!ir.id || typeof ir.id !== 'string') {
    diagnostics.push({
      severity: 'error',
      code: 'IR_MISSING_ID',
      message: 'IR document must have a non-empty "id" string.',
      source: 'compiler',
    });
  }

  // ── blocks: required fields ────────────────────────────────
  const blockIds = new Set<string>();
  for (const block of ir.blocks) {
    // id
    if (!block.id || typeof block.id !== 'string') {
      diagnostics.push({
        severity: 'error',
        code: 'BLOCK_MISSING_ID',
        message: 'Block is missing a non-empty "id" field.',
        source: 'compiler',
      });
    }

    // type
    if (!block.type || typeof block.type !== 'string') {
      diagnostics.push({
        severity: 'error',
        code: 'BLOCK_MISSING_TYPE',
        message: `Block "${String(block.id)}" is missing a non-empty "type" field.`,
        source: 'compiler',
      });
    }

    // data
    if (block.data === undefined || block.data === null) {
      diagnostics.push({
        severity: 'error',
        code: 'BLOCK_MISSING_DATA',
        message: `Block "${String(block.id)}" is missing a "data" field.`,
        source: 'compiler',
      });
    }

    // position
    if (!block.position) {
      diagnostics.push({
        severity: 'error',
        code: 'BLOCK_MISSING_POSITION',
        message: `Block "${String(block.id)}" is missing a "position" field.`,
        source: 'compiler',
      });
    }

    // Track IDs for uniqueness check
    if (block.id) {
      if (blockIds.has(block.id)) {
        diagnostics.push({
          severity: 'error',
          code: 'BLOCK_DUPLICATE_ID',
          message: `Duplicate block ID: "${block.id}".`,
          source: 'compiler',
        });
      }
      blockIds.add(block.id);
    }
  }

  // ── references: source/target exist ────────────────────────
  for (const ref of ir.references) {
    if (!blockIds.has(ref.sourceBlockId)) {
      diagnostics.push({
        severity: 'error',
        code: 'REF_MISSING_SOURCE',
        message: `Reference "${ref.id}" has sourceBlockId "${ref.sourceBlockId}" which does not exist in blocks.`,
        source: 'compiler',
      });
    }
    if (!blockIds.has(ref.targetBlockId)) {
      diagnostics.push({
        severity: 'error',
        code: 'REF_MISSING_TARGET',
        message: `Reference "${ref.id}" has targetBlockId "${ref.targetBlockId}" which does not exist in blocks.`,
        source: 'compiler',
      });
    }
  }

  // ── layout mode ────────────────────────────────────────────
  if (ir.layout && !VALID_LAYOUT_MODES.has(ir.layout.mode)) {
    diagnostics.push({
      severity: 'error',
      code: 'LAYOUT_INVALID_MODE',
      message: `Invalid layout mode: "${ir.layout.mode}". Expected one of: ${[...VALID_LAYOUT_MODES].join(', ')}.`,
      source: 'compiler',
    });
  }

  return diagnostics;
}
