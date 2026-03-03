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
    <blockquote
      style={{
        borderLeft: '4px solid var(--glyph-blockquote-border, var(--glyph-accent, #0a9d7c))',
        background: 'var(--glyph-blockquote-bg, var(--glyph-accent-subtle, #e6f6f2))',
        padding: 'var(--glyph-spacing-sm, 0.5rem) var(--glyph-spacing-md, 1rem)',
        margin: '0.5rem 0',
        borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
      }}
    >
      <InlineRenderer nodes={data.children} />
    </blockquote>
  );
}
