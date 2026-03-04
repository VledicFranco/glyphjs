import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import { BlockRenderer } from '@glyphjs/runtime';

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
export function Rows({
  data,
  block,
  layout,
  container,
}: GlyphComponentProps<RowsData>): ReactElement {
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
        <BlockRenderer
          key={child.id}
          block={child}
          layout={layout}
          index={i}
          container={container}
        />
      ))}
    </div>
  );
}
