import type { InlineNode } from '@glyphjs/types';

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
