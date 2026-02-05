import { useState, type ReactElement, type KeyboardEvent } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import {
  containerStyle,
  headerStyle,
  boardStyle,
  columnStyle,
  columnHeaderStyle,
  columnCountStyle,
  cardStyle,
  cardTitleStyle,
  cardDescStyle,
  tagContainerStyle,
  tagStyle,
  limitStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
}

export interface KanbanData {
  title?: string;
  columns: KanbanColumn[];
}

// ─── Component ─────────────────────────────────────────────────

export function Kanban({
  data,
  block,
  onInteraction,
}: GlyphComponentProps<KanbanData>): ReactElement {
  const { title } = data;
  const baseId = `glyph-kanban-${block.id}`;

  const [columns, setColumns] = useState<KanbanColumn[]>(data.columns);
  const [grabbed, setGrabbed] = useState<{
    cardId: string;
    columnId: string;
    cardIndex: number;
  } | null>(null);

  const moveCard = (
    cardId: string,
    sourceColId: string,
    destColId: string,
    destIndex: number,
  ): void => {
    const newColumns = columns.map((col) => ({
      ...col,
      cards: [...col.cards],
    }));

    const sourceCol = newColumns.find((c) => c.id === sourceColId);
    const destCol = newColumns.find((c) => c.id === destColId);
    if (!sourceCol || !destCol) return;

    const cardIndex = sourceCol.cards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const [card] = sourceCol.cards.splice(cardIndex, 1);
    if (!card) return;

    destCol.cards.splice(destIndex, 0, card);
    setColumns(newColumns);

    if (onInteraction) {
      onInteraction({
        kind: 'kanban-move',
        timestamp: new Date().toISOString(),
        blockId: block.id,
        blockType: block.type,
        payload: {
          cardId: card.id,
          cardTitle: card.title,
          sourceColumnId: sourceColId,
          sourceColumnTitle: sourceCol.title,
          destinationColumnId: destColId,
          destinationColumnTitle: destCol.title,
          position: destIndex,
          allColumns: newColumns.map((c) => ({
            id: c.id,
            title: c.title,
            cardIds: c.cards.map((card) => card.id),
          })),
        },
      });
    }
  };

  const handleCardKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    cardId: string,
    columnId: string,
    cardIndex: number,
  ): void => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (grabbed === null) {
        setGrabbed({ cardId, columnId, cardIndex });
      } else {
        setGrabbed(null);
      }
    } else if (e.key === 'Escape') {
      setGrabbed(null);
    } else if (grabbed && grabbed.cardId === cardId) {
      const colIndex = columns.findIndex((c) => c.id === grabbed.columnId);
      const col = columns[colIndex];
      if (!col) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (grabbed.cardIndex > 0) {
          moveCard(cardId, grabbed.columnId, grabbed.columnId, grabbed.cardIndex - 1);
          setGrabbed({ ...grabbed, cardIndex: grabbed.cardIndex - 1 });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (grabbed.cardIndex < col.cards.length - 1) {
          moveCard(cardId, grabbed.columnId, grabbed.columnId, grabbed.cardIndex + 1);
          setGrabbed({ ...grabbed, cardIndex: grabbed.cardIndex + 1 });
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (colIndex > 0) {
          const prevCol = columns[colIndex - 1];
          if (!prevCol) return;
          const newIndex = prevCol.cards.length;
          moveCard(cardId, grabbed.columnId, prevCol.id, newIndex);
          setGrabbed({ cardId, columnId: prevCol.id, cardIndex: newIndex });
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (colIndex < columns.length - 1) {
          const nextCol = columns[colIndex + 1];
          if (!nextCol) return;
          const newIndex = nextCol.cards.length;
          moveCard(cardId, grabbed.columnId, nextCol.id, newIndex);
          setGrabbed({ cardId, columnId: nextCol.id, cardIndex: newIndex });
        }
      }
    }
  };

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Kanban Board'} style={containerStyle}>
      {title && <div style={headerStyle}>{title}</div>}

      <div style={boardStyle}>
        {columns.map((col) => (
          <div key={col.id} style={columnStyle(false)}>
            <div style={columnHeaderStyle}>
              <span>{col.title}</span>
              <span style={columnCountStyle}>
                {String(col.cards.length)}
                {col.limit !== undefined && <span style={limitStyle}> / {String(col.limit)}</span>}
              </span>
            </div>

            <div role="listbox" aria-label={col.title}>
              {col.cards.map((card, cardIndex) => {
                const isGrabbed = grabbed !== null && grabbed.cardId === card.id;

                return (
                  <div
                    key={card.id}
                    role="option"
                    aria-selected={isGrabbed}
                    aria-label={`${card.title}${card.priority ? `, ${card.priority} priority` : ''}`}
                    tabIndex={0}
                    style={cardStyle(isGrabbed, card.priority)}
                    onKeyDown={(e) => handleCardKeyDown(e, card.id, col.id, cardIndex)}
                  >
                    <div style={cardTitleStyle}>{card.title}</div>
                    {card.description && <div style={cardDescStyle}>{card.description}</div>}
                    {card.tags && card.tags.length > 0 && (
                      <div style={tagContainerStyle}>
                        {card.tags.map((tag) => (
                          <span key={tag} style={tagStyle}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div aria-live="assertive" style={{ position: 'absolute', left: '-9999px' }}>
        {grabbed !== null && `Card grabbed. Use arrow keys to move between columns and positions.`}
      </div>
    </div>
  );
}
