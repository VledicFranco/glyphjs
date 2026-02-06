import type { ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';

// ─── Types ─────────────────────────────────────────────────────

export interface CardAction {
  label: string;
  url: string;
}

export interface CardItem {
  title: string;
  subtitle?: string | InlineNode[];
  image?: string;
  icon?: string;
  body?: string | InlineNode[];
  actions?: CardAction[];
}

export interface CardData {
  title?: string;
  cards: CardItem[];
  variant?: 'default' | 'outlined' | 'elevated';
  columns?: number;
  markdown?: boolean;
}

// ─── Variant styles ─────────────────────────────────────────────

function getVariantStyle(variant: 'default' | 'outlined' | 'elevated'): React.CSSProperties {
  switch (variant) {
    case 'outlined':
      return {
        border: '2px solid var(--glyph-accent, #0a9d7c)',
      };
    case 'elevated':
      return {
        border: '1px solid var(--glyph-border, #d0d8e4)',
        boxShadow: 'var(--glyph-shadow-md, 0 4px 12px rgba(0,0,0,0.15))',
      };
    default:
      return {
        border: '1px solid var(--glyph-border, #d0d8e4)',
      };
  }
}

// ─── Component ─────────────────────────────────────────────────

export function Card({ data, block, container }: GlyphComponentProps<CardData>): ReactElement {
  const { title, cards, variant = 'default', columns } = data;
  const baseId = `glyph-card-${block.id}`;
  const authorCols = columns ?? Math.min(cards.length, 3);

  // Container-adaptive column clamping (RFC-015)
  let colCount: number;
  switch (container.tier) {
    case 'compact':
      colCount = 1;
      break;
    case 'standard':
      colCount = Math.min(authorCols, 2);
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
    gridTemplateColumns: `repeat(auto-fill, minmax(max(200px, calc((100% - ${String(gapCount)}rem) / ${String(colCount)})), 1fr))`,
    gap: 'var(--glyph-spacing-md, 1rem)',
  };

  const cardBaseStyle: React.CSSProperties = {
    ...getVariantStyle(variant),
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    overflow: 'hidden',
    background: 'var(--glyph-surface, #e8ecf3)',
    display: 'flex',
    flexDirection: 'column',
  };

  const cardBodyStyle: React.CSSProperties = {
    padding: 'var(--glyph-spacing-md, 1rem)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    display: 'block',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    marginBottom: 'var(--glyph-spacing-xs, 0.25rem)',
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--glyph-heading, #0a0e1a)',
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: 'var(--glyph-text-muted, #6b7a94)',
    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginTop: 'var(--glyph-spacing-sm, 0.5rem)',
    flex: 1,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--glyph-spacing-sm, 0.5rem)',
    marginTop: 'var(--glyph-spacing-sm, 0.5rem)',
    flexWrap: 'wrap',
  };

  const linkStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--glyph-link, #0a9d7c)',
    textDecoration: 'none',
  };

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Cards'} style={containerStyle}>
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
      <div role="list" style={gridStyle}>
        {cards.map((card, i) => (
          <article key={i} role="listitem" style={cardBaseStyle}>
            {card.image && (
              <img src={card.image} alt={card.title} loading="lazy" style={imageStyle} />
            )}
            <div style={cardBodyStyle}>
              {card.icon && <div style={iconStyle}>{card.icon}</div>}
              <h3 style={titleStyle}>{card.title}</h3>
              {card.subtitle && (
                <div style={subtitleStyle}>
                  <RichText content={card.subtitle} />
                </div>
              )}
              {card.body && (
                <div style={bodyStyle}>
                  <RichText content={card.body} />
                </div>
              )}
              {card.actions && card.actions.length > 0 && (
                <div style={actionsStyle}>
                  {card.actions.map((action, j) => (
                    <a
                      key={j}
                      href={action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkStyle}
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
