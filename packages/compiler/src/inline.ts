import type { InlineNode } from '@glyphjs/types';
import type { Diagnostic } from '@glyphjs/types';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

// ─── MDAST Phrasing Content Types ───────────────────────────
// These are structural types matching the shapes from mdast,
// avoiding a hard dependency on @types/mdast.

interface MdastText {
  type: 'text';
  value: string;
}

interface MdastStrong {
  type: 'strong';
  children: MdastPhrasingContent[];
}

interface MdastEmphasis {
  type: 'emphasis';
  children: MdastPhrasingContent[];
}

interface MdastDelete {
  type: 'delete';
  children: MdastPhrasingContent[];
}

interface MdastInlineCode {
  type: 'inlineCode';
  value: string;
}

interface MdastLink {
  type: 'link';
  url: string;
  title?: string | null;
  children: MdastPhrasingContent[];
}

interface MdastImage {
  type: 'image';
  url: string;
  alt?: string | null;
  title?: string | null;
}

interface MdastBreak {
  type: 'break';
}

type MdastPhrasingContent =
  | MdastText
  | MdastStrong
  | MdastEmphasis
  | MdastDelete
  | MdastInlineCode
  | MdastLink
  | MdastImage
  | MdastBreak;

// ─── Conversion ─────────────────────────────────────────────

/**
 * Convert an array of MDAST phrasing content nodes to InlineNode[].
 *
 * Unknown node types are converted to text nodes with their string value
 * (if present) or skipped entirely.
 *
 * @param nodes - Raw MDAST phrasing content nodes (typed as unknown[] to avoid a hard @types/mdast dependency).
 * @returns Normalized InlineNode array suitable for inclusion in IR blocks.
 */
export function convertPhrasingContent(nodes: unknown[]): InlineNode[] {
  const result: InlineNode[] = [];

  for (const node of nodes) {
    const converted = convertSingleNode(node as MdastPhrasingContent);
    if (converted) {
      result.push(converted);
    }
  }

  return result;
}

function convertSingleNode(node: MdastPhrasingContent): InlineNode | null {
  switch (node.type) {
    case 'text':
      return { type: 'text', value: node.value };

    case 'strong':
      return {
        type: 'strong',
        children: convertPhrasingContent(node.children),
      };

    case 'emphasis':
      return {
        type: 'emphasis',
        children: convertPhrasingContent(node.children),
      };

    case 'delete':
      return {
        type: 'delete',
        children: convertPhrasingContent(node.children),
      };

    case 'inlineCode':
      return { type: 'inlineCode', value: node.value };

    case 'link': {
      const linkNode: InlineNode = {
        type: 'link',
        url: node.url,
        children: convertPhrasingContent(node.children),
      };
      if (node.title != null) {
        (linkNode as { type: 'link'; url: string; title?: string; children: InlineNode[] }).title =
          node.title;
      }
      return linkNode;
    }

    case 'image': {
      const imgNode: InlineNode = {
        type: 'image',
        src: node.url,
      };
      if (node.alt != null) {
        (imgNode as { type: 'image'; src: string; alt?: string; title?: string }).alt = node.alt;
      }
      if (node.title != null) {
        (imgNode as { type: 'image'; src: string; alt?: string; title?: string }).title =
          node.title;
      }
      return imgNode;
    }

    case 'break':
      return { type: 'break' };

    default: {
      // For unknown phrasing content types, attempt to extract a text value
      const unknown = node as Record<string, unknown>;
      if (typeof unknown['value'] === 'string') {
        return { type: 'text', value: unknown['value'] };
      }
      return null;
    }
  }
}

// ─── Markdown String Parser ─────────────────────────────────────

/**
 * Parse a string containing inline markdown into InlineNode[].
 *
 * Uses remark-parse to parse the text, extracts phrasing content from
 * the first paragraph. Only supports inline elements (bold, italic, links, code).
 * Block elements trigger diagnostic warnings.
 *
 * Edge cases:
 * - Empty string → `[]`
 * - Plain text → `[{ type: 'text', value: text }]`
 * - Block elements (headings, lists) → diagnostic warning, extract text only
 *
 * @param text - Markdown string to parse
 * @param diagnostics - Optional array to collect warnings (e.g., for block elements)
 * @returns Array of InlineNode elements
 */
export function parseInlineMarkdown(text: string, diagnostics?: Diagnostic[]): InlineNode[] {
  // Handle empty string
  if (text.trim() === '') {
    return [];
  }

  // Parse markdown using unified + remark-parse
  const processor = unified().use(remarkParse);
  const tree = processor.parse(text);

  // Type guard for MDAST root node
  interface MdastRoot {
    type: 'root';
    children: { type: string; children?: unknown[] }[];
  }

  const root = tree as unknown as MdastRoot;

  if (!root.children || root.children.length === 0) {
    // No content parsed
    return [{ type: 'text', value: text }];
  }

  // Check for block-level elements (not just paragraph)
  const hasBlockElements = root.children.some(
    (child) =>
      child.type !== 'paragraph' &&
      child.type !== 'text' &&
      !['strong', 'emphasis', 'delete', 'inlineCode', 'link', 'image', 'break'].includes(
        child.type,
      ),
  );

  if (hasBlockElements && diagnostics) {
    diagnostics.push({
      severity: 'warning',
      code: 'INLINE_BLOCK_ELEMENTS',
      message:
        'Block-level markdown elements (headings, lists, etc.) are not supported in inline text fields. Only inline formatting (bold, italic, links, code) will be preserved.',
      source: 'compiler',
    });
  }

  // Extract first paragraph's children, or fall back to all inline children
  const firstParagraph = root.children.find((child) => child.type === 'paragraph');

  if (firstParagraph && firstParagraph.children) {
    return convertPhrasingContent(firstParagraph.children);
  }

  // If no paragraph found but we have inline-only children, convert them
  const inlineChildren = root.children.filter((child) =>
    ['text', 'strong', 'emphasis', 'delete', 'inlineCode', 'link', 'image', 'break'].includes(
      child.type,
    ),
  );

  if (inlineChildren.length > 0) {
    return convertPhrasingContent(inlineChildren);
  }

  // Fallback: return plain text
  return [{ type: 'text', value: text }];
}
