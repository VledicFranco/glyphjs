import type { CSSProperties, ReactNode } from 'react';
import type { Block, LayoutHints } from '@glyphjs/types';

// ─── Spacing map ─────────────────────────────────────────────

const spacingMap: Record<NonNullable<LayoutHints['spacing']>, string> = {
  compact: '0.5rem',
  normal: '1rem',
  relaxed: '2rem',
};

// ─── Props ───────────────────────────────────────────────────

interface DocumentLayoutProps {
  blocks: Block[];
  layout: LayoutHints;
  renderBlock: (block: Block) => ReactNode;
}

// ─── Component ───────────────────────────────────────────────

/**
 * Document mode layout — single-column vertical flow.
 *
 * Applies configurable `maxWidth` and inter-block spacing.
 */
export function DocumentLayout({
  blocks,
  layout,
  renderBlock,
}: DocumentLayoutProps): ReactNode {
  const gap = spacingMap[layout.spacing ?? 'normal'];

  const containerStyle: CSSProperties = {
    maxWidth: layout.maxWidth ?? 'none',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap,
  };

  return (
    <div style={containerStyle} data-glyph-layout="document">
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </div>
  );
}
