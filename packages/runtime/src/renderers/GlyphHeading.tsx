import type { ReactNode } from 'react';
import type { BlockProps, HeadingData, InlineNode } from '@glyphjs/types';
import { InlineRenderer } from './InlineRenderer.js';

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Extracts plain text from an InlineNode tree for use as an anchor id.
 */
function extractText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value;
        case 'inlineCode':
          return node.value;
        case 'strong':
        case 'emphasis':
        case 'delete':
        case 'link':
          return extractText(node.children);
        default:
          return '';
      }
    })
    .join('');
}

/**
 * Generates a URL-friendly id from heading text.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a heading block (`<h1>` through `<h6>`) based on `data.depth`.
 * Generates an `id` attribute from the heading text for anchor links.
 */
export function GlyphHeading({ block }: BlockProps): ReactNode {
  const data = block.data as HeadingData;
  const Tag = `h${data.depth}` as const;
  const id = slugify(extractText(data.children));

  return (
    <Tag id={id}>
      <InlineRenderer nodes={data.children} />
    </Tag>
  );
}
