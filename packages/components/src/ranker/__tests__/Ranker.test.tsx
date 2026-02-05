import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Ranker } from '../Ranker.js';
import type { RankerData } from '../Ranker.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Ranker', () => {
  const defaultItems = [
    { id: 'a', label: 'Alpha', description: 'First item' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma' },
  ];

  it('renders all items with rank badges', () => {
    const props = createMockProps<RankerData>({ items: defaultItems }, 'ui:ranker');
    render(<Ranker {...props} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders item descriptions', () => {
    const props = createMockProps<RankerData>({ items: defaultItems }, 'ui:ranker');
    render(<Ranker {...props} />);
    expect(screen.getByText('First item')).toBeInTheDocument();
  });

  it('has listbox and option ARIA roles', () => {
    const props = createMockProps<RankerData>({ items: defaultItems }, 'ui:ranker');
    render(<Ranker {...props} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('keyboard: Space grabs, ArrowDown moves, Space drops', () => {
    const onInteraction = vi.fn();
    const props = createMockProps<RankerData>({ items: defaultItems }, 'ui:ranker');
    render(<Ranker {...props} onInteraction={onInteraction} />);

    const options = screen.getAllByRole('option');
    // Grab first item
    fireEvent.keyDown(options[0], { key: ' ' });
    // Move down
    fireEvent.keyDown(options[0], { key: 'ArrowDown' });

    expect(onInteraction).toHaveBeenCalledOnce();
    const event = onInteraction.mock.calls[0][0];
    expect(event.kind).toBe('ranker-reorder');
    expect(event.payload.movedItem.id).toBe('a');
    expect(event.payload.movedItem.fromRank).toBe(1);
    expect(event.payload.movedItem.toRank).toBe(2);
  });

  it('Escape cancels grab', () => {
    const props = createMockProps<RankerData>({ items: defaultItems }, 'ui:ranker');
    render(<Ranker {...props} />);
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[0], { key: ' ' });
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(options[0], { key: 'Escape' });
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('renders title when provided', () => {
    const props = createMockProps<RankerData>(
      { title: 'Rank by priority', items: defaultItems },
      'ui:ranker',
    );
    render(<Ranker {...props} />);
    expect(screen.getByText('Rank by priority')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Rank by priority');
  });

  it('works without onInteraction', () => {
    const props = createMockProps<RankerData>({ items: defaultItems }, 'ui:ranker');
    render(<Ranker {...props} />);
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[0], { key: ' ' });
    expect(() => fireEvent.keyDown(options[0], { key: 'ArrowDown' })).not.toThrow();
  });
});
