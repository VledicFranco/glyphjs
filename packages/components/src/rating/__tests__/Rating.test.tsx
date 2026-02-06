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

  // Markdown rendering tests
  it('renders plain text in label when markdown=false', () => {
    const props = createMockProps<RatingData>(
      {
        items: [{ label: 'Plain text **not bold**' }],
        markdown: false,
      },
      'ui:rating',
    );
    render(<Rating {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted label when label is InlineNode[]', () => {
    const props = createMockProps<RatingData>(
      {
        items: [
          {
            label: [
              { type: 'text', value: 'This is ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
              { type: 'text', value: ' and ' },
              { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
            ],
          },
        ],
        markdown: true,
      },
      'ui:rating',
    );
    render(<Rating {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in label even when markdown=true (backward compat)', () => {
    const props = createMockProps<RatingData>(
      {
        items: [{ label: 'Plain string' }],
        markdown: true,
      },
      'ui:rating',
    );
    render(<Rating {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] label', () => {
    const props = createMockProps<RatingData>(
      {
        items: [
          {
            label: [
              { type: 'text', value: 'Visit ' },
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ type: 'text', value: 'our site' }],
              },
            ],
          },
        ],
        markdown: true,
      },
      'ui:rating',
    );
    render(<Rating {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders formatted description when description is InlineNode[]', () => {
    const props = createMockProps<RatingData>(
      {
        items: [
          {
            label: 'Quality',
            description: [
              { type: 'text', value: 'Description with ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
            ],
          },
        ],
        markdown: true,
      },
      'ui:rating',
    );
    render(<Rating {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');
  });
});
