import { useRef } from 'react';
import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import { scaleTime, scaleOrdinal } from 'd3';

// ─── Types ─────────────────────────────────────────────────────

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  type?: string;
}

export interface TimelineData {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
}

interface PositionedEvent {
  event: TimelineEvent;
  parsed: Date;
  position: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

// ─── Constants ─────────────────────────────────────────────────

const MARKER_RADIUS = 8;
const LINE_THICKNESS = 2;
const EVENT_SPACING_MIN = 80;

/**
 * Default color palette for event types.  The D3 ordinal scale will cycle
 * through these when assigning colors based on the event `type` field.
 */
const TYPE_PALETTE = [
  'var(--glyph-timeline-color-1, #00d4aa)',
  'var(--glyph-timeline-color-2, #b44dff)',
  'var(--glyph-timeline-color-3, #22c55e)',
  'var(--glyph-timeline-color-4, #e040fb)',
  'var(--glyph-timeline-color-5, #00e5ff)',
  'var(--glyph-timeline-color-6, #84cc16)',
  'var(--glyph-timeline-color-7, #f472b6)',
  'var(--glyph-timeline-color-8, #fb923c)',
];

// ─── Helpers ───────────────────────────────────────────────────

function parseDate(raw: string): Date {
  // Try native ISO / common formats first
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d;

  // YYYY-MM  (e.g. "2026-01")
  const ym = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (ym && ym[1] && ym[2]) return new Date(+ym[1], +ym[2] - 1, 1);

  // Q1 YYYY  or  YYYY-Q1  (quarter formats)
  const q1 = raw.match(/^Q([1-4])\s+(\d{4})$/i);
  if (q1 && q1[1] && q1[2]) return new Date(+q1[2], (+q1[1] - 1) * 3, 1);

  const q2 = raw.match(/^(\d{4})-Q([1-4])$/i);
  if (q2 && q2[1] && q2[2]) return new Date(+q2[1], (+q2[2] - 1) * 3, 1);

  // Return epoch as fallback for truly unparseable dates
  return new Date(0);
}

function formatDate(raw: string): string {
  const d = parseDate(raw);
  // If the date resolved to epoch, the input was unparseable — show original
  if (d.getTime() === 0) return raw;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isoDate(raw: string): string {
  return parseDate(raw).toISOString().slice(0, 10);
}

// ─── Component ─────────────────────────────────────────────────

/**
 * Renders an interactive timeline visualization using D3 for positioning.
 *
 * Events are placed along a central axis using a D3 time scale derived
 * from parsed event dates.  In vertical orientation events alternate
 * left / right; in horizontal orientation they flow left to right.
 *
 * Theming is controlled via CSS custom properties prefixed with
 * `--glyph-timeline-*`.
 */
export function Timeline({ data }: GlyphComponentProps<TimelineData>): ReactElement {
  const { events, orientation = 'vertical' } = data;
  const containerRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === 'vertical';

  // --- D3 scales (computed once per render) ---

  const sorted = [...events]
    .map((e) => ({ ...e, _parsed: parseDate(e.date) }))
    .sort((a, b) => a._parsed.getTime() - b._parsed.getTime());

  const dates = sorted.map((e) => e._parsed);
  const minDate = dates[0] ?? new Date();
  const maxDate = dates[dates.length - 1] ?? new Date();

  const totalLength = Math.max(sorted.length * EVENT_SPACING_MIN, 400);

  const timeScale = scaleTime()
    .domain([minDate, maxDate])
    .range([MARKER_RADIUS + 20, totalLength - MARKER_RADIUS - 20]);

  const typeValues = [...new Set(events.map((e) => e.type ?? '_default'))];
  const colorScale = scaleOrdinal<string, string>().domain(typeValues).range(TYPE_PALETTE);

  // --- Positioned events ---

  const positioned: PositionedEvent[] = sorted.map((e, i) => ({
    event: e,
    parsed: e._parsed,
    position: dates.length === 1 ? totalLength / 2 : (timeScale(e._parsed) as number),
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
        backgroundColor: 'var(--glyph-timeline-line, #d0d8e4)',
        transform: 'translateX(-50%)',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: LINE_THICKNESS,
        backgroundColor: 'var(--glyph-timeline-line, #d0d8e4)',
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
        return (
          <div key={idx} style={eventContainerStyle(pe, isVertical)} aria-hidden="true">
            {/* Connector arm from axis to marker */}
            <div style={connectorStyle(pe, isVertical)} aria-hidden="true" />

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
              <div
                style={{
                  fontSize: 'var(--glyph-timeline-date-size, 0.75rem)',
                  color: 'var(--glyph-timeline-date-color, #7a8599)',
                  fontWeight: 600,
                }}
              >
                {formatDate(pe.event.date)}
              </div>
              <div
                style={{
                  fontSize: 'var(--glyph-timeline-title-size, 0.9rem)',
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {pe.event.title}
              </div>
              {pe.event.description && (
                <div
                  style={{
                    fontSize: 'var(--glyph-timeline-desc-size, 0.8rem)',
                    color: 'var(--glyph-timeline-desc-color, #7a8599)',
                    marginTop: 2,
                  }}
                >
                  {pe.event.description}
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
        {sorted.map((e, idx) => (
          <li key={idx}>
            <time dateTime={isoDate(e.date)}>{formatDate(e.date)}</time>
            {' \u2014 '}
            <strong>{e.title}</strong>
            {e.description ? `: ${e.description}` : ''}
          </li>
        ))}
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

function connectorStyle(_pe: PositionedEvent, isVertical: boolean): React.CSSProperties {
  if (isVertical) {
    return {
      flex: '0 0 20px',
      height: LINE_THICKNESS,
      backgroundColor: 'var(--glyph-timeline-line, #d0d8e4)',
    };
  }
  return {
    flex: '0 0 20px',
    width: LINE_THICKNESS,
    backgroundColor: 'var(--glyph-timeline-line, #d0d8e4)',
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
