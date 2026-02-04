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

export type InfographicItem = StatItem | FactItem | ProgressItem | TextItem;

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
    color: 'var(--glyph-heading, #0a0e1a)',
    lineHeight: 1.2,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: 'var(--glyph-text-muted, #6b7a94)',
    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
  };

  const descStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--glyph-text-muted, #6b7a94)',
    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
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
              <span style={{ color: 'var(--glyph-text, #1a2035)' }}>{item.label}</span>
              <span style={{ color: 'var(--glyph-text-muted, #6b7a94)' }}>
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
  };

  return (
    <ul style={listStyle} data-group="fact" key={keyPrefix}>
      {items.map((item, i) => (
        <li key={`${keyPrefix}-${String(i)}`} style={itemStyle}>
          {item.icon && (
            <span style={{ marginRight: 'var(--glyph-spacing-xs, 0.25rem)' }} aria-hidden="true">
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
    fontWeight: 700,
    fontSize: '1.25rem',
    color: 'var(--glyph-heading, #0a0e1a)',
    marginBottom: 'var(--glyph-spacing-md, 1rem)',
    margin: 0,
  };

  const sectionDividerStyle: React.CSSProperties = {
    borderTop: '1px solid var(--glyph-infographic-section-divider, #d0d8e4)',
    paddingTop: 'var(--glyph-spacing-md, 1rem)',
    marginTop: 'var(--glyph-spacing-md, 1rem)',
  };

  const headingStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--glyph-heading, #0a0e1a)',
    marginBottom: 'var(--glyph-spacing-sm, 0.5rem)',
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
