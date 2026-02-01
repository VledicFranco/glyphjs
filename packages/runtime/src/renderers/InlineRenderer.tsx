import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { InlineNode } from '@glyphjs/types';
import { useNavigation } from '../navigation/useNavigation.js';

// ─── Constants ────────────────────────────────────────────────

const GLYPH_LINK_PREFIX = '#glyph:';

// ─── Props ────────────────────────────────────────────────────

interface InlineRendererProps {
  nodes: InlineNode[];
}

// ─── Glyph link sub-component ─────────────────────────────────

/**
 * Renders a `#glyph:block-id` link as a clickable element that
 * triggers smooth-scroll navigation to the referenced block.
 */
function GlyphLink({
  blockId,
  title,
  children,
}: {
  blockId: string;
  title?: string;
  children: ReactNode;
}): ReactNode {
  const { navigateTo } = useNavigation();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigateTo(blockId);
    },
    [navigateTo, blockId],
  );

  return (
    <a
      href={`${GLYPH_LINK_PREFIX}${blockId}`}
      title={title}
      onClick={handleClick}
      data-glyph-ref={blockId}
      role="link"
    >
      {children}
    </a>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function isGlyphLink(url: string): boolean {
  return url.startsWith(GLYPH_LINK_PREFIX);
}

function extractBlockId(url: string): string {
  return url.slice(GLYPH_LINK_PREFIX.length);
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
      // Handle #glyph:block-id links as cross-block navigation
      if (isGlyphLink(node.url)) {
        return (
          <GlyphLink
            key={index}
            blockId={extractBlockId(node.url)}
            title={node.title}
          >
            <InlineRenderer nodes={node.children} />
          </GlyphLink>
        );
      }
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
 * Links with `#glyph:block-id` URLs are rendered as navigable cross-block
 * references that smooth-scroll to the target block on click.
 */
export function InlineRenderer({ nodes }: InlineRendererProps): ReactNode {
  return <>{nodes.map((node, i) => renderInlineNode(node, i))}</>;
}
