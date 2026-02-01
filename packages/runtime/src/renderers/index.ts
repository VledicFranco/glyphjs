import type { ComponentType as ReactComponentType } from 'react';
import type { BlockProps } from '@glyphjs/types';

import { GlyphHeading } from './GlyphHeading.js';
import { GlyphParagraph } from './GlyphParagraph.js';
import { GlyphList } from './GlyphList.js';
import { GlyphCodeBlock } from './GlyphCodeBlock.js';
import { GlyphBlockquote } from './GlyphBlockquote.js';
import { GlyphImage } from './GlyphImage.js';
import { GlyphThematicBreak } from './GlyphThematicBreak.js';
import { GlyphRawHtml } from './GlyphRawHtml.js';

// ─── Individual renderer exports ─────────────────────────────

export { InlineRenderer } from './InlineRenderer.js';
export { GlyphHeading } from './GlyphHeading.js';
export { GlyphParagraph } from './GlyphParagraph.js';
export { GlyphList } from './GlyphList.js';
export { GlyphCodeBlock } from './GlyphCodeBlock.js';
export { GlyphBlockquote } from './GlyphBlockquote.js';
export { GlyphImage } from './GlyphImage.js';
export { GlyphThematicBreak } from './GlyphThematicBreak.js';
export { GlyphRawHtml } from './GlyphRawHtml.js';

// ─── Built-in renderers map ──────────────────────────────────

/**
 * Maps standard Markdown block type strings to their built-in
 * renderer components. Used by `BlockRenderer` to resolve
 * standard blocks before falling back to the unknown-type fallback.
 */
export const builtInRenderers: Record<string, ReactComponentType<BlockProps>> = {
  heading: GlyphHeading,
  paragraph: GlyphParagraph,
  list: GlyphList,
  code: GlyphCodeBlock,
  blockquote: GlyphBlockquote,
  image: GlyphImage,
  'thematic-break': GlyphThematicBreak,
  html: GlyphRawHtml,
};
