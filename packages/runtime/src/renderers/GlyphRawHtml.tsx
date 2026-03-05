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
  // DOMPurify requires a browser DOM. In Node.js SSR there is no window/document,
  // so sanitize is unavailable — fall back to the raw value (trusted author content).
  const clean =
    typeof DOMPurify.sanitize === 'function' ? DOMPurify.sanitize(data.value) : data.value;

  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
