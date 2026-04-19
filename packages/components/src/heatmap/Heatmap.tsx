import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export type HeatmapScale = 'sequential' | 'diverging';

export interface HeatmapData {
  title?: string;
  rows: string[];
  cols: string[];
  values: (number | null)[][];
  scale?: HeatmapScale;
  domain?: [number, number];
  unit?: string;
  showValues?: boolean;
  legend?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────

interface ExtentResult {
  min: number;
  max: number;
}

function computeExtent(values: (number | null)[][]): ExtentResult {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const row of values) {
    for (const v of row) {
      if (v === null || Number.isNaN(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 };
  }
  if (min === max) {
    // Nudge so the color-mix ratio produces a visible value.
    return { min, max: max + 1 };
  }
  return { min, max };
}

/** Interpolation factor in [0, 1], clamped. */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  const t = (value - min) / (max - min);
  if (t < 0) return 0;
  if (t > 1) return 1;
  return t;
}

/** Parse a hex, rgb(), or rgba() CSS color string into an [r,g,b] triple (0-255). */
function parseColor(value: string): [number, number, number] | null {
  const v = value.trim();
  if (!v) return null;

  // #rgb / #rrggbb
  if (v.startsWith('#')) {
    const hex = v.slice(1);
    if (hex.length === 3) {
      const h0 = hex.charAt(0);
      const h1 = hex.charAt(1);
      const h2 = hex.charAt(2);
      const r = parseInt(h0 + h0, 16);
      const g = parseInt(h1 + h1, 16);
      const b = parseInt(h2 + h2, 16);
      if ([r, g, b].some(Number.isNaN)) return null;
      return [r, g, b];
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].some(Number.isNaN)) return null;
      return [r, g, b];
    }
    return null;
  }

  // rgb(r, g, b) / rgba(r, g, b, a) / rgb(r g b)
  const match = v.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const inside = match[1] ?? '';
    const parts = inside.split(/[\s,/]+/).filter(Boolean);
    if (parts.length >= 3) {
      const r = Math.round(Number(parts[0]));
      const g = Math.round(Number(parts[1]));
      const b = Math.round(Number(parts[2]));
      if ([r, g, b].some(Number.isNaN)) return null;
      return [r, g, b];
    }
  }

  return null;
}

/** Perceived-luminance formula (0.299*r + 0.587*g + 0.114*b). 0..255 range. */
function luminance(rgb: [number, number, number]): number {
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

/**
 * Build the `color-mix()` background for a cell.
 * - sequential: mixes `--glyph-surface` with `--glyph-palette-color-1` by t.
 * - diverging: below midpoint mixes surface with color-1 by (1 - 2t);
 *              above midpoint mixes surface with color-2 by (2t - 1).
 */
function cellBackground(t: number, scale: HeatmapScale): string {
  if (scale === 'diverging') {
    if (t < 0.5) {
      const ratio = Math.round((1 - t * 2) * 100);
      return `color-mix(in srgb, var(--glyph-palette-color-1, #00d4aa) ${String(ratio)}%, var(--glyph-surface, #e8ecf3))`;
    }
    const ratio = Math.round((t * 2 - 1) * 100);
    return `color-mix(in srgb, var(--glyph-palette-color-2, #b44dff) ${String(ratio)}%, var(--glyph-surface, #e8ecf3))`;
  }
  // sequential
  const ratio = Math.round(t * 100);
  return `color-mix(in srgb, var(--glyph-palette-color-1, #00d4aa) ${String(ratio)}%, var(--glyph-surface, #e8ecf3))`;
}

/**
 * Estimate whether a cell at interpolation factor `t` is "dark enough"
 * that it needs white text on top of it.
 *
 * We compute this from the mix of the surface and the palette endpoint(s)
 * using perceived luminance.
 */
function cellNeedsLightText(
  t: number,
  scale: HeatmapScale,
  surfaceRgb: [number, number, number],
  color1Rgb: [number, number, number],
  color2Rgb: [number, number, number],
): boolean {
  let r: number;
  let g: number;
  let b: number;
  if (scale === 'diverging') {
    if (t < 0.5) {
      const ratio = 1 - t * 2;
      r = color1Rgb[0] * ratio + surfaceRgb[0] * (1 - ratio);
      g = color1Rgb[1] * ratio + surfaceRgb[1] * (1 - ratio);
      b = color1Rgb[2] * ratio + surfaceRgb[2] * (1 - ratio);
    } else {
      const ratio = t * 2 - 1;
      r = color2Rgb[0] * ratio + surfaceRgb[0] * (1 - ratio);
      g = color2Rgb[1] * ratio + surfaceRgb[1] * (1 - ratio);
      b = color2Rgb[2] * ratio + surfaceRgb[2] * (1 - ratio);
    }
  } else {
    r = color1Rgb[0] * t + surfaceRgb[0] * (1 - t);
    g = color1Rgb[1] * t + surfaceRgb[1] * (1 - t);
    b = color1Rgb[2] * t + surfaceRgb[2] * (1 - t);
  }
  return luminance([r, g, b]) < 128;
}

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  // Show at most 2 decimals, trim trailing zeros.
  const fixed = v.toFixed(2);
  return fixed.replace(/\.?0+$/, '');
}

