import { Fragment } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface RowsData {
  children: string[];
  ratio?: number[];
  gap?: string;
}

// ─── Component ─────────────────────────────────────────────────

/**
 * Stacks children vertically in a CSS grid.
 *
 * When used as a cell inside a ui:columns layout, the grid cell stretches
 * to the full column height, and ratio fr units distribute that height
 * between children. Without an explicit height constraint (e.g. standalone
 * usage), children are auto-sized and ratio has no visual effect.
 */
export function Rows({ data, block, renderBlock }: GlyphComponentProps<RowsData>): ReactElement {
  const childBlocks = block.children ?? [];
  const ratio = data.ratio ?? childBlocks.map(() => 1);
  const rows = ratio.map((r) => `${String(r)}fr`).join(' ');
  const gap = data.gap ?? '1rem';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: rows,
        gap,
        height: '100%',
      }}
    >
      {childBlocks.map((child, i) => (
        <Fragment key={child.id}>{renderBlock?.(child, i) as ReactNode}</Fragment>
      ))}
    </div>
  );
}
