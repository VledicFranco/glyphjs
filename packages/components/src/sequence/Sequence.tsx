import type { CSSProperties, ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ───────────────────────────────────────────────────

type MessageType = 'message' | 'reply' | 'self';

interface Actor {
  id: string;
  label: string;
}

interface Message {
  from: string;
  to: string;
  label: string;
  type: MessageType;
}

export interface SequenceData {
  title?: string;
  actors: Actor[];
  messages: Message[];
}

// ─── Layout Constants ────────────────────────────────────────

const ACTOR_WIDTH = 120;
const ACTOR_HEIGHT = 40;
const ACTOR_GAP = 160;
const TOP_MARGIN = 20;
const MSG_SPACING = 50;
const SELF_ARC_WIDTH = 30;
const SELF_ARC_HEIGHT = 30;
const BOTTOM_PADDING = 40;
const SIDE_PADDING = 40;
const ARROW_SIZE = 8;

// ─── Component ──────────────────────────────────────────────

export function Sequence({ data }: GlyphComponentProps<SequenceData>): ReactElement {
  const actorCount = data.actors.length;
  const messageCount = data.messages.length;

  // Build actor x-positions
  const actorX = new Map<string, number>();
  for (let i = 0; i < actorCount; i++) {
    const actor = data.actors[i];
    if (actor) {
      actorX.set(actor.id, SIDE_PADDING + i * ACTOR_GAP + ACTOR_WIDTH / 2);
    }
  }

  const svgWidth = SIDE_PADDING * 2 + (actorCount - 1) * ACTOR_GAP + ACTOR_WIDTH;
  const actorBoxY = TOP_MARGIN;
  const lifelineStartY = actorBoxY + ACTOR_HEIGHT;
  const firstMsgY = lifelineStartY + MSG_SPACING;
  const lastMsgY = firstMsgY + (messageCount - 1) * MSG_SPACING;
  const svgHeight = lastMsgY + BOTTOM_PADDING + ACTOR_HEIGHT;

  const ariaLabel = data.title
    ? `${data.title}: sequence diagram with ${actorCount} actors and ${messageCount} messages`
    : `Sequence diagram with ${actorCount} actors and ${messageCount} messages`;

  return (
    <div className="glyph-sequence-container">
      {data.title && (
        <div
          style={{
            fontFamily: 'var(--glyph-font-heading, Inter, system-ui, sans-serif)',
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--glyph-heading, #edf0f5)',
            marginBottom: '0.5rem',
          }}
        >
          {data.title}
        </div>
      )}
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        style={{ minHeight: 200, maxHeight: 800, display: 'block' }}
      >
        {/* Arrow markers */}
        <defs>
          <marker
            id="seq-arrow-solid"
            viewBox="0 0 10 10"
            refX={10}
            refY={5}
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--glyph-text, #d4dae3)" />
          </marker>
          <marker
            id="seq-arrow-dashed"
            viewBox="0 0 10 10"
            refX={10}
            refY={5}
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--glyph-text-muted, #6b7a94)" />
          </marker>
        </defs>

        {/* Actor boxes (top) */}
        {data.actors.map((actor) => {
          const cx = actorX.get(actor.id) ?? 0;
          return (
            <g key={`actor-top-${actor.id}`}>
              <rect
                x={cx - ACTOR_WIDTH / 2}
                y={actorBoxY}
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
                y={actorBoxY + ACTOR_HEIGHT / 2}
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
        })}

        {/* Lifelines */}
        {data.actors.map((actor) => {
          const cx = actorX.get(actor.id) ?? 0;
          return (
            <line
              key={`lifeline-${actor.id}`}
              x1={cx}
              y1={lifelineStartY}
              x2={cx}
              y2={lastMsgY + BOTTOM_PADDING / 2}
              stroke="var(--glyph-border, #1a2035)"
              strokeWidth={1}
              strokeDasharray="6,4"
            />
          );
        })}

        {/* Actor boxes (bottom) */}
        {data.actors.map((actor) => {
          const cx = actorX.get(actor.id) ?? 0;
          const bottomY = lastMsgY + BOTTOM_PADDING / 2;
          return (
            <g key={`actor-bottom-${actor.id}`}>
              <rect
                x={cx - ACTOR_WIDTH / 2}
                y={bottomY}
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
                y={bottomY + ACTOR_HEIGHT / 2}
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
        })}

        {/* Messages */}
        {data.messages.map((msg, idx) => {
          const y = firstMsgY + idx * MSG_SPACING;
          const fromX = actorX.get(msg.from) ?? 0;
          const toX = actorX.get(msg.to) ?? 0;

          if (msg.type === 'self') {
            // Self-message arc
            const x = fromX;
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
                  {msg.label}
                </text>
              </g>
            );
          }

          const isDashed = msg.type === 'reply';
          const markerId = isDashed ? 'seq-arrow-dashed' : 'seq-arrow-solid';
          const midX = (fromX + toX) / 2;

          return (
            <g key={`msg-${idx}`}>
              <line
                x1={fromX}
                y1={y}
                x2={toX}
                y2={y}
                stroke={
                  isDashed ? 'var(--glyph-text-muted, #6b7a94)' : 'var(--glyph-text, #d4dae3)'
                }
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
                {msg.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hidden accessible table for screen readers */}
      <table className="sr-only" aria-label="Sequence data" style={SR_ONLY_STYLE}>
        <caption>Sequence messages in order</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">From</th>
            <th scope="col">To</th>
            <th scope="col">Message</th>
            <th scope="col">Type</th>
          </tr>
        </thead>
        <tbody>
          {data.messages.map((msg, idx) => {
            const fromActor = data.actors.find((a) => a.id === msg.from);
            const toActor = data.actors.find((a) => a.id === msg.to);
            return (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{fromActor?.label ?? msg.from}</td>
                <td>{toActor?.label ?? msg.to}</td>
                <td>{msg.label}</td>
                <td>{msg.type}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SR_ONLY_STYLE: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
