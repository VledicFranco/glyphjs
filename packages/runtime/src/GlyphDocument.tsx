import type { ReactNode } from 'react';
import type { GlyphIR } from '@glyphjs/types';
import { BlockRenderer } from './BlockRenderer.js';

// ─── Props ────────────────────────────────────────────────────

interface GlyphDocumentProps {
  ir: GlyphIR;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a complete GlyphIR document.
 * Iterates over `ir.blocks` and renders each via `BlockRenderer`.
 * Expects to be wrapped in a `RuntimeProvider` (either directly
 * or via the `createGlyphRuntime()` factory).
 */
export function GlyphDocument({ ir, className }: GlyphDocumentProps): ReactNode {
  return (
    <div className={className} data-glyph-document={ir.id}>
      {ir.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} layout={ir.layout} />
      ))}
    </div>
  );
}
