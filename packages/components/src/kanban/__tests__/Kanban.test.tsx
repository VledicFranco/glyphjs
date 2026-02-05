import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Kanban } from '../Kanban.js';
import type { KanbanData } from '../Kanban.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Kanban', () => {
  const defaultData: KanbanData = {
    title: 'Sprint Board',
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        cards: [
          {
            id: 'auth',
            title: 'Implement Auth',
            description: 'OAuth2 + JWT',
            priority: 'high',
            tags: ['backend'],
          },
          { id: 'dash', title: 'Build Dashboard', priority: 'medium' },
        ],
      },
      { id: 'progress', title: 'In Progress', cards: [], limit: 3 },
      { id: 'done', title: 'Done', cards: [] },
    ],
  };

  it('renders columns and cards', () => {
    const props = createMockProps<KanbanData>(defaultData, 'ui:kanban');
    render(<Kanban {...props} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Implement Auth')).toBeInTheDocument();
    expect(screen.getByText('Build Dashboard')).toBeInTheDocument();
  });

  it('renders card descriptions and tags', () => {
    const props = createMockProps<KanbanData>(defaultData, 'ui:kanban');
    render(<Kanban {...props} />);
    expect(screen.getByText('OAuth2 + JWT')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();
  });

  it('ARIA: listbox columns, option cards', () => {
    const props = createMockProps<KanbanData>(defaultData, 'ui:kanban');
    render(<Kanban {...props} />);
    const listboxes = screen.getAllByRole('listbox');
    expect(listboxes).toHaveLength(3);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
  });

  it('keyboard: Space grabs, ArrowRight moves to next column', () => {
    const onInteraction = vi.fn();
    const props = createMockProps<KanbanData>(defaultData, 'ui:kanban');
    render(<Kanban {...props} onInteraction={onInteraction} />);

    const cards = screen.getAllByRole('option');
    // Grab first card
    fireEvent.keyDown(cards[0], { key: ' ' });
    // Move right to "In Progress"
    fireEvent.keyDown(cards[0], { key: 'ArrowRight' });

    expect(onInteraction).toHaveBeenCalledOnce();
    const event = onInteraction.mock.calls[0][0];
    expect(event.kind).toBe('kanban-move');
    expect(event.payload.cardId).toBe('auth');
    expect(event.payload.sourceColumnId).toBe('todo');
    expect(event.payload.destinationColumnId).toBe('progress');
  });

  it('renders column limit indicator', () => {
    const props = createMockProps<KanbanData>(defaultData, 'ui:kanban');
    render(<Kanban {...props} />);
    expect(screen.getByText('/ 3')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const props = createMockProps<KanbanData>(defaultData, 'ui:kanban');
    render(<Kanban {...props} />);
    expect(screen.getByText('Sprint Board')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Sprint Board');
  });

  it('works without onInteraction', () => {
    const props = createMockProps<KanbanData>(defaultData, 'ui:kanban');
    render(<Kanban {...props} />);
    const cards = screen.getAllByRole('option');
    fireEvent.keyDown(cards[0], { key: ' ' });
    expect(() => fireEvent.keyDown(cards[0], { key: 'ArrowRight' })).not.toThrow();
  });

  it('card count shows in column header', () => {
    const props = createMockProps<KanbanData>(defaultData, 'ui:kanban');
    render(<Kanban {...props} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
