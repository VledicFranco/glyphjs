import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import { BlockRenderer } from '@glyphjs/runtime';

// ─── Types ─────────────────────────────────────────────────────

export type PanelStyle = 'card' | 'bordered' | 'elevated' | 'ghost';

export interface PanelData {
  child: string;
  style?: PanelStyle;
  padding?: string;
}

// ─── Style maps ────────────────────────────────────────────────

const PANEL_STYLES: Record<PanelStyle, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--glyph-surface, #ffffff)',
    borderRadius: 'var(--glyph-radius-lg, 0.5rem)',
    boxShadow: 'var(--glyph-shadow-sm, 0 1px 3px rgba(0,0,0,0.1))',
    border: '1px solid var(--glyph-border, rgba(0,0,0,0.08))',
  },
  bordered: {
    border: '1px solid var(--glyph-border, rgba(0,0,0,0.2))',
    borderRadius: 'var(--glyph-radius-md, 0.25rem)',
  },
  elevated: {
    backgroundColor: 'var(--glyph-surface, #ffffff)',
    borderRadius: 'var(--glyph-radius-lg, 0.5rem)',
    boxShadow: 'var(--glyph-shadow-md, 0 4px 12px rgba(0,0,0,0.15))',
  },
  ghost: {},
};

// ─── Component ─────────────────────────────────────────────────

export function Panel({
  data,
  block,
  layout,
  container,
}: GlyphComponentProps<PanelData>): ReactElement {
  const childBlock = block.children?.[0];
  const panelStyle = data.style ?? 'card';
  const padding = data.padding ?? '1rem';

  return (
    <div
      style={{
        ...PANEL_STYLES[panelStyle],
        padding,
        overflow: 'hidden',
      }}
    >
      {childBlock && (
        <BlockRenderer block={childBlock} layout={layout} index={0} container={container} />
      )}
    </div>
  );
}