// ─── Styles ────────────────────────────────────────────────────

const containerStyle: CSSProperties = {
  fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
  color: 'var(--glyph-text, #1a2035)',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: 'var(--glyph-radius-md, 0.5rem)',
  background: 'var(--glyph-bg, transparent)',
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '1rem',
  padding: 'var(--glyph-spacing-md, 0.75rem) var(--glyph-spacing-md, 1rem)',
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
  color: 'var(--glyph-heading, var(--glyph-text, #0a0e1a))',
};

const scrollWrapStyle: CSSProperties = {
  overflowX: 'auto',
  padding: 'var(--glyph-spacing-md, 0.75rem)',
};

const tableStyle: CSSProperties = {
  borderCollapse: 'separate',
  borderSpacing: 2,
  fontSize: '0.8125rem',
  width: 'auto',
};

const thCornerStyle: CSSProperties = {
  padding: '0.25rem 0.5rem',
  background: 'transparent',
};

const thColStyle = (rotate: boolean): CSSProperties => ({
  padding: '0.25rem 0.5rem',
  textAlign: 'center',
  fontWeight: 600,
  color: 'var(--glyph-text-muted, #6b7a94)',
  whiteSpace: 'nowrap',
  fontSize: '0.75rem',
  verticalAlign: 'bottom',
  ...(rotate
    ? {
        height: '7rem',
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
      }
    : {}),
});

const thRowStyle: CSSProperties = {
  padding: '0.25rem 0.625rem',
  textAlign: 'right',
  fontWeight: 600,
  color: 'var(--glyph-text, #1a2035)',
  whiteSpace: 'nowrap',
  fontSize: '0.8125rem',
};

const cellStyle = (lightText: boolean): CSSProperties => ({
  minWidth: '32px',
  height: '32px',
  padding: '0.125rem 0.375rem',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: lightText ? '#ffffff' : 'var(--glyph-text, #1a2035)',
  borderRadius: 'var(--glyph-radius-sm, 3px)',
  verticalAlign: 'middle',
});

const nullCellStyle: CSSProperties = {
  minWidth: '32px',
  height: '32px',
  padding: '0.125rem 0.375rem',
  textAlign: 'center',
  fontSize: '0.75rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  borderRadius: 'var(--glyph-radius-sm, 3px)',
  backgroundImage:
    'repeating-linear-gradient(45deg, var(--glyph-border, #d0d8e4) 0 2px, var(--glyph-surface-muted, #dfe4ec) 2px 8px)',
  verticalAlign: 'middle',
};

const legendStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem var(--glyph-spacing-md, 0.75rem) var(--glyph-spacing-md, 0.75rem)',
  fontSize: '0.75rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
};

const legendBarStyle = (scale: HeatmapScale): CSSProperties => ({
  flex: '0 1 220px',
  height: '12px',
  borderRadius: '6px',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  background:
    scale === 'diverging'
      ? 'linear-gradient(to right, var(--glyph-palette-color-1, #00d4aa), var(--glyph-surface, #e8ecf3), var(--glyph-palette-color-2, #b44dff))'
      : 'linear-gradient(to right, var(--glyph-surface, #e8ecf3), var(--glyph-palette-color-1, #00d4aa))',
});

