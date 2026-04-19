import type { CSSProperties, ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export type GaugeSentiment = 'positive' | 'neutral' | 'negative';
export type GaugeShape = 'semicircle' | 'full';

export interface GaugeZone {
  max: number;
  label?: string;
  sentiment?: GaugeSentiment;
}

export interface GaugeData {
  label: string;
  value: number;
  min?: number;
  max: number;
  unit?: string;
  zones?: GaugeZone[];
  target?: number;
  shape?: GaugeShape;
}

// ─── Geometry constants ────────────────────────────────────────

const VIEWBOX_SIZE = 200;
const CENTER_X = VIEWBOX_SIZE / 2;

// Semicircle: 180° from left (π) to right (2π) — sweeps over the top half of the circle.
// In SVG's y-down coordinate system, sin(θ) ≤ 0 for θ ∈ [π, 2π], placing arc points
// above cy (since cy + r·sin(θ) is above cy when sin is negative).
const SEMI_START_ANGLE = Math.PI;
const SEMI_END_ANGLE = 2 * Math.PI;

// Full dial: 270° arc from 7:30 (SVG angle 3π/4) clockwise to 4:30 (SVG angle 9π/4).
// Midpoint is 3π/2 (cos=0, sin=-1) → 12 o'clock top of the dial.
const FULL_START_ANGLE = (3 * Math.PI) / 4;
const FULL_END_ANGLE = FULL_START_ANGLE + (3 * Math.PI) / 2; // 9π/4

// ─── Sentiment color map ───────────────────────────────────────

const SENTIMENT_COLOR: Record<GaugeSentiment, string> = {
  positive: 'var(--glyph-color-success, #16a34a)',
  neutral: 'var(--glyph-color-warning, #d97706)',
  negative: 'var(--glyph-color-error, #dc2626)',
};

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Build an SVG elliptical-arc path from (startAngle) to (endAngle) around (cx, cy)
 * on a circle of the given radius.
 *
 * Angles are in radians, parameterized as (cx + r·cos θ, cy + r·sin θ). Because SVG's
 * y-axis grows downward, this means:
 *   θ = 0   → right (3 o'clock)
 *   θ = π/2 → BELOW cy (6 o'clock; +sin moves down)
 *   θ = π   → left (9 o'clock)
 *   θ = 3π/2→ ABOVE cy (12 o'clock; −sin moves up)
 *
 * For "over the top" arcs use angles in [π, 2π] where sin ≤ 0 throughout, placing the
 * arc above cy. The function picks the SVG sweep flag from the sign of (end − start),
 * matching the screen-clockwise direction implied by increasing θ.
 */
function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);

  const delta = endAngle - startAngle;
  const largeArc = Math.abs(delta) > Math.PI ? 1 : 0;
  // In SVG y-down, increasing θ in our parameterization (cx + r·cos θ, cy + r·sin θ)
  // traces the circle clockwise on screen (since +sin moves down). So a positive delta
  // — i.e. start angle < end angle — corresponds to clockwise sweep on screen, which
  // matches SVG's sweep-flag = 1.
  const sweep = delta >= 0 ? 1 : 0;

  return `M ${String(startX)} ${String(startY)} A ${String(radius)} ${String(radius)} 0 ${String(largeArc)} ${String(sweep)} ${String(endX)} ${String(endY)}`;
}

function clamp(value: number, lo: number, hi: number): number {
  if (value < lo) return lo;
  if (value > hi) return hi;
  return value;
}

function resolveZoneColor(zone: GaugeZone, index: number): string {
  if (zone.sentiment) return SENTIMENT_COLOR[zone.sentiment];
  const paletteIdx = (index % 10) + 1;
  return `var(--glyph-palette-color-${String(paletteIdx)}, #38bdf8)`;
}

function findZoneForValue(
  zones: GaugeZone[] | undefined,
  value: number,
  min: number,
): GaugeZone | undefined {
  if (!zones || zones.length === 0) return undefined;
  // Zones are expected sorted ascending by `max`. Defensively sort.
  const sorted = [...zones].sort((a, b) => a.max - b.max);
  let prev = min;
  for (const zone of sorted) {
    if (value >= prev && value <= zone.max) return zone;
    prev = zone.max;
  }
  // Out-of-range fallback (shouldn't happen thanks to schema validation)
  return sorted[sorted.length - 1];
}

// ─── Component ─────────────────────────────────────────────────

export function Gauge({ data, block }: GlyphComponentProps<GaugeData>): ReactElement {
  const { label, value, min = 0, max, unit, zones, target, shape = 'semicircle' } = data;

  const baseId = `glyph-gauge-${block.id}`;

  // ─── Pick angles based on shape ──────────────────────────────
  const startAngle = shape === 'full' ? FULL_START_ANGLE : SEMI_START_ANGLE;
  const endAngle = shape === 'full' ? FULL_END_ANGLE : SEMI_END_ANGLE;
  const totalSweep = endAngle - startAngle;

  // ─── Layout ──────────────────────────────────────────────────
  const cy = shape === 'semicircle' ? VIEWBOX_SIZE * 0.62 : VIEWBOX_SIZE / 2;
  const radius = shape === 'semicircle' ? VIEWBOX_SIZE * 0.42 : VIEWBOX_SIZE * 0.38;
  const strokeWidth = shape === 'semicircle' ? 22 : 18;

  // Map a scalar (in [min, max]) to an angle in [startAngle, endAngle]
  const angleFor = (v: number): number => {
    const clamped = clamp(v, min, max);
    const t = (clamped - min) / (max - min);
    return startAngle + t * totalSweep;
  };

  // ─── Zone arcs ───────────────────────────────────────────────
  const sortedZones = zones ? [...zones].sort((a, b) => a.max - b.max) : [];

  const zoneArcs = sortedZones.map((zone, i) => {
    const prevZone = i === 0 ? undefined : sortedZones[i - 1];
    const prevMax = prevZone ? prevZone.max : min;
    const zStart = angleFor(prevMax);
    const zEnd = angleFor(zone.max);
    const path = arcPath(CENTER_X, cy, radius, zStart, zEnd);
    return {
      path,
      color: resolveZoneColor(zone, i),
      label: zone.label,
    };
  });

  // Fallback: no zones → single neutral track arc
  const trackPath = arcPath(CENTER_X, cy, radius, startAngle, endAngle);

  // ─── Needle ──────────────────────────────────────────────────
  const needleAngle = angleFor(value);
  const tipLen = radius * 0.9;
  const tailLen = radius * 0.15;
  const tipX = CENTER_X + tipLen * Math.cos(needleAngle);
  const tipY = cy + tipLen * Math.sin(needleAngle);
  const tailX = CENTER_X - tailLen * Math.cos(needleAngle);
  const tailY = cy - tailLen * Math.sin(needleAngle);

  // ─── Target marker ───────────────────────────────────────────
  let targetMarker: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (typeof target === 'number' && target >= min && target <= max) {
    const tAngle = angleFor(target);
    const inner = radius - strokeWidth / 2 - 4;
    const outer = radius + strokeWidth / 2 + 4;
    targetMarker = {
      x1: CENTER_X + inner * Math.cos(tAngle),
      y1: cy + inner * Math.sin(tAngle),
      x2: CENTER_X + outer * Math.cos(tAngle),
      y2: cy + outer * Math.sin(tAngle),
    };
  }

  // ─── ARIA valuetext ──────────────────────────────────────────
  const currentZone = findZoneForValue(sortedZones, value, min);
  const zoneLabelPart = currentZone?.label ? `, in ${currentZone.label} zone` : '';
  const targetPart =
    typeof target === 'number' ? ` Target: ${String(target)}${unit ? ' ' + unit : ''}.` : '';
  const valueText = `${String(value)}${unit ? ' ' + unit : ''}${zoneLabelPart}.${targetPart}`;

  // ─── Styles ──────────────────────────────────────────────────
  const containerStyle: CSSProperties = {
    fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
    color: 'var(--glyph-text, #1a2035)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--glyph-spacing-md, 1rem)',
  };

  const svgStyle: CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    height: 'auto',
    display: 'block',
  };

  const valueStyle: CSSProperties = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--glyph-text, #1a2035)',
    lineHeight: 1.1,
    textAlign: 'center',
  };

  const labelStyle: CSSProperties = {
    fontSize: '0.875rem',
    color: 'var(--glyph-text-muted, #6b7a94)',
    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
    textAlign: 'center',
  };

  const zoneLabelStyle: CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--glyph-text-muted, #6b7a94)',
    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
    textAlign: 'center',
  };

  const viewBoxHeight = shape === 'semicircle' ? VIEWBOX_SIZE * 0.72 : VIEWBOX_SIZE;

  return (
    <div
      id={baseId}
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      style={containerStyle}
    >
      <svg
        viewBox={`0 0 ${String(VIEWBOX_SIZE)} ${String(viewBoxHeight)}`}
        style={svgStyle}
        aria-hidden="true"
        data-testid="gauge-svg"
      >
        {/* Background track (when no zones) */}
        {zoneArcs.length === 0 && (
          <path
            d={trackPath}
            stroke="var(--glyph-border, #d0d8e4)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            data-testid="gauge-track"
          />
        )}

        {/* Zone arcs */}
        {zoneArcs.map((arc, i) => (
          <path
            key={i}
            d={arc.path}
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            fill="none"
            data-testid={`gauge-zone-${String(i)}`}
          />
        ))}

        {/* Target marker */}
        {targetMarker && (
          <line
            x1={targetMarker.x1}
            y1={targetMarker.y1}
            x2={targetMarker.x2}
            y2={targetMarker.y2}
            stroke="var(--glyph-accent, #3b82f6)"
            strokeWidth={3}
            strokeLinecap="round"
            data-testid="gauge-target"
          />
        )}

        {/* Needle */}
        <line
          x1={tailX}
          y1={tailY}
          x2={tipX}
          y2={tipY}
          stroke="var(--glyph-text, #1a2035)"
          strokeWidth={3}
          strokeLinecap="round"
          data-testid="gauge-needle"
        />

        {/* Needle pivot dot */}
        <circle
          cx={CENTER_X}
          cy={cy}
          r={6}
          fill="var(--glyph-text, #1a2035)"
          stroke="var(--glyph-bg, #ffffff)"
          strokeWidth={2}
          data-testid="gauge-pivot"
        />
      </svg>

      <div style={valueStyle} data-testid="gauge-value">
        {value}
        {unit && (
          <span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: '0.25rem' }}>{unit}</span>
        )}
      </div>
      <div style={labelStyle}>{label}</div>
      {currentZone?.label && (
        <div style={zoneLabelStyle} data-testid="gauge-zone-label">
          {currentZone.label}
        </div>
      )}
    </div>
  );
}
