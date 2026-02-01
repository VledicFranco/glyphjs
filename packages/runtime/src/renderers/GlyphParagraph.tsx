import type { ReactNode } from 'react';
import type { BlockProps, ParagraphData } from '@glyphjs/types';
import { InlineRenderer } from './InlineRenderer.js';

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a paragraph block with inline content.
 */
export function GlyphParagraph({ block }: BlockProps): ReactNode {
  const data = block.data as ParagraphData;

  return (
    <p>
      <InlineRenderer nodes={data.children} />
    </p>
  );
}
