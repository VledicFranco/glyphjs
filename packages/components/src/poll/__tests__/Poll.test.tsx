import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Poll } from '../Poll.js';
import type { PollData } from '../Poll.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Poll', () => {
  it('renders question and options', () => {
    const props = createMockProps<PollData>(
      { question: 'Favorite color?', options: ['Red', 'Blue', 'Green'] },
      'ui:poll',
    );
    render(<Poll {...props} />);
    expect(screen.getByText('Favorite color?')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
  });

  it('renders radio buttons in single-select mode', () => {
    const props = createMockProps<PollData>(
      { question: 'Pick one', options: ['A', 'B'] },
      'ui:poll',
    );
    render(<Poll {...props} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('renders checkboxes in multiple mode', () => {
    const props = createMockProps<PollData>(
      { question: 'Pick many', options: ['A', 'B', 'C'], multiple: true },
      'ui:poll',
    );
    render(<Poll {...props} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('fires onInteraction with correct payload on vote', () => {
    const onInteraction = vi.fn();
    const props = createMockProps<PollData>(
      { question: 'Pick one', options: ['Alpha', 'Beta'] },
      'ui:poll',
    );
    render(<Poll {...props} onInteraction={onInteraction} />);

    fireEvent.click(screen.getAllByRole('radio')[1]);
    fireEvent.click(screen.getByText('Vote'));

    expect(onInteraction).toHaveBeenCalledOnce();
    const event = onInteraction.mock.calls[0][0];
    expect(event.kind).toBe('poll-vote');
    expect(event.payload.selectedOptions).toEqual(['Beta']);
    expect(event.payload.selectedIndices).toEqual([1]);
  });

  it('shows results after voting when showResults is true', () => {
    const props = createMockProps<PollData>(
      { question: 'Pick', options: ['X', 'Y'], showResults: true },
      'ui:poll',
    );
    render(<Poll {...props} />);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getByText('Vote'));

    expect(screen.getByText(/1 vote/)).toBeInTheDocument();
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(1);
  });

  it('hides results when showResults is false', () => {
    const props = createMockProps<PollData>(
      { question: 'Pick', options: ['X', 'Y'], showResults: false },
      'ui:poll',
    );
    render(<Poll {...props} />);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getByText('Vote'));

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('ARIA roles present', () => {
    const props = createMockProps<PollData>({ question: 'Q?', options: ['A', 'B'] }, 'ui:poll');
    render(<Poll {...props} />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Poll');
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const props = createMockProps<PollData>(
      { question: 'Q?', options: ['A', 'B'], title: 'My Poll' },
      'ui:poll',
    );
    render(<Poll {...props} />);
    expect(screen.getByText('My Poll')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'My Poll');
  });

  it('works without onInteraction', () => {
    const props = createMockProps<PollData>({ question: 'Q?', options: ['A', 'B'] }, 'ui:poll');
    render(<Poll {...props} />);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    expect(() => fireEvent.click(screen.getByText('Vote'))).not.toThrow();
  });

  it('disables options after voting', () => {
    const props = createMockProps<PollData>({ question: 'Q?', options: ['A', 'B'] }, 'ui:poll');
    render(<Poll {...props} />);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getByText('Vote'));

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeDisabled();
    expect(radios[1]).toBeDisabled();
  });

  // Markdown rendering tests
  it('renders plain text in question when markdown=false', () => {
    const props = createMockProps<PollData>(
      {
        question: 'Plain text **not bold**',
        options: ['A', 'B'],
        markdown: false,
      },
      'ui:poll',
    );
    render(<Poll {...props} />);
    expect(screen.getByText('Plain text **not bold**')).toBeInTheDocument();
  });

  it('renders formatted question when question is InlineNode[]', () => {
    const props = createMockProps<PollData>(
      {
        question: [
          { type: 'text', value: 'This is ' },
          { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
          { type: 'text', value: ' and ' },
          { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
        ],
        options: ['A', 'B'],
        markdown: true,
      },
      'ui:poll',
    );
    render(<Poll {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in question even when markdown=true (backward compat)', () => {
    const props = createMockProps<PollData>(
      {
        question: 'Plain string',
        options: ['A', 'B'],
        markdown: true,
      },
      'ui:poll',
    );
    render(<Poll {...props} />);
    expect(screen.getByText('Plain string')).toBeInTheDocument();
  });

  it('renders links in InlineNode[] question', () => {
    const props = createMockProps<PollData>(
      {
        question: [
          { type: 'text', value: 'Visit ' },
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ type: 'text', value: 'our site' }],
          },
        ],
        options: ['A', 'B'],
        markdown: true,
      },
      'ui:poll',
    );
    render(<Poll {...props} />);

    const link = screen.getByRole('link', { name: 'our site' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders formatted options when options are InlineNode[]', () => {
    const props = createMockProps<PollData>(
      {
        question: 'Pick one',
        options: [
          [
            { type: 'text', value: 'Option with ' },
            { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
          ],
          'Plain option',
        ],
        markdown: true,
      },
      'ui:poll',
    );
    render(<Poll {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');
  });
});
