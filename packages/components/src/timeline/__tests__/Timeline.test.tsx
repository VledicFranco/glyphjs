import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Timeline } from '../Timeline.js';
import type { TimelineData } from '../Timeline.js';
import { createMockProps } from '../../__tests__/helpers.js';

// Mock D3 scale functions
vi.mock('d3', () => ({
  scaleTime: () => {
    const fn = (d: Date) => d.getTime() % 400;
    fn.domain = () => fn;
    fn.range = () => fn;
    return fn;
  },
  scaleOrdinal: () => {
    const fn = () => '#4e79a7';
    fn.domain = () => fn;
    fn.range = () => fn;
    return fn;
  },
}));

const timelineData: TimelineData = {
  events: [
    { date: '2024-01-15', title: 'Project Kickoff', description: 'Started the project' },
    { date: '2024-03-01', title: 'Beta Release', type: 'release' },
    { date: '2024-06-15', title: 'GA Launch', description: 'General availability' },
  ],
};

describe('Timeline', () => {
  it('renders a timeline container with role="img"', () => {
    const props = createMockProps<TimelineData>(timelineData, 'ui:timeline');
    render(<Timeline {...props} />);

    const container = screen.getByRole('img');
    expect(container).toBeInTheDocument();
  });

  it('has a descriptive aria-label', () => {
    const props = createMockProps<TimelineData>(timelineData, 'ui:timeline');
    render(<Timeline {...props} />);

    const container = screen.getByRole('img');
    expect(container).toHaveAttribute('aria-label', 'Timeline with 3 events');
  });

  it('renders event titles (in both visual and accessible fallback)', () => {
    const props = createMockProps<TimelineData>(timelineData, 'ui:timeline');
    render(<Timeline {...props} />);

    // Each title appears twice: once visually and once in the sr-only ordered list
    expect(screen.getAllByText('Project Kickoff')).toHaveLength(2);
    expect(screen.getAllByText('Beta Release')).toHaveLength(2);
    expect(screen.getAllByText('GA Launch')).toHaveLength(2);
  });

  it('renders an accessible ordered list fallback', () => {
    const props = createMockProps<TimelineData>(timelineData, 'ui:timeline');
    render(<Timeline {...props} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('renders list items with event information', () => {
    const props = createMockProps<TimelineData>(timelineData, 'ui:timeline');
    render(<Timeline {...props} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('renders time elements with dateTime attribute', () => {
    const props = createMockProps<TimelineData>(timelineData, 'ui:timeline');
    const { container } = render(<Timeline {...props} />);

    const timeElements = container.querySelectorAll('time');
    expect(timeElements).toHaveLength(3);
    expect(timeElements[0]).toHaveAttribute('dateTime', '2024-01-15');
  });

  it('renders event descriptions when provided', () => {
    const props = createMockProps<TimelineData>(timelineData, 'ui:timeline');
    render(<Timeline {...props} />);

    // Descriptions also appear twice (visual + accessible list)
    expect(screen.getAllByText(/Started the project/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/General availability/).length).toBeGreaterThanOrEqual(1);
  });

  // Markdown rendering tests
  it('renders plain text in title when markdown=false', () => {
    const props = createMockProps<TimelineData>(
      {
        events: [{ date: '2024-01-01', title: 'Plain text **not bold**' }],
        markdown: false,
      },
      'ui:timeline',
    );
    render(<Timeline {...props} />);
    expect(screen.getAllByText('Plain text **not bold**').length).toBeGreaterThanOrEqual(1);
  });

  it('renders formatted title when title is InlineNode[]', () => {
    const props = createMockProps<TimelineData>(
      {
        events: [
          {
            date: '2024-01-01',
            title: [
              { type: 'text', value: 'This is ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
              { type: 'text', value: ' and ' },
              { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
            ],
          },
        ],
        markdown: true,
      },
      'ui:timeline',
    );
    render(<Timeline {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');

    const italicEl = screen.getByText('italic');
    expect(italicEl.tagName).toBe('EM');
  });

  it('handles plain string in title even when markdown=true (backward compat)', () => {
    const props = createMockProps<TimelineData>(
      {
        events: [{ date: '2024-01-01', title: 'Plain string' }],
        markdown: true,
      },
      'ui:timeline',
    );
    render(<Timeline {...props} />);
    expect(screen.getAllByText('Plain string').length).toBeGreaterThanOrEqual(1);
  });

  it('renders links in InlineNode[] title', () => {
    const props = createMockProps<TimelineData>(
      {
        events: [
          {
            date: '2024-01-01',
            title: [
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
      'ui:timeline',
    );
    const { container } = render(<Timeline {...props} />);

    // Timeline visual elements are aria-hidden, so we need to query directly
    const link = container.querySelector('a[href="https://example.com"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('our site');
  });

  it('renders formatted description when description is InlineNode[]', () => {
    const props = createMockProps<TimelineData>(
      {
        events: [
          {
            date: '2024-01-01',
            title: 'Event',
            description: [
              { type: 'text', value: 'Description with ' },
              { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
            ],
          },
        ],
        markdown: true,
      },
      'ui:timeline',
    );
    render(<Timeline {...props} />);

    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');
  });
});
