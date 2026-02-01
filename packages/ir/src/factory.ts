import type { GlyphIR } from '@glyphjs/types';

// ─── IR Factory Helpers ──────────────────────────────────────

/**
 * Creates a valid empty GlyphIR document with default values.
 *
 * Returns:
 * ```json
 * {
 *   "version": "1.0.0",
 *   "id": id,
 *   "metadata": {},
 *   "blocks": [],
 *   "references": [],
 *   "layout": { "mode": "document", "spacing": "normal" }
 * }
 * ```
 */
export function createEmptyIR(id: string): GlyphIR {
  return {
    version: '1.0.0',
    id,
    metadata: {},
    blocks: [],
    references: [],
    layout: {
      mode: 'document',
      spacing: 'normal',
    },
  };
}
