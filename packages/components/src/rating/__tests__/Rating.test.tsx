import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Rating } from '../Rating.js';
import type { RatingData } from '../Rating.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Rating', () => {
  it('renders items', () => {
    const props = createMockProps<RatingData>(
      { items: [{ label: 'Speed' }, { label: 'Quality' }] },
      'ui:rating',
    );
    render(<Rating {...props} />);
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
  });

  it('renders star buttons by default', () => {
    const props = createMockProps<RatingData>(
      { items: [{ label: 'Test' }], scale: 5 },
      'ui:rating',
    );
    render(<Rating {...props} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveAttribute('aria-label', '1 out of 5 stars');
  });

  it('renders number mode buttons', () => {
    const props = createMockProps<RatingData>(
      { items: [{ label: 'Test' }], scale: 5, mode: 'number' },
      'ui:rating',
    );
    render(<Rating {...props} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('fires onInteraction with allRatings on click', () => {
    const onInteraction = vi.fn();
    const props = createMockProps<RatingData>(
      { items: [{ label: 'Speed' }, { label: 'Quality' }], scale: 5 },
      'ui:rating',
    );
    render(<Rating {...props} onInteraction={onInteraction} />);

    const radios = screen.getAllByRole('radio');
    // Click the 3rd star of Speed (first item)
    fireEvent.click(radios[2]);

    expect(onInteraction).toHaveBeenCalledOnce();
    const event = onInteraction.mock.calls[0][0];
    expect(event.kind).toBe('rating-change');
    expect(event.payload.itemIndex).toBe(0);
    expect(event.payload.itemLabel).toBe('Speed');
    expect(event.payload.value).toBe(3);
    expect(event.payload.allRatings).toEqual([
      { label: 'Speed', value: 3 },
      { label: 'Quality', value: null },
    ]);
  });

  it('renders scale labels', () => {
    const props = createMockProps<RatingData>(
      {
        items: [{ label: 'Test' }],
        labels: { low: 'Poor', high: 'Excellent' },
      },
      'ui:rating',
    );
    render(<Rating {...props} />);
    expect(screen.getByText('Poor')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('ARIA radiogroup present for each item', () => {
    const props = createMockProps<RatingData>(
      { items: [{ label: 'A' }, { label: 'B' }] },
      'ui:rating',
    );
    render(<Rating {...props} />);
    const groups = screen.getAllByRole('radiogroup');
    expect(groups).toHaveLength(2);
  });

  it('renders title when provided', () => {
    const props = createMockProps<RatingData>(
      { title: 'Rate Features', items: [{ label: 'Speed' }] },
      'ui:rating',
    );
    render(<Rating {...props} />);
    expect(screen.getByText('Rate Features')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Rate Features');
  });

  it('renders item descriptions', () => {
    const props = createMockProps<RatingData>(
      { items: [{ label: 'Speed', description: 'Response time' }] },
      'ui:rating',
    );
    render(<Rating {...props} />);
    expect(screen.getByText('Response time')).toBeInTheDocument();
  });

  it('works without onInteraction', () => {
    const props = createMockProps<RatingData>({ items: [{ label: 'Test' }] }, 'ui:rating');
    render(<Rating {...props} />);
    const radios = screen.getAllByRole('radio');
    expect(() => fireEvent.click(radios[0])).not.toThrow();
  });
});
