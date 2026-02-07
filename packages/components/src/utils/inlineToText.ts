import type { InlineNode } from '@glyphjs/types';

/**
 * Converts InlineNode[] to plain text string.
 * Used for contexts where rich formatting cannot be rendered (e.g., SVG text elements).
 * Recursively extracts text content from all node types.
 */
export function inlineToText(content: string | InlineNode[]): string {
  if (typeof content === 'string') {
    return content;
  }

  return content
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value;
        case 'strong':
        case 'emphasis':
        case 'delete':
        case 'link':
          return inlineToText(node.children);
        case 'inlineCode':
          return node.value;
        case 'image':
          return node.alt ?? '';
        case 'break':
          return '\n';
        default:
          return '';
      }
    })
    .join('');
}
