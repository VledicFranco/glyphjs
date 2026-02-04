import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface StatItem {
  type: 'stat';
  label: string;
  value: string;
  description?: string;
}

export interface FactItem {
  type: 'fact';
  icon?: string;
  text: string;
}

export interface ProgressItem {
  type: 'progress';
  label: string;
  value: number;
  color?: string;
}

export interface TextItem {
  type: 'text';
  content: string;
}

export interface PieSlice {
  label: string;
  value: number;
  color?: string;
}

export interface PieItem {
  type: 'pie';
  label?: string;
  slices: PieSlice[];
  donut?: boolean;
  size?: number;
}

export interface DividerItem {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface RatingItem {
  type: 'rating';
  label: string;
  value: number;
  max?: number;
  description?: string;
}

export type InfographicItem =
  | StatItem
  | FactItem
  | ProgressItem
  | TextItem
  | PieItem
  | DividerItem
  | RatingItem;

export interface InfographicSection {
  heading?: string;
  items: InfographicItem[];
}

export interface InfographicData {
  title?: string;
  sections: InfographicSection[];
}

// ─── Helpers ───────────────────────────────────────────────────

interface ItemGroup {
  type: string;
  items: InfographicItem[];
}

function groupConsecutiveItems(items: InfographicItem[]): ItemGroup[] {
  const groups: ItemGroup[] = [];
  for (const item of items) {
    const last = groups.length > 0 ? groups[groups.length - 1] : undefined;
    if (last && last.type === item.type) {
      last.items.push(item);
    } else {
      groups.push({ type: item.type, items: [item] });
    }
  }
  return groups;
}

const PROGRESS_COLORS = [
  'var(--glyph-infographic-color-1, #3b82f6)',
  'var(--glyph-infographic-color-2, #22c55e)',
  'var(--glyph-infographic-color-3, #f59e0b)',
  'var(--glyph-infographic-color-4, #ef4444)',
];

// ─── Sub-renderers ─────────────────────────────────────────────

function renderStatGroup(items: StatItem[], keyPrefix: string): ReactElement {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--glyph-spacing-md, 1rem)',
  };

  const statStyle: React.CSSProperties = {
    flex: '1 1 120px',
    minWidth: 0,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--glyph-infographic-value-color, #1d4ed8)',
    lineHeight: 1.2,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: 'var(--glyph-infographic-label-color, #475569)',
    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
  };

  const descStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--glyph-infographic-desc-color, #64748b)',
    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
    fontStyle: 'italic',
  };

  return (
    <div style={rowStyle} data-group="stat" key={keyPrefix}>
      {items.map((item, i) => (
        <div key={`${keyPrefix}-${String(i)}`} style={statStyle}>
          <div style={valueStyle}>{item.value}</div>
          <div style={labelStyle}>{item.label}</div>
          {item.description && <div style={descStyle}>{item.description}</div>}
        </div>
      ))}
    </div>
  );
}

