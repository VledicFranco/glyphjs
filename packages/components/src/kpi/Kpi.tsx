import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface KpiMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  sentiment?: 'positive' | 'negative' | 'neutral';
  unit?: string;
}

export interface KpiData {
  title?: string;
  metrics: KpiMetric[];
  columns?: number;
}

// ─── Trend symbols ─────────────────────────────────────────────

const TREND_SYMBOLS: Record<string, string> = {
  up: '\u25B2',
  down: '\u25BC',
  flat: '\u2014',
};

// ─── Helpers ───────────────────────────────────────────────────

function resolveSentiment(metric: KpiMetric): 'positive' | 'negative' | 'neutral' {
  if (metric.sentiment) return metric.sentiment;
  if (metric.trend === 'up') return 'positive';
  if (metric.trend === 'down') return 'negative';
  return 'neutral';
}

function buildAriaLabel(metric: KpiMetric): string {
  let label = `${metric.label}: ${metric.value}`;
  if (metric.unit) label += ` ${metric.unit}`;
  if (metric.delta && metric.trend) {
    label += `, ${metric.trend} ${metric.delta}`;
  } else if (metric.delta) {
    label += `, ${metric.delta}`;
  }
  return label;
}

// ─── Component ─────────────────────────────────────────────────

export function Kpi({ data, block, container }: GlyphComponentProps<KpiData>): ReactElement {
  const { title, metrics, columns } = data;
  const baseId = `glyph-kpi-${block.id}`;
  const authorCols = columns ?? Math.min(metrics.length, 4);

  // Container-adaptive column clamping (RFC-015)
  let colCount: number;
  switch (container.tier) {
    case 'compact':
      colCount = Math.min(metrics.length, 2);
      break;
    case 'standard':
      colCount = Math.min(authorCols, 3);
      break;
    default:
      colCount = authorCols;
  }

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
    color: 'var(--glyph-text, #1a2035)',
  };

  // CSS-level defensive auto-wrap: repeat(auto-fill, minmax(max(MIN, exact-fraction), 1fr))
  // ensures at most colCount columns at wide widths, fewer on narrow viewports.
  const gapCount = colCount - 1;
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(max(120px, calc((100% - ${String(gapCount)}rem) / ${String(colCount)})), 1fr))`,
    gap: 'var(--glyph-spacing-md, 1rem)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--glyph-surface-raised, #f4f6fa)',
    border: '1px solid var(--glyph-border, #d0d8e4)',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    padding: 'var(--glyph-spacing-md, 1rem)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: 'var(--glyph-text-muted, #6b7a94)',
    marginBottom: 'var(--glyph-spacing-xs, 0.25rem)',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--glyph-heading, #0a0e1a)',
    lineHeight: 1.2,
  };

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Key metrics'} style={containerStyle}>
      {title && (
        <div
          style={{
            fontWeight: 700,
            fontSize: '1.125rem',
            marginBottom: 'var(--glyph-spacing-sm, 0.5rem)',
            color: 'var(--glyph-heading, #0a0e1a)',
          }}
        >
          {title}
        </div>
      )}
      <div style={gridStyle}>
        {metrics.map((metric, i) => {
          const sentiment = resolveSentiment(metric);

          const deltaStyle: React.CSSProperties = {
            fontSize: '0.875rem',
            marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
            color: `var(--glyph-kpi-${sentiment}, inherit)`,
          };

          return (
            <div key={i} role="group" aria-label={buildAriaLabel(metric)} style={cardStyle}>
              <div style={labelStyle}>{metric.label}</div>
              <div style={valueStyle}>
                {metric.value}
                {metric.unit && (
                  <span style={{ fontSize: '0.875rem', fontWeight: 400, marginLeft: '0.25rem' }}>
                    {metric.unit}
                  </span>
                )}
              </div>
              {(metric.delta || metric.trend) && (
                <div style={deltaStyle}>
                  {metric.trend && (
                    <span aria-hidden="true" style={{ marginRight: '0.25rem' }}>
                      {TREND_SYMBOLS[metric.trend]}
                    </span>
                  )}
                  {metric.delta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
