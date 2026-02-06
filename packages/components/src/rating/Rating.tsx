import { useState, type ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';
import {
  containerStyle,
  headerStyle,
  itemStyle,
  itemLabelStyle,
  itemDescriptionStyle,
  starsContainerStyle,
  starButtonStyle,
  numberButtonStyle,
  scaleLabelsStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

export interface RatingItem {
  label: string | InlineNode[];
  description?: string | InlineNode[];
}

export interface RatingData {
  title?: string;
  scale?: number;
  mode?: 'star' | 'number';
  labels?: { low: string; high: string };
  items: RatingItem[];
  markdown?: boolean;
}

// ─── Component ─────────────────────────────────────────────────

export function Rating({
  data,
  block,
  onInteraction,
}: GlyphComponentProps<RatingData>): ReactElement {
  const { title, scale = 5, mode = 'star', labels, items } = data;
  const baseId = `glyph-rating-${block.id}`;

  const [ratings, setRatings] = useState<(number | null)[]>(() => items.map(() => null));
  const [hoveredStar, setHoveredStar] = useState<{ itemIndex: number; value: number } | null>(null);

  const handleRate = (itemIndex: number, value: number): void => {
    const newRatings = [...ratings];
    newRatings[itemIndex] = value;
    setRatings(newRatings);

    if (onInteraction) {
      const item = items[itemIndex];
      const itemLabel = item ? (typeof item.label === 'string' ? item.label : 'Item') : '';

      onInteraction({
        kind: 'rating-change',
        timestamp: new Date().toISOString(),
        blockId: block.id,
        blockType: block.type,
        payload: {
          itemIndex,
          itemLabel,
          value,
          allRatings: items.map((item, i) => ({
            label: typeof item.label === 'string' ? item.label : 'Item',
            value: i === itemIndex ? value : (newRatings[i] ?? null),
          })),
        },
      });
    }
  };

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Rating'} style={containerStyle}>
      {title && <div style={headerStyle}>{title}</div>}

      {items.map((item, itemIndex) => {
        const currentRating = ratings[itemIndex] ?? null;
        const isLast = itemIndex === items.length - 1;
        const itemLabelText = typeof item.label === 'string' ? item.label : 'Item';

        return (
          <div key={itemIndex} style={itemStyle(isLast)}>
            <div style={itemLabelStyle}>
              <RichText content={item.label} />
            </div>
            {item.description && (
              <div style={itemDescriptionStyle}>
                <RichText content={item.description} />
              </div>
            )}

            <div role="radiogroup" aria-label={`Rate ${itemLabelText}`} style={starsContainerStyle}>
              {Array.from({ length: scale }, (_, starIndex) => {
                const value = starIndex + 1;
                const isHovered =
                  hoveredStar !== null &&
                  hoveredStar.itemIndex === itemIndex &&
                  value <= hoveredStar.value;
                const isFilled = currentRating !== null && value <= currentRating;

                if (mode === 'number') {
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      role="radio"
                      aria-checked={currentRating === value}
                      aria-label={`${String(value)} out of ${String(scale)}`}
                      style={numberButtonStyle(currentRating === value)}
                      onClick={() => handleRate(itemIndex, value)}
                    >
                      {String(value)}
                    </button>
                  );
                }

                return (
                  <button
                    key={starIndex}
                    type="button"
                    role="radio"
                    aria-checked={currentRating === value}
                    aria-label={`${String(value)} out of ${String(scale)} stars`}
                    style={starButtonStyle(isFilled, isHovered)}
                    onClick={() => handleRate(itemIndex, value)}
                    onMouseEnter={() => setHoveredStar({ itemIndex, value })}
                    onMouseLeave={() => setHoveredStar(null)}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            {labels && (
              <div style={scaleLabelsStyle}>
                <span>{labels.low}</span>
                <span>{labels.high}</span>
              </div>
            )}

            <div
              aria-live="polite"
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0,0,0,0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              {currentRating !== null &&
                `${itemLabelText} rated ${String(currentRating)} out of ${String(scale)}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
