import type { ReactNode } from 'react';
import type { BlockProps, HtmlData } from '@glyphjs/types';
import DOMPurify from 'dompurify';

// ─── Component ────────────────────────────────────────────────

/**
 * Renders raw HTML content sanitized with DOMPurify.
 * Removes dangerous elements, attributes, and URLs to prevent XSS.
 */
export function GlyphRawHtml({ block }: BlockProps): ReactNode {
  const data = block.data as HtmlData;
  const clean = DOMPurify.sanitize(data.value);

  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
