import type { CSSProperties, ReactNode } from 'react';
import type { Block, LayoutHints } from '@glyphjs/types';

// ─── Props ───────────────────────────────────────────────────

interface DashboardLayoutProps {
  blocks: Block[];
  layout: LayoutHints;
  renderBlock: (block: Block) => ReactNode;
}

// ─── Component ───────────────────────────────────────────────

/**
 * Dashboard mode layout — CSS grid with configurable columns.
 *
 * Supports per-block placement overrides via `layout.blockLayout`.
 * Blocks without overrides flow naturally in the grid.
 */
export function DashboardLayout({
  blocks,
  layout,
  renderBlock,
}: DashboardLayoutProps): ReactNode {
  const columns = layout.columns ?? 2;

  const containerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${String(columns)}, 1fr)`,
    gap: '1rem',
  };

  return (
    <div style={containerStyle} data-glyph-layout="dashboard">
      {blocks.map((block) => {
        const override = layout.blockLayout?.[block.id];
        const cellStyle: CSSProperties = {};

        if (override) {
          if (override.gridColumn) {
            cellStyle.gridColumn = override.gridColumn;
          }
          if (override.gridRow) {
            cellStyle.gridRow = override.gridRow;
          }
          if (override.span) {
            cellStyle.gridColumn = `span ${String(override.span)}`;
          }
        }

        return (
          <div key={block.id} style={cellStyle}>
            {renderBlock(block)}
          </div>
        );
      })}
    </div>
  );
}
