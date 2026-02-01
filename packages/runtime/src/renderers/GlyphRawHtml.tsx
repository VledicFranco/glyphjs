import type { ReactNode } from 'react';
import type { BlockProps, HtmlData } from '@glyphjs/types';

// ─── Sanitization ─────────────────────────────────────────────

/**
 * Lightweight HTML sanitizer that strips dangerous elements and attributes.
 * Removes `<script>`, `<iframe>` tags, `on*` event handler attributes,
 * and `javascript:` URLs.
 */
function sanitizeHtml(html: string): string {
  let sanitized = html;

  // Strip <script> tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '');

  // Strip <iframe> tags and their contents
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe\s*>/gi, '');

  // Strip self-closing / unclosed <script> and <iframe> tags
  sanitized = sanitized.replace(/<script\b[^>]*\/?>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^>]*\/?>/gi, '');

  // Strip on* event handler attributes (e.g. onclick, onload, onerror)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Strip javascript: URLs in href/src/action attributes
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');

  return sanitized;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Renders raw HTML content with basic sanitization.
 * Strips `<script>`, `<iframe>`, `on*` event attributes, and `javascript:` URLs.
 */
export function GlyphRawHtml({ block }: BlockProps): ReactNode {
  const data = block.data as HtmlData;
  const clean = sanitizeHtml(data.value);

  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