// ─── Component ─────────────────────────────────────────────────

export function Heatmap({ data, block }: GlyphComponentProps<HeatmapData>): ReactElement {
  const {
    title,
    rows,
    cols,
    values,
    scale = 'sequential',
    domain,
    unit,
    showValues = false,
    legend = true,
  } = data;
  const baseId = `glyph-heatmap-${block.id}`;

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute domain once per data change.
  const extent = domain ? { min: domain[0], max: domain[1] } : computeExtent(values);
  const { min, max } = extent;

  // Rotate column labels to vertical if any label is wider than ~8 chars.
  const rotateColLabels = cols.some((c) => c.length > 8);

  // Read theme palette colors at mount / theme change so we can decide
  // whether each cell needs light text. color-mix() is not yet queryable
  // via computed style, so we compute luminance ourselves.
  const [paletteRgb, setPaletteRgb] = useState<{
    surface: [number, number, number];
    color1: [number, number, number];
    color2: [number, number, number];
  }>({
    // Fallbacks mirror the CSS var fallbacks.
    surface: [232, 236, 243],
    color1: [0, 212, 170],
    color2: [180, 77, 255],
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const styles = getComputedStyle(el);
    const surface: [number, number, number] = parseColor(
      styles.getPropertyValue('--glyph-surface'),
    ) ?? [232, 236, 243];
    const color1: [number, number, number] = parseColor(
      styles.getPropertyValue('--glyph-palette-color-1'),
    ) ?? [0, 212, 170];
    const color2: [number, number, number] = parseColor(
      styles.getPropertyValue('--glyph-palette-color-2'),
    ) ?? [180, 77, 255];
    setPaletteRgb({ surface, color1, color2 });
  }, []);

  const unitSuffix = unit ? ` ${unit}` : '';

  return (
    <div
      id={baseId}
      ref={containerRef}
      role="region"
      aria-label={title ?? 'Heatmap'}
      style={containerStyle}
    >
      {title && <div style={headerStyle}>{title}</div>}

      <div style={scrollWrapStyle}>
        <table role="grid" style={tableStyle} aria-label={title ?? 'Heatmap'}>
          <thead>
            <tr>
              <th scope="col" style={thCornerStyle} aria-hidden="true" />
              {cols.map((col) => (
                <th key={col} scope="col" style={thColStyle(rotateColLabels)}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rowLabel, r) => (
              <tr key={rowLabel + '::' + String(r)}>
                <th scope="row" style={thRowStyle}>
                  {rowLabel}
                </th>
                {cols.map((colLabel, c) => {
                  const raw = values[r]?.[c];
                  if (raw === null || raw === undefined || Number.isNaN(raw)) {
                    return (
                      <td
                        key={colLabel + '::' + String(c)}
                        style={nullCellStyle}
                        aria-label={`${rowLabel}, ${colLabel}: no data`}
                      >
                        {showValues ? '—' : ''}
                      </td>
                    );
                  }
                  const t = normalize(raw, min, max);
                  const lightText = cellNeedsLightText(
                    t,
                    scale,
                    paletteRgb.surface,
                    paletteRgb.color1,
                    paletteRgb.color2,
                  );
                  return (
                    <td
                      key={colLabel + '::' + String(c)}
                      style={{
                        ...cellStyle(lightText),
                        background: cellBackground(t, scale),
                      }}
                      aria-label={`${rowLabel}, ${colLabel}: ${formatValue(raw)}${unitSuffix}`}
                    >
                      {showValues ? formatValue(raw) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {legend && (
        <div
          style={legendStyle}
          role="img"
          aria-label={`Color scale: ${formatValue(min)} to ${formatValue(max)}${unitSuffix}`}
        >
          <span>
            {formatValue(min)}
            {unitSuffix}
          </span>
          <div style={legendBarStyle(scale)} aria-hidden="true" />
          <span>
            {formatValue(max)}
            {unitSuffix}
          </span>
        </div>
      )}
    </div>
  );
}
