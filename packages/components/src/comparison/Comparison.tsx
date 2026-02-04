import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface ComparisonOption {
  name: string;
  description?: string;
}

export interface ComparisonFeature {
  name: string;
  values: string[];
}

export interface ComparisonData {
  title?: string;
  options: ComparisonOption[];
  features: ComparisonFeature[];
}

// ─── Value rendering ───────────────────────────────────────────

type ValueKind = 'yes' | 'no' | 'partial' | 'text';

const YES_VALUES = new Set(['yes', 'true', 'full']);
const NO_VALUES = new Set(['no', 'false', 'none']);

function classifyValue(value: string): ValueKind {
  const lower = value.toLowerCase().trim();
  if (YES_VALUES.has(lower)) return 'yes';
  if (NO_VALUES.has(lower)) return 'no';
  if (lower === 'partial') return 'partial';
  return 'text';
}

function renderValue(value: string): ReactElement {
  const kind = classifyValue(value);

  switch (kind) {
    case 'yes':
      return (
        <span
          aria-label="Supported"
          style={{ color: 'var(--glyph-comparison-yes, #16a34a)', fontSize: '1.25rem' }}
        >
          ✓
        </span>
      );
    case 'no':
      return (
        <span
          aria-label="Not supported"
          style={{ color: 'var(--glyph-comparison-no, #dc2626)', fontSize: '1.25rem' }}
        >
          ✗
        </span>
      );
    case 'partial':
      return (
        <span
          aria-label="Partially supported"
          style={{ color: 'var(--glyph-comparison-partial, #d97706)', fontSize: '1.25rem' }}
        >
          ◐
        </span>
      );
    default:
      return <span>{value}</span>;
  }
}

// ─── Component ─────────────────────────────────────────────────

export function Comparison({
  data,
  block,
  container,
  onInteraction,
}: GlyphComponentProps<ComparisonData>): ReactElement {
  const { title, options, features } = data;
  const baseId = `glyph-comparison-${block.id}`;
  const isCompact = container.tier === 'compact';

  // Container-adaptive padding/font (RFC-015)
  const cellPadding = isCompact
    ? 'var(--glyph-spacing-xs, 0.25rem) var(--glyph-spacing-sm, 0.5rem)'
    : 'var(--glyph-spacing-sm, 0.5rem) var(--glyph-spacing-md, 1rem)';

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
    color: 'var(--glyph-text, #1a2035)',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid var(--glyph-table-border, #d0d8e4)',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    overflow: 'hidden',
    fontSize: isCompact ? '0.8125rem' : '0.875rem',
  };

  const thStyle: React.CSSProperties = {
    padding: cellPadding,
    textAlign: 'center',
    fontWeight: 600,
    background: 'var(--glyph-table-header-bg, #e8ecf3)',
    borderBottom: '2px solid var(--glyph-table-border, #d0d8e4)',
    color: 'var(--glyph-heading, #0a0e1a)',
  };

  const featureThStyle: React.CSSProperties = {
    ...thStyle,
    textAlign: 'left',
  };

  const rowThStyle: React.CSSProperties = {
    padding: cellPadding,
    textAlign: 'left',
    fontWeight: 600,
    borderBottom: '1px solid var(--glyph-table-border, #d0d8e4)',
    fontSize: '0.8125rem',
  };

  const cellStyle = (rowIndex: number): React.CSSProperties => ({
    padding: cellPadding,
    textAlign: 'center',
    borderBottom: '1px solid var(--glyph-table-border, #d0d8e4)',
    background: rowIndex % 2 === 1 ? 'var(--glyph-table-row-alt-bg, transparent)' : 'transparent',
  });

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Comparison'} style={containerStyle}>
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
      <div style={{ overflowX: 'auto' }}>
        <table role="grid" style={tableStyle}>
          <thead>
            <tr>
              <th style={featureThStyle} scope="col">
                Feature
              </th>
              {options.map((option, i) => (
                <th
                  key={i}
                  style={{
                    ...thStyle,
                    ...(onInteraction ? { cursor: 'pointer' } : {}),
                  }}
                  scope="col"
                  onClick={
                    onInteraction
                      ? () => {
                          onInteraction({
                            kind: 'comparison-select',
                            timestamp: new Date().toISOString(),
                            blockId: block.id,
                            blockType: block.type,
                            payload: {
                              optionIndex: i,
                              optionName: option.name,
                            },
                          });
                        }
                      : undefined
                  }
                >
                  <div>{option.name}</div>
                  {option.description && (
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: '0.75rem',
                        color: 'var(--glyph-text-muted, #6b7a94)',
                      }}
                    >
                      {option.description}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, rowIndex) => (
              <tr key={rowIndex}>
                <th
                  scope="row"
                  style={{
                    ...rowThStyle,
                    background:
                      rowIndex % 2 === 1
                        ? 'var(--glyph-table-row-alt-bg, transparent)'
                        : 'transparent',
                  }}
                >
                  {feature.name}
                </th>
                {options.map((_, colIndex) => {
                  const value = feature.values[colIndex] ?? '';
                  return (
                    <td key={colIndex} style={cellStyle(rowIndex)}>
                      {value ? renderValue(value) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
