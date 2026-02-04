import type { ReactElement } from 'react';

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
  label: string;
}

export function renderActorBox(
  actor: Actor,
  cx: number,
  y: number,
  keyPrefix: string,
): ReactElement {
  return (
    <g key={`${keyPrefix}-${actor.id}`}>
      <rect
        x={cx - ACTOR_WIDTH / 2}
        y={y}
        width={ACTOR_WIDTH}
        height={ACTOR_HEIGHT}
        rx={4}
        ry={4}
        fill="var(--glyph-surface-raised, #162038)"
        stroke="var(--glyph-border-strong, #2a3550)"
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={y + ACTOR_HEIGHT / 2}
        dy="0.35em"
        textAnchor="middle"
        fontSize="13px"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight={600}
        fill="var(--glyph-text, #d4dae3)"
      >
        {actor.label}
      </text>
    </g>
  );
}

export function renderSelfMessage(x: number, y: number, label: string, idx: number): ReactElement {
  return (
    <g key={`msg-${idx}`}>
      <path
        d={`M ${x} ${y} L ${x + SELF_ARC_WIDTH} ${y} L ${x + SELF_ARC_WIDTH} ${y + SELF_ARC_HEIGHT} L ${x} ${y + SELF_ARC_HEIGHT}`}
        fill="none"
        stroke="var(--glyph-text, #d4dae3)"
        strokeWidth={1.5}
        markerEnd="url(#seq-arrow-solid)"
      />
      <text
        x={x + SELF_ARC_WIDTH + 6}
        y={y + SELF_ARC_HEIGHT / 2}
        dy="0.35em"
        fontSize="12px"
        fontFamily="Inter, system-ui, sans-serif"
        fill="var(--glyph-text, #d4dae3)"
      >
        {label}
      </text>
    </g>
  );
}

export function renderStandardMessage(
  fromX: number,
  toX: number,
  y: number,
  label: string,
  isDashed: boolean,
  idx: number,
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
      <text
        x={midX}
        y={y - 8}
        textAnchor="middle"
        fontSize="12px"
        fontFamily="Inter, system-ui, sans-serif"
        fill="var(--glyph-text, #d4dae3)"
      >
        {label}
      </text>
    </g>
  );
}
