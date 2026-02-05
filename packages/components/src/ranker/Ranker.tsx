import { useState, useCallback, type ReactElement, type KeyboardEvent } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import {
  containerStyle,
  headerStyle,
  listStyle,
  itemStyle,
  rankBadgeStyle,
  itemContentStyle,
  itemLabelStyle,
  itemDescriptionStyle,
  gripStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

export interface RankerItemData {
  id: string;
  label: string;
  description?: string;
}

export interface RankerData {
  title?: string;
  items: RankerItemData[];
}

// ─── Component ─────────────────────────────────────────────────

export function Ranker({
  data,
  block,
  onInteraction,
}: GlyphComponentProps<RankerData>): ReactElement {
  const { title, items: initialItems } = data;
  const baseId = `glyph-ranker-${block.id}`;

  const [items, setItems] = useState<RankerItemData[]>(initialItems);
  const [grabbedIndex, setGrabbedIndex] = useState<number | null>(null);

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number): void => {
      if (fromIndex === toIndex) return;
      const newItems = [...items];
      const [moved] = newItems.splice(fromIndex, 1);
      if (!moved) return;
      newItems.splice(toIndex, 0, moved);
      setItems(newItems);

      if (onInteraction) {
        onInteraction({
          kind: 'ranker-reorder',
          timestamp: new Date().toISOString(),
          blockId: block.id,
          blockType: block.type,
          payload: {
            orderedItems: newItems.map((item, i) => ({
              id: item.id,
              label: item.label,
              rank: i + 1,
            })),
            movedItem: {
              id: moved.id,
              label: moved.label,
              fromRank: fromIndex + 1,
              toRank: toIndex + 1,
            },
          },
        });
      }
    },
    [items, block.id, block.type, onInteraction],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>, index: number): void => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (grabbedIndex === null) {
        setGrabbedIndex(index);
      } else {
        setGrabbedIndex(null);
      }
    } else if (e.key === 'Escape') {
      setGrabbedIndex(null);
    } else if (e.key === 'ArrowUp' && grabbedIndex !== null) {
      e.preventDefault();
      if (grabbedIndex > 0) {
        moveItem(grabbedIndex, grabbedIndex - 1);
        setGrabbedIndex(grabbedIndex - 1);
      }
    } else if (e.key === 'ArrowDown' && grabbedIndex !== null) {
      e.preventDefault();
      if (grabbedIndex < items.length - 1) {
        moveItem(grabbedIndex, grabbedIndex + 1);
        setGrabbedIndex(grabbedIndex + 1);
      }
    }
  };

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Ranker'} style={containerStyle}>
      {title && <div style={headerStyle}>{title}</div>}

      <ul role="listbox" aria-label={title ?? 'Rank items'} style={listStyle}>
        {items.map((item, index) => (
          <li
            key={item.id}
            role="option"
            aria-selected={grabbedIndex === index}
            aria-label={`${item.label}, rank ${String(index + 1)}`}
            tabIndex={0}
            style={itemStyle(false, grabbedIndex === index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span style={gripStyle} aria-hidden="true">
              ⠿
            </span>
            <span style={rankBadgeStyle}>{String(index + 1)}</span>
            <div style={itemContentStyle}>
              <div style={itemLabelStyle}>{item.label}</div>
              {item.description && <div style={itemDescriptionStyle}>{item.description}</div>}
            </div>
          </li>
        ))}
      </ul>

      <div aria-live="assertive" style={{ position: 'absolute', left: '-9999px' }}>
        {grabbedIndex !== null &&
          `${items[grabbedIndex]?.label ?? ''} grabbed, rank ${String(grabbedIndex + 1)} of ${String(items.length)}. Use arrow keys to move.`}
      </div>
    </div>
  );
}
