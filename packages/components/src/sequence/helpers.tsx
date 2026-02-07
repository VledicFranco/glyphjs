import type { ReactElement } from 'react';
import type { InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';

// ─── Layout Constants ────────────────────────────────────────

export const ACTOR_WIDTH = 120;
export const ACTOR_HEIGHT = 40;
export const ACTOR_GAP = 160;
export const TOP_MARGIN = 20;
export const MSG_SPACING = 50;
export const SELF_ARC_WIDTH = 30;
export const SELF_ARC_HEIGHT = 30;
export const BOTTOM_PADDING = 40;
export const SIDE_PADDING = 40;
export const ARROW_SIZE = 8;

// ─── Render helpers ──────────────────────────────────────────

interface Actor {
  id: string;
  label: string | InlineNode[];
}

export function renderActorBox(
  actor: Actor,
  cx: number,
  y: number,
  keyPrefix: string,
  width = ACTOR_WIDTH,
  height = ACTOR_HEIGHT,
  fontSize = '13px',
): ReactElement {
  return (
    <g key={`${keyPrefix}-${actor.id}`}>
      <rect
        x={cx - width / 2}
        y={y}
        width={width}
        height={height}
        rx={4}
        ry={4}
        fill="var(--glyph-surface-raised, #162038)"
        stroke="var(--glyph-border-strong, #2a3550)"
        strokeWidth={1.5}
      />
      <foreignObject x={cx - width / 2} y={y} width={width} height={height}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            fontSize,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: 'var(--glyph-text, #d4dae3)',
            textAlign: 'center',
          }}
        >
          <RichText content={actor.label} />
        </div>
      </foreignObject>
    </g>
  );
}

export function renderSelfMessage(
  x: number,
  y: number,
  label: string | InlineNode[],
  idx: number,
  fontSize = '12px',
): ReactElement {
  return (
    <g key={`msg-${idx}`}>
      <path
        d={`M ${x} ${y} L ${x + SELF_ARC_WIDTH} ${y} L ${x + SELF_ARC_WIDTH} ${y + SELF_ARC_HEIGHT} L ${x} ${y + SELF_ARC_HEIGHT}`}
        fill="none"
        stroke="var(--glyph-text, #d4dae3)"
        strokeWidth={1.5}
        markerEnd="url(#seq-arrow-solid)"
      />
      <foreignObject x={x + SELF_ARC_WIDTH + 6} y={y} width={150} height={SELF_ARC_HEIGHT}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize,
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'var(--glyph-text, #d4dae3)',
          }}
        >
          <RichText content={label} />
        </div>
      </foreignObject>
    </g>
  );
}

export function renderStandardMessage(
  fromX: number,
  toX: number,
  y: number,
  label: string | InlineNode[],
  isDashed: boolean,
  idx: number,
  fontSize = '12px',
): ReactElement {
  const markerId = isDashed ? 'seq-arrow-dashed' : 'seq-arrow-solid';
  const midX = (fromX + toX) / 2;

  return (
    <g key={`msg-${idx}`}>
      <line
        x1={fromX}
        y1={y}
        x2={toX}
        y2={y}
        stroke={isDashed ? 'var(--glyph-text-muted, #6b7a94)' : 'var(--glyph-text, #d4dae3)'}
        strokeWidth={1.5}
        strokeDasharray={isDashed ? '6,4' : undefined}
        markerEnd={`url(#${markerId})`}
      />
      <foreignObject x={midX - 75} y={y - 22} width={150} height={20}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize,
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'var(--glyph-text, #d4dae3)',
            textAlign: 'center',
          }}
        >
          <RichText content={label} />
        </div>
      </foreignObject>
    </g>
  );
}
