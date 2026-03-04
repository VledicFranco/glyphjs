import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import { BlockRenderer } from '@glyphjs/runtime';

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
  layout,
  container,
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
