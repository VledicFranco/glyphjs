import { useState, type ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
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
  label: string;
  description?: string;
}

export interface RatingData {
  title?: string;
  scale?: number;
  mode?: 'star' | 'number';
  labels?: { low: string; high: string };
  items: RatingItem[];
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
      onInteraction({
        kind: 'rating-change',
        timestamp: new Date().toISOString(),
        blockId: block.id,
        blockType: block.type,
        payload: {
          itemIndex,
          itemLabel: items[itemIndex]?.label ?? '',
          value,
          allRatings: items.map((item, i) => ({
            label: item.label,
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

        return (
          <div key={itemIndex} style={itemStyle(isLast)}>
            <div style={itemLabelStyle}>{item.label}</div>
            {item.description && <div style={itemDescriptionStyle}>{item.description}</div>}

            <div role="radiogroup" aria-label={`Rate ${item.label}`} style={starsContainerStyle}>
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
                `${item.label} rated ${String(currentRating)} out of ${String(scale)}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
