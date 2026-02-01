import type { ReactNode } from 'react';
import type { BlockProps, BlockquoteData } from '@glyphjs/types';
import { InlineRenderer } from './InlineRenderer.js';

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a blockquote with inline content.
 */
export function GlyphBlockquote({ block }: BlockProps): ReactNode {
  const data = block.data as BlockquoteData;

  return (
    <blockquote>
      <InlineRenderer nodes={data.children} />
    </blockquote>
  );
}
