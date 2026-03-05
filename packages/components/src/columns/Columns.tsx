import { Fragment } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface ColumnsData {
  children: string[];
  ratio?: number[];
  gap?: string;
}

// ─── Component ─────────────────────────────────────────────────

export function Columns({
  data,
  block,
  renderBlock,
}: GlyphComponentProps<ColumnsData>): ReactElement {
  const childBlocks = block.children ?? [];
  const ratio = data.ratio ?? childBlocks.map(() => 1);
  const cols = ratio.map((r) => `${String(r)}fr`).join(' ');
  const gap = data.gap ?? '1rem';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        gap,
      }}
    >
      {childBlocks.map((child, i) => (
        <Fragment key={child.id}>{renderBlock?.(child, i) as ReactNode}</Fragment>
      ))}
    </div>
  );
}
