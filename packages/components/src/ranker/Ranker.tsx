import { useState, useCallback, type ReactElement, type KeyboardEvent } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';
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
  label: string | InlineNode[];
  description?: string;
}

export interface RankerData {
  title?: string;
  items: RankerItemData[];
  markdown?: boolean;
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
      setItems((prevItems) => {
        const newItems = [...prevItems];
        const [moved] = newItems.splice(fromIndex, 1);
        if (!moved) return prevItems;
        newItems.splice(toIndex, 0, moved);

        if (onInteraction) {
          onInteraction({
            kind: 'ranker-reorder',
            timestamp: new Date().toISOString(),
            blockId: block.id,
            blockType: block.type,
            payload: {
              orderedItems: newItems.map((item, i) => ({
                id: item.id,
                label: typeof item.label === 'string' ? item.label : 'Item',
                rank: i + 1,
              })),
              movedItem: {
                id: moved.id,
                label: typeof moved.label === 'string' ? moved.label : 'Item',
                fromRank: fromIndex + 1,
                toRank: toIndex + 1,
              },
            },
          });
        }

        return newItems;
      });
    },
    [block.id, block.type, onInteraction],
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

      <ul role="list" aria-label={title ?? 'Rank items'} style={listStyle}>
        {items.map((item, index) => {
          const itemLabelText = typeof item.label === 'string' ? item.label : 'Item';
          return (
            <li
              key={item.id}
              role="listitem"
              aria-grabbed={grabbedIndex === index}
              aria-label={`${itemLabelText}, rank ${String(index + 1)}`}
              tabIndex={0}
              style={itemStyle(false, grabbedIndex === index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <span style={gripStyle} aria-hidden="true">
                ⠿
              </span>
              <span style={rankBadgeStyle}>{String(index + 1)}</span>
              <div style={itemContentStyle}>
                <div style={itemLabelStyle}>
                  <RichText content={item.label} />
                </div>
                {item.description && <div style={itemDescriptionStyle}>{item.description}</div>}
              </div>
            </li>
          );
        })}
      </ul>

      <div
        aria-live="assertive"
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
        {grabbedIndex !== null && items[grabbedIndex] !== undefined
          ? `${typeof items[grabbedIndex].label === 'string' ? items[grabbedIndex].label : 'Item'} grabbed, rank ${String(grabbedIndex + 1)} of ${String(items.length)}. Use arrow keys to move.`
          : ''}
      </div>
    </div>
  );
}
