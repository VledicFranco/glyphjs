import type { ReactNode } from 'react';
import type { InlineNode } from '@glyphjs/types';

// ─── Props ────────────────────────────────────────────────────

interface InlineRendererProps {
  nodes: InlineNode[];
}

// ─── Single node renderer ─────────────────────────────────────

function renderInlineNode(node: InlineNode, index: number): ReactNode {
  switch (node.type) {
    case 'text':
      return node.value;

    case 'strong':
      return (
        <strong key={index}>
          <InlineRenderer nodes={node.children} />
        </strong>
      );

    case 'emphasis':
      return (
        <em key={index}>
          <InlineRenderer nodes={node.children} />
        </em>
      );

    case 'delete':
      return (
        <del key={index}>
          <InlineRenderer nodes={node.children} />
        </del>
      );

    case 'inlineCode':
      return <code key={index}>{node.value}</code>;

    case 'link':
      return (
        <a key={index} href={node.url} title={node.title}>
          <InlineRenderer nodes={node.children} />
        </a>
      );

    case 'image':
      return <img key={index} src={node.src} alt={node.alt} title={node.title} />;

    case 'break':
      return <br key={index} />;

    default:
      return null;
  }
}

// ─── Component ────────────────────────────────────────────────

/**
 * Recursively renders an array of InlineNode values into React elements.
 * Handles text, strong, emphasis, delete, inlineCode, link, image, and break.
 */
export function InlineRenderer({ nodes }: InlineRendererProps): ReactNode {
  return <>{nodes.map((node, i) => renderInlineNode(node, i))}</>;
}