function renderProgressGroup(
  items: ProgressItem[],
  keyPrefix: string,
  colorOffset: number,
): ReactElement {
  const trackStyle: React.CSSProperties = {
    height: '0.5rem',
    borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
    background: 'var(--glyph-infographic-track, #e0e4ea)',
    overflow: 'hidden',
  };

  return (
    <div data-group="progress" key={keyPrefix}>
      {items.map((item, i) => {
        const colorIndex = (colorOffset + i) % PROGRESS_COLORS.length;
        const fillColor = item.color ?? PROGRESS_COLORS[colorIndex];

        const fillStyle: React.CSSProperties = {
          height: '100%',
          width: `${String(item.value)}%`,
          borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
          background: fillColor,
          transition: 'width 0.3s ease',
        };

        return (
          <div
            key={`${keyPrefix}-${String(i)}`}
            style={{ marginBottom: 'var(--glyph-spacing-sm, 0.5rem)' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 'var(--glyph-spacing-xs, 0.25rem)',
                fontSize: '0.875rem',
              }}
            >
              <span style={{ color: 'var(--glyph-text, #1a2035)', fontWeight: 600 }}>
                {item.label}
              </span>
              <span
                style={{
                  color: 'var(--glyph-infographic-value-color, #1d4ed8)',
                  fontWeight: 700,
                }}
              >
                {String(item.value)}%
              </span>
            </div>
            <div style={trackStyle}>
              <div
                role="progressbar"
                aria-valuenow={item.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.label}: ${String(item.value)}%`}
                style={fillStyle}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderFactGroup(items: FactItem[], keyPrefix: string): ReactElement {
  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  };

  const itemStyle: React.CSSProperties = {
    padding: 'var(--glyph-spacing-xs, 0.25rem) 0',
    fontSize: '0.875rem',
    color: 'var(--glyph-text, #1a2035)',
    fontWeight: 500,
  };

  return (
    <ul style={listStyle} data-group="fact" key={keyPrefix}>
      {items.map((item, i) => (
        <li key={`${keyPrefix}-${String(i)}`} style={itemStyle}>
          {item.icon && (
            <span
              style={{
                marginRight: 'var(--glyph-spacing-xs, 0.25rem)',
                color: 'var(--glyph-infographic-accent, #3b82f6)',
              }}
              aria-hidden="true"
            >
              {item.icon}
            </span>
          )}
          {item.text}
        </li>
      ))}
    </ul>
  );
}

function renderTextGroup(items: TextItem[], keyPrefix: string): ReactElement {
  const pStyle: React.CSSProperties = {
    margin: '0 0 var(--glyph-spacing-sm, 0.5rem) 0',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: 'var(--glyph-text, #1a2035)',
    borderLeft: '3px solid var(--glyph-infographic-accent, #3b82f6)',
    paddingLeft: 'var(--glyph-spacing-sm, 0.5rem)',
  };

  return (
    <div data-group="text" key={keyPrefix}>
      {items.map((item, i) => (
        <p key={`${keyPrefix}-${String(i)}`} style={pStyle}>
          {item.content}
        </p>
      ))}
    </div>
  );
}

function renderPieGroup(items: PieItem[], keyPrefix: string, colorOffset: number): ReactElement {
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--glyph-spacing-md, 1rem)',
  };

  return (
    <div style={wrapperStyle} data-group="pie" key={keyPrefix}>
      {items.map((item, i) => {
        const size = item.size ?? 160;
        const outerRadius = size / 2;
        const innerRadius = (item.donut ?? true) ? outerRadius * 0.55 : 0;
        const cx = outerRadius;
        const cy = outerRadius;
        const total = item.slices.reduce((sum, s) => sum + s.value, 0);

        let cumAngle = -Math.PI / 2;
        const paths: ReactElement[] = [];

        for (let si = 0; si < item.slices.length; si++) {
          const slice = item.slices[si];
          if (!slice) continue;
          const sliceAngle = (slice.value / total) * 2 * Math.PI;
          const startAngle = cumAngle;
          const endAngle = cumAngle + sliceAngle;
          cumAngle = endAngle;

          const sliceColorIndex = (colorOffset + si) % PROGRESS_COLORS.length;
          const fillColor = slice.color ?? PROGRESS_COLORS[sliceColorIndex];

          const x1 = cx + outerRadius * Math.cos(startAngle);
          const y1 = cy + outerRadius * Math.sin(startAngle);
          const x2 = cx + outerRadius * Math.cos(endAngle);
          const y2 = cy + outerRadius * Math.sin(endAngle);
          const largeArc = sliceAngle > Math.PI ? 1 : 0;

          let d: string;
          if (innerRadius > 0) {
            const ix1 = cx + innerRadius * Math.cos(endAngle);
            const iy1 = cy + innerRadius * Math.sin(endAngle);
            const ix2 = cx + innerRadius * Math.cos(startAngle);
            const iy2 = cy + innerRadius * Math.sin(startAngle);
            d = [
              `M ${String(x1)} ${String(y1)}`,
              `A ${String(outerRadius)} ${String(outerRadius)} 0 ${String(largeArc)} 1 ${String(x2)} ${String(y2)}`,
              `L ${String(ix1)} ${String(iy1)}`,
              `A ${String(innerRadius)} ${String(innerRadius)} 0 ${String(largeArc)} 0 ${String(ix2)} ${String(iy2)}`,
              'Z',
            ].join(' ');
          } else {
            d = [
              `M ${String(cx)} ${String(cy)}`,
              `L ${String(x1)} ${String(y1)}`,
              `A ${String(outerRadius)} ${String(outerRadius)} 0 ${String(largeArc)} 1 ${String(x2)} ${String(y2)}`,
              'Z',
            ].join(' ');
          }

          paths.push(<path key={si} d={d} fill={fillColor} />);
        }

        const ariaLabel = item.label
          ? `${item.label}: ${item.slices.map((s) => `${s.label} ${String(s.value)}`).join(', ')}`
          : `Pie chart: ${item.slices.map((s) => `${s.label} ${String(s.value)}`).join(', ')}`;

        const legendStyle: React.CSSProperties = {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--glyph-spacing-sm, 0.5rem)',
          marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
          fontSize: '0.75rem',
          color: 'var(--glyph-text-muted, #6b7a94)',
        };

        return (
          <div key={`${keyPrefix}-${String(i)}`} style={{ textAlign: 'center' }}>
            {item.label && (
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--glyph-infographic-heading-color, #1e293b)',
                  marginBottom: 'var(--glyph-spacing-xs, 0.25rem)',
                }}
              >
                {item.label}
              </div>
            )}
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${String(size)} ${String(size)}`}
              role="img"
              aria-label={ariaLabel}
            >
              {paths}
            </svg>
            <div style={legendStyle}>
              {item.slices.map((slice, si) => {
                const sliceColorIndex = (colorOffset + si) % PROGRESS_COLORS.length;
                const legendColor = slice.color ?? PROGRESS_COLORS[sliceColorIndex];
                return (
                  <span
                    key={si}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '0.625rem',
                        height: '0.625rem',
                        borderRadius: '2px',
                        background: legendColor,
                      }}
                      aria-hidden="true"
                    />
                    {slice.label}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderDividerGroup(items: DividerItem[], keyPrefix: string): ReactElement {
  return (
    <div data-group="divider" key={keyPrefix}>
      {items.map((item, i) => (
        <hr
          key={`${keyPrefix}-${String(i)}`}
          role="separator"
          style={{
            border: 'none',
            borderTop: `1px ${item.style ?? 'solid'} var(--glyph-infographic-section-divider, #d0d8e4)`,
            margin: 'var(--glyph-spacing-sm, 0.5rem) 0',
          }}
        />
      ))}
    </div>
  );
}

function renderRatingGroup(items: RatingItem[], keyPrefix: string): ReactElement {
  const starColor = 'var(--glyph-infographic-star, #f59e0b)';
  const emptyColor = 'var(--glyph-text-muted, #6b7a94)';

  return (
    <div data-group="rating" key={keyPrefix}>
      {items.map((item, i) => {
        const max = item.max ?? 5;
        const fullStars = Math.floor(item.value);
        const hasHalf = item.value - fullStars >= 0.5;

        const stars: ReactElement[] = [];
        for (let s = 0; s < max; s++) {
          if (s < fullStars) {
            stars.push(
              <span key={s} style={{ color: starColor }} aria-hidden="true">
                {'\u2605'}
              </span>,
            );
          } else if (s === fullStars && hasHalf) {
            stars.push(
              <span
                key={s}
                style={{ position: 'relative', display: 'inline-block' }}
                aria-hidden="true"
              >
                <span style={{ color: emptyColor }}>{'\u2605'}</span>
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    overflow: 'hidden',
                    width: '50%',
                    color: starColor,
                  }}
                >
                  {'\u2605'}
                </span>
              </span>,
            );
          } else {
            stars.push(
              <span key={s} style={{ color: emptyColor }} aria-hidden="true">
                {'\u2605'}
              </span>,
            );
          }
        }

        return (
          <div
            key={`${keyPrefix}-${String(i)}`}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 'var(--glyph-spacing-sm, 0.5rem)',
              marginBottom: 'var(--glyph-spacing-sm, 0.5rem)',
            }}
          >
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--glyph-heading, #0a0e1a)',
                lineHeight: 1,
              }}
            >
              {String(item.value)}
            </span>
            <div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--glyph-text, #1a2035)',
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
              <div
                style={{ fontSize: '1.125rem', letterSpacing: '0.05em' }}
                aria-label={`${String(item.value)} out of ${String(max)} stars`}
              >
                {stars}
              </div>
              {item.description && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--glyph-infographic-desc-color, #64748b)',
                    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
                    fontStyle: 'italic',
                  }}
                >
                  {item.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────

export function Infographic({ data, block }: GlyphComponentProps<InfographicData>): ReactElement {
  const { title, sections } = data;
  const baseId = `glyph-infographic-${block.id}`;

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
    color: 'var(--glyph-text, #1a2035)',
    background: 'var(--glyph-surface, #e8ecf3)',
    border: '1px solid var(--glyph-border, #d0d8e4)',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    padding: 'var(--glyph-spacing-md, 1rem)',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--glyph-font-heading, system-ui, sans-serif)',
    fontWeight: 700,
    fontSize: '1.25rem',
    color: 'var(--glyph-heading, #0a0e1a)',
    margin: 0,
    paddingBottom: 'var(--glyph-spacing-sm, 0.5rem)',
    marginBottom: 'var(--glyph-spacing-md, 1rem)',
    borderBottom: '2px solid var(--glyph-infographic-accent, #3b82f6)',
  };

  const sectionDividerStyle: React.CSSProperties = {
    borderTop: '1px solid var(--glyph-infographic-section-divider, #d0d8e4)',
    paddingTop: 'var(--glyph-spacing-md, 1rem)',
    marginTop: 'var(--glyph-spacing-md, 1rem)',
  };

  const headingStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--glyph-infographic-heading-color, #1e293b)',
    marginBottom: 'var(--glyph-spacing-sm, 0.5rem)',
    borderLeft: '3px solid var(--glyph-infographic-accent, #3b82f6)',
    paddingLeft: 'var(--glyph-spacing-sm, 0.5rem)',
  };

  let progressColorOffset = 0;

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Infographic'} style={containerStyle}>
      {title && <div style={titleStyle}>{title}</div>}
      {sections.map((section, si) => {
        const groups = groupConsecutiveItems(section.items);

        return (
          <div key={si} style={si > 0 ? sectionDividerStyle : undefined}>
            {section.heading && <div style={headingStyle}>{section.heading}</div>}
            {groups.map((group, gi) => {
              const key = `s${String(si)}-g${String(gi)}`;
              switch (group.type) {
                case 'stat':
                  return renderStatGroup(group.items as StatItem[], key);
                case 'progress': {
                  const el = renderProgressGroup(
                    group.items as ProgressItem[],
                    key,
                    progressColorOffset,
                  );
                  progressColorOffset += group.items.length;
                  return el;
                }
                case 'fact':
                  return renderFactGroup(group.items as FactItem[], key);
                case 'text':
                  return renderTextGroup(group.items as TextItem[], key);
                case 'pie': {
                  const el = renderPieGroup(group.items as PieItem[], key, progressColorOffset);
                  progressColorOffset += (group.items as PieItem[]).reduce(
                    (sum, item) => sum + item.slices.length,
                    0,
                  );
                  return el;
                }
                case 'divider':
                  return renderDividerGroup(group.items as DividerItem[], key);
                case 'rating':
                  return renderRatingGroup(group.items as RatingItem[], key);
                default:
                  return null;
              }
            })}
          </div>
        );
      })}
    </div>
  );
}
