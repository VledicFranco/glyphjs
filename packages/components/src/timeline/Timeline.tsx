import { useRef } from 'react';
import type { ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';
import { scaleOrdinal } from 'd3';

// ─── Types ─────────────────────────────────────────────────────

interface TimelineEvent {
  date?: string;
  label?: string;
  title: string | InlineNode[];
  description?: string | InlineNode[];
  type?: string;
}

export interface TimelineData {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
}

interface PositionedEvent {
  event: TimelineEvent;
  position: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

// ─── Constants ─────────────────────────────────────────────────

const MARKER_RADIUS = 8;
const LINE_THICKNESS = 2;
const EVENT_SPACING = 80;
const EDGE_PADDING = MARKER_RADIUS + 20;

const TYPE_PALETTE = [
  'var(--glyph-timeline-color-1, var(--glyph-palette-color-1, #00d4aa))',
  'var(--glyph-timeline-color-2, var(--glyph-palette-color-2, #b44dff))',
  'var(--glyph-timeline-color-3, var(--glyph-palette-color-3, #22c55e))',
  'var(--glyph-timeline-color-4, var(--glyph-palette-color-4, #e040fb))',
  'var(--glyph-timeline-color-5, var(--glyph-palette-color-5, #00e5ff))',
  'var(--glyph-timeline-color-6, var(--glyph-palette-color-6, #84cc16))',
  'var(--glyph-timeline-color-7, var(--glyph-palette-color-7, #f472b6))',
  'var(--glyph-timeline-color-8, var(--glyph-palette-color-8, #fb923c))',
];

// ─── Helpers ───────────────────────────────────────────────────

function eventMarker(e: TimelineEvent): string {
  return e.label ?? e.date ?? '';
}

// ─── Component ─────────────────────────────────────────────────

/**
 * Renders an interactive timeline as an evenly-spaced sequence of events.
 *
 * Events are laid out in array order with uniform spacing — the `date` /
 * `label` field is treated as a free-form marker, not parsed as a calendar
 * date. This keeps the layout readable regardless of the unit (seconds,
 * quarters, centuries, narrative phases). Authors order events themselves.
 *
 * Theming is controlled via CSS custom properties prefixed with
 * `--glyph-timeline-*`.
 */
export function Timeline({ data }: GlyphComponentProps<TimelineData>): ReactElement {
  const { events, orientation = 'vertical' } = data;
  const containerRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === 'vertical';

  const totalLength = Math.max(events.length * EVENT_SPACING + EDGE_PADDING, 400);

  const typeValues = [...new Set(events.map((e) => e.type ?? '_default'))];
  const colorScale = scaleOrdinal<string, string>().domain(typeValues).range(TYPE_PALETTE);

  const positioned: PositionedEvent[] = events.map((event, i) => ({
    event,
    position:
      events.length === 1 ? totalLength / 2 : EDGE_PADDING + EVENT_SPACING / 2 + i * EVENT_SPACING,
    side: isVertical ? (i % 2 === 0 ? 'left' : 'right') : i % 2 === 0 ? 'top' : 'bottom',
  }));

  // --- Styles ---

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
    color: 'var(--glyph-text, #1a2035)',
    ...(isVertical
      ? { width: '100%', minHeight: totalLength }
      : { minHeight: 300, minWidth: totalLength }),
  };

  const lineStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: LINE_THICKNESS,
        backgroundColor: 'var(--glyph-timeline-line, var(--glyph-border, #d0d8e4))',
        transform: 'translateX(-50%)',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: LINE_THICKNESS,
        backgroundColor: 'var(--glyph-timeline-line, var(--glyph-border, #d0d8e4))',
        transform: 'translateY(-50%)',
      };

  // --- Render ---

  const inner = (
    <div
      ref={containerRef}
      style={containerStyle}
      role="img"
      aria-label={`Timeline with ${events.length} events`}
    >
      {/* Central axis line */}
      <div style={lineStyle} aria-hidden="true" />

      {/* Event markers and labels */}
      {positioned.map((pe, idx) => {
        const color = colorScale(pe.event.type ?? '_default');
        const marker = eventMarker(pe.event);
        return (
          <div key={idx} style={eventContainerStyle(pe, isVertical)} aria-hidden="true">
            {/* Connector arm from axis to marker */}
            <div style={connectorStyle(isVertical)} aria-hidden="true" />

            {/* Marker dot */}
            <div
              style={{
                width: MARKER_RADIUS * 2,
                height: MARKER_RADIUS * 2,
                borderRadius: '50%',
                backgroundColor: color,
                border: '2px solid var(--glyph-timeline-marker-border, var(--glyph-bg, #f4f6fa))',
                boxShadow: '0 0 0 2px var(--glyph-border, #d0d8e4)',
                flexShrink: 0,
                zIndex: 1,
              }}
            />

            {/* Label */}
            <div style={labelStyle(pe, isVertical)}>
              {marker && (
                <div
                  style={{
                    fontSize: 'var(--glyph-timeline-date-size, 0.75rem)',
                    color: 'var(--glyph-timeline-date-color, var(--glyph-text-muted, #6b7a94))',
                    fontWeight: 600,
                  }}
                >
                  {marker}
                </div>
              )}
              <div
                style={{
                  fontSize: 'var(--glyph-timeline-title-size, 0.9rem)',
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                <RichText content={pe.event.title} />
              </div>
              {pe.event.description && (
                <div
                  style={{
                    fontSize: 'var(--glyph-timeline-desc-size, 0.8rem)',
                    color: 'var(--glyph-timeline-desc-color, var(--glyph-text-muted, #6b7a94))',
                    marginTop: 2,
                  }}
                >
                  <RichText content={pe.event.description} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ─── Screen-reader accessible fallback ────────────────── */}
      <ol
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}
      >
        {events.map((e, idx) => {
          const titleText = typeof e.title === 'string' ? e.title : 'Event';
          const descText = typeof e.description === 'string' ? e.description : '';
          const marker = eventMarker(e);
          return (
            <li key={idx}>
              {marker ? `${marker} \u2014 ` : ''}
              <strong>{titleText}</strong>
              {descText ? `: ${descText}` : ''}
            </li>
          );
        })}
      </ol>
    </div>
  );

  // Horizontal timelines use minWidth which can exceed the viewport.
  // Wrap in a scrollable parent so the content is accessible on narrow screens.
  if (!isVertical) {
    return <div style={{ overflowX: 'auto', width: '100%' }}>{inner}</div>;
  }

  return inner;
}

// ─── Style helpers ─────────────────────────────────────────────

function eventContainerStyle(pe: PositionedEvent, isVertical: boolean): React.CSSProperties {
  if (isVertical) {
    const isLeft = pe.side === 'left';
    return {
      position: 'absolute',
      top: pe.position,
      left: isLeft ? 0 : '50%',
      right: isLeft ? '50%' : 0,
      display: 'flex',
      flexDirection: isLeft ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 8,
      transform: 'translateY(-50%)',
    };
  }

  // Horizontal
  const isTop = pe.side === 'top';
  return {
    position: 'absolute',
    left: pe.position,
    top: isTop ? 0 : '50%',
    bottom: isTop ? '50%' : 0,
    display: 'flex',
    flexDirection: isTop ? 'column-reverse' : 'column',
    alignItems: 'center',
    gap: 8,
    transform: 'translateX(-50%)',
  };
}

function connectorStyle(isVertical: boolean): React.CSSProperties {
  if (isVertical) {
    return {
      flex: '0 0 20px',
      height: LINE_THICKNESS,
      backgroundColor: 'var(--glyph-timeline-line, var(--glyph-border, #d0d8e4))',
    };
  }
  return {
    flex: '0 0 20px',
    width: LINE_THICKNESS,
    backgroundColor: 'var(--glyph-timeline-line, var(--glyph-border, #d0d8e4))',
  };
}

function labelStyle(pe: PositionedEvent, isVertical: boolean): React.CSSProperties {
  if (isVertical) {
    return {
      textAlign: pe.side === 'left' ? 'right' : 'left',
      maxWidth: 200,
    };
  }
  return {
    textAlign: 'center',
    maxWidth: 160,
  };
}
