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
});
